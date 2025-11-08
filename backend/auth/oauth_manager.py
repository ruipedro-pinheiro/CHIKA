"""Universal OAuth Manager - Support for ANY AI provider with OAuth"""
import httpx
import secrets
import hashlib
import base64
from typing import Optional, Dict, Any
from urllib.parse import urlencode
from dataclasses import dataclass

@dataclass
class OAuthProvider:
    """OAuth provider configuration"""
    name: str
    authorize_url: str
    token_url: str
    client_id: str
    client_secret: Optional[str] = None
    scopes: Optional[list[str]] = None
    use_pkce: bool = True  # PKCE for security (used by Anthropic)
    
    def __post_init__(self):
        if self.scopes is None:
            self.scopes = []


class OAuthManager:
    """Universal OAuth manager for any AI provider"""
    
    # Pre-configured providers (can be extended dynamically)
    PROVIDERS = {
        "anthropic": OAuthProvider(
            name="anthropic",
            authorize_url="https://claude.ai/oauth/authorize",
            token_url="https://console.anthropic.com/v1/oauth/token",
            client_id="9d1c250a-e61b-44d9-88ed-5944d1962f5e",  # OpenCode's public client ID
            scopes=["org:create_api_key", "user:profile", "user:inference"],
            use_pkce=True
        ),
        "openai": OAuthProvider(
            name="openai",
            authorize_url="https://auth.openai.com/authorize",
            token_url="https://auth.openai.com/oauth/token",
            client_id="chika-local",  # TODO: Register Chika app
            scopes=["openid", "profile"],
            use_pkce=True
        ),
        "google": OAuthProvider(
            name="google",
            authorize_url="https://accounts.google.com/o/oauth2/v2/auth",
            token_url="https://oauth2.googleapis.com/token",
            client_id="",  # User provides
            scopes=["https://www.googleapis.com/auth/generative-language"],
            use_pkce=True
        ),
        "huggingface": OAuthProvider(
            name="huggingface",
            authorize_url="https://huggingface.co/oauth/authorize",
            token_url="https://huggingface.co/oauth/token",
            client_id="chika-local",
            scopes=["inference"],
            use_pkce=True
        ),
    }
    
    def __init__(self):
        self._pending_states: Dict[str, Dict] = {}  # state -> provider_data
    
    def add_provider(self, provider: OAuthProvider):
        """Dynamically add a new OAuth provider"""
        self.PROVIDERS[provider.name] = provider
        print(f"✅ OAuth provider '{provider.name}' registered")
    
    def generate_pkce_pair(self) -> tuple[str, str]:
        """Generate PKCE code_verifier and code_challenge"""
        # code_verifier: random 43-128 chars
        code_verifier = base64.urlsafe_b64encode(
            secrets.token_bytes(32)
        ).decode('utf-8').rstrip('=')
        
        # code_challenge: SHA256(code_verifier)
        challenge_bytes = hashlib.sha256(code_verifier.encode('utf-8')).digest()
        code_challenge = base64.urlsafe_b64encode(challenge_bytes).decode('utf-8').rstrip('=')
        
        return code_verifier, code_challenge
    
    def get_authorization_url(
        self, 
        provider_name: str, 
        redirect_uri: str,
        state: Optional[str] = None
    ) -> tuple[str, str, Optional[str]]:
        """
        Generate OAuth authorization URL for any provider
        
        Returns:
            (authorization_url, state, code_verifier)
        """
        provider = self.PROVIDERS.get(provider_name)
        if not provider:
            raise ValueError(f"Unknown OAuth provider: {provider_name}")
        
        # Generate state for CSRF protection
        if not state:
            state = secrets.token_urlsafe(32)
        
        # Generate PKCE if needed
        code_verifier = None
        params = {
            "client_id": provider.client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "state": state,
        }
        
        if provider.scopes:
            params["scope"] = " ".join(provider.scopes)
        
        if provider.use_pkce:
            code_verifier, code_challenge = self.generate_pkce_pair()
            params["code_challenge"] = code_challenge
            params["code_challenge_method"] = "S256"
            
            # Store code_verifier for token exchange
            self._pending_states[state] = {
                "provider": provider_name,
                "code_verifier": code_verifier,
                "redirect_uri": redirect_uri
            }
        
        auth_url = f"{provider.authorize_url}?{urlencode(params)}"
        return auth_url, state, code_verifier
    
    async def exchange_code_for_token(
        self, 
        provider_name: str,
        code: str,
        state: str,
        redirect_uri: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Exchange authorization code for access token (universal)
        
        Returns:
            {
                "access_token": "...",
                "refresh_token": "...",  # if available
                "expires_in": 3600,      # if available
                "token_type": "Bearer"
            }
        """
        provider = self.PROVIDERS.get(provider_name)
        if not provider:
            raise ValueError(f"Unknown OAuth provider: {provider_name}")
        
        # Anthropic special handling: code format is "code#state"
        actual_code = code
        actual_state = state
        if provider_name == "anthropic" and "#" in code:
            splits = code.split("#")
            actual_code = splits[0]
            actual_state = splits[1]
        
        # Get stored PKCE data
        pending = self._pending_states.get(actual_state)
        if not pending:
            raise ValueError("Invalid state - possible CSRF attack")
        
        if pending["provider"] != provider_name:
            raise ValueError("State mismatch")
        
        # Build token request
        token_data = {
            "grant_type": "authorization_code",
            "code": actual_code,
            "redirect_uri": redirect_uri or pending["redirect_uri"],
            "client_id": provider.client_id,
        }
        
        # Anthropic requires state in token exchange
        if provider_name == "anthropic":
            token_data["state"] = actual_state
        
        # Add PKCE verifier if used
        if provider.use_pkce:
            token_data["code_verifier"] = pending["code_verifier"]
        
        # Add client_secret if available (some providers don't need it)
        if provider.client_secret:
            token_data["client_secret"] = provider.client_secret
        
        # Exchange code for token
        async with httpx.AsyncClient() as client:
            response = await client.post(
                provider.token_url,
                data=token_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                error = response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
                raise Exception(f"Token exchange failed: {error}")
            
            token_response = response.json()
        
        # Cleanup state
        del self._pending_states[state]
        
        print(f"✅ OAuth token obtained for {provider_name}")
        return token_response
    
    async def refresh_access_token(
        self,
        provider_name: str,
        refresh_token: str
    ) -> Dict[str, Any]:
        """
        Refresh access token using refresh_token (universal)
        
        Returns:
            {
                "access_token": "...",
                "refresh_token": "...",  # new refresh token
                "expires_in": 3600
            }
        """
        provider = self.PROVIDERS.get(provider_name)
        if not provider:
            raise ValueError(f"Unknown OAuth provider: {provider_name}")
        
        refresh_data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": provider.client_id,
        }
        
        if provider.client_secret:
            refresh_data["client_secret"] = provider.client_secret
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                provider.token_url,
                data=refresh_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                error = response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
                raise Exception(f"Token refresh failed: {error}")
            
            token_response = response.json()
        
        print(f"✅ Token refreshed for {provider_name}")
        return token_response
    
    def list_providers(self) -> list[str]:
        """List all registered OAuth providers"""
        return list(self.PROVIDERS.keys())
    
    def get_provider_info(self, provider_name: str) -> Optional[Dict]:
        """Get info about a specific provider"""
        provider = self.PROVIDERS.get(provider_name)
        if not provider:
            return None
        
        return {
            "name": provider.name,
            "authorize_url": provider.authorize_url,
            "scopes": provider.scopes,
            "uses_pkce": provider.use_pkce
        }
