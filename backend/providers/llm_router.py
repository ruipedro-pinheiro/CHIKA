"""LiteLLM Router - Universal LLM Gateway with Fallback
Supports 100+ providers: Ollama, Claude, GPT, Gemini, etc.
"""
from typing import List, Dict, Optional, AsyncGenerator
import litellm
from config import settings

class LLMRouter:
    """Universal LLM router with fallback chain
    
    Priority order:
    1. Ollama (local, free, privacy-first)
    2. Claude (cloud fallback)
    3. GPT-4 (cloud fallback)
    4. Gemini (cloud fallback)
    """
    
    def __init__(self):
        # Configure LiteLLM
        litellm.set_verbose = False
        
        # Build deployment list (sorted by priority)
        self.deployments = self._build_deployments()
    
    def _build_deployments(self) -> List[Dict]:
        """Build list of available LLM deployments"""
        deployments = []
        
        # 1. Ollama (local) - Highest priority
        deployments.append({
            "name": "ollama",
            "model": f"ollama/{settings.ollama_model}",
            "api_base": settings.ollama_base_url,
            "priority": 1,
            "cost": 0,
            "enabled": True  # Always try local first
        })
        
        # 2. Claude - Fallback
        if settings.anthropic_api_key:
            deployments.append({
                "name": "claude",
                "model": "claude-3-5-sonnet-20241022",
                "api_key": settings.anthropic_api_key,
                "priority": 2,
                "cost": 0.003,
                "enabled": True
            })
        
        # 3. GPT-4 - Fallback
        if settings.openai_api_key:
            deployments.append({
                "name": "gpt",
                "model": "gpt-4-turbo-preview",
                "api_key": settings.openai_api_key,
                "priority": 3,
                "cost": 0.01,
                "enabled": True
            })
        
        # 4. Gemini - Fallback
        if settings.google_api_key:
            deployments.append({
                "name": "gemini",
                "model": "gemini/gemini-pro",
                "api_key": settings.google_api_key,
                "priority": 4,
                "cost": 0.000125,
                "enabled": True
            })
        
        return sorted([d for d in deployments if d["enabled"]], 
                     key=lambda x: x["priority"])
    
    async def chat(
        self, 
        messages: List[Dict], 
        preferred_provider: Optional[str] = None,
        stream: bool = False
    ) -> AsyncGenerator[str, None] | str:
        """Route chat request to best available LLM
        
        Args:
            messages: Conversation history
            preferred_provider: Try this provider first (optional)
            stream: Stream response chunks
        
        Returns:
            Response text or async generator of chunks
        """
        
        # Reorder deployments if user prefers specific provider
        deployments = self.deployments
        if preferred_provider:
            deployments = sorted(
                deployments,
                key=lambda x: (0 if x["name"] == preferred_provider else 1, x["priority"])
            )
        
        # Try each deployment in order
        for deployment in deployments:
            try:
                if stream:
                    return self._stream_response(deployment, messages)
                else:
                    response = await litellm.acompletion(
                        model=deployment["model"],
                        messages=messages,
                        api_base=deployment.get("api_base"),
                        api_key=deployment.get("api_key"),
                        stream=False
                    )
                    return response.choices[0].message.content
            
            except Exception as e:
                print(f"❌ {deployment['name']} failed: {e}")
                continue  # Try next deployment
        
        # All deployments failed
        raise Exception("All LLM providers failed. Check configuration.")
    
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

# Global router instance
router = LLMRouter()
