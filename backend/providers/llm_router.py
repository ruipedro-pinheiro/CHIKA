"""LiteLLM Router - Universal LLM Gateway with Mock Fallback + OAuth Support"""
from typing import List, Dict, Optional, AsyncGenerator, TYPE_CHECKING
import litellm
from config import settings
from providers.mock_llm import MockLLM

if TYPE_CHECKING:
    from auth.token_store import TokenStore
    from auth.oauth_refresh import OAuthRefresher

class LLMRouter:
    """Universal LLM router with fallback to mock (for dev/testing) + OAuth support"""
    
    def __init__(
        self, 
        token_store: Optional['TokenStore'] = None,
        oauth_refresher: Optional['OAuthRefresher'] = None
    ):
        litellm.set_verbose = False
        self.token_store = token_store  # OAuth token store
        self.oauth_refresher = oauth_refresher  # Auto-refresh helper
        self.deployments = self._build_deployments()
        self.mock = MockLLM()  # Always available fallback
    
    def _build_deployments(self) -> List[Dict]:
        """Build list of available LLM deployments (API keys OR OAuth tokens)"""
        deployments = []
        
        # 1. Ollama (local) - Only if configured
        if settings.ollama_base_url and settings.ollama_model:
            deployments.append({
                "name": "ollama",
                "model": f"ollama/{settings.ollama_model}",
                "api_base": settings.ollama_base_url,
                "priority": 1,
                "enabled": True
            })
        
        # 2. Claude (API key OR OAuth)
        claude_key = settings.anthropic_api_key
        if not claude_key and self.token_store:
            claude_key = self.token_store.get_token("anthropic")
        
        if claude_key:
            deployments.append({
                "name": "claude",
                "model": "claude-3-5-sonnet-20241022",
                "api_key": claude_key,
                "priority": 2,
                "enabled": True,
                "oauth": self.token_store and self.token_store.is_token_valid("anthropic")
            })
        
        # 3. GPT-4 (API key OR OAuth)
        openai_key = settings.openai_api_key
        if not openai_key and self.token_store:
            openai_key = self.token_store.get_token("openai")
        
        if openai_key:
            deployments.append({
                "name": "gpt",
                "model": "gpt-4-turbo-preview",
                "api_key": openai_key,
                "priority": 3,
                "enabled": True,
                "oauth": self.token_store and self.token_store.is_token_valid("openai")
            })
        
        # 4. Gemini (API key OR OAuth)
        google_key = settings.google_api_key
        if not google_key and self.token_store:
            google_key = self.token_store.get_token("google")
        
        if google_key:
            deployments.append({
                "name": "gemini",
                "model": "gemini/gemini-pro",
                "api_key": google_key,
                "priority": 4,
                "enabled": True,
                "oauth": self.token_store and self.token_store.is_token_valid("google")
            })
        
        # 5. MOCK (ALWAYS AVAILABLE - Last fallback)
        deployments.append({
            "name": "mock",
            "model": "mock-ai",
            "priority": 999,
            "enabled": True,
            "oauth": False
        })
        
        return sorted([d for d in deployments if d["enabled"]], 
                     key=lambda x: x["priority"])
    
    async def chat(
        self, 
        messages: List[Dict], 
        preferred_provider: Optional[str] = None,
        stream: bool = False
    ) -> str:
        """Route chat request to best available LLM"""
        
        deployments = self.deployments
        if preferred_provider:
            deployments = sorted(
                deployments,
                key=lambda x: (0 if x["name"] == preferred_provider else 1, x["priority"])
            )
        
        # Try each deployment
        for deployment in deployments:
            try:
                # MOCK provider (error message - no real AI configured)
                if deployment["name"] == "mock":
                    return await self.mock.chat(messages)
                
                # OAuth token refresh if needed
                api_key = deployment.get("api_key")
                if deployment.get("oauth") and self.oauth_refresher:
                    provider_name = deployment["name"]
                    # Map provider name to OAuth provider
                    oauth_map = {
                        "claude": "anthropic",
                        "gpt": "openai",
                        "gemini": "google"
                    }
                    oauth_provider = oauth_map.get(provider_name)
                    if oauth_provider:
                        refreshed_token = await self.oauth_refresher.get_valid_token(oauth_provider)
                        if refreshed_token:
                            api_key = refreshed_token
                            print(f"🔑 Using refreshed OAuth token for {provider_name}")
                
                # Real LLM provider
                if stream:
                    return self._stream_response(deployment, messages)
                else:
                    response = await litellm.acompletion(
                        model=deployment["model"],
                        messages=messages,
                        api_base=deployment.get("api_base"),
                        api_key=api_key,
                        stream=False,
                        timeout=120  # 120s timeout for local models (DeepSeek-R1 is slow)
                    )
                    return response.choices[0].message.content
            
            except Exception as e:
                print(f"❌ {deployment['name']} failed: {e}")
                continue
        
        # Should never reach (mock is always last)
        return await self.mock.chat(messages)
    
    async def _stream_response(
        self, 
        deployment: Dict, 
        messages: List[Dict]
    ) -> AsyncGenerator[str, None]:
        """Stream response from LLM"""
        response = await litellm.acompletion(
            model=deployment["model"],
            messages=messages,
            api_base=deployment.get("api_base"),
            api_key=deployment.get("api_key"),
            stream=True
        )
        
        async for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    def get_available_providers(self) -> List[str]:
        """Get list of available AI providers"""
        return [d["name"] for d in self.deployments]

router = LLMRouter()
