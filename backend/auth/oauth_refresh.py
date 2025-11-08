"""OAuth Token Auto-Refresh Helper"""
import time
from typing import Optional
from auth.oauth_manager import OAuthManager
from auth.token_store import TokenStore


class OAuthRefresher:
    """Automatically refresh OAuth tokens before expiry"""
    
    def __init__(self, oauth_manager: OAuthManager, token_store: TokenStore):
        self.oauth_manager = oauth_manager
        self.token_store = token_store
    
    async def get_valid_token(self, provider: str) -> Optional[str]:
        """
        Get valid access token for provider (auto-refresh if needed)
        
        Returns:
            Valid access token or None if not authenticated
        """
        # Try to get current token
        access_token = self.token_store.get_token(provider)
        
        # If token is valid, return it
        if access_token:
            return access_token
        
        # Token expired or missing - try to refresh
        refresh_token = self.token_store.get_refresh_token(provider)
        if not refresh_token:
            return None
        
        print(f"🔄 Refreshing {provider} OAuth token...")
        try:
            # Refresh the token
            new_tokens = await self.oauth_manager.refresh_access_token(
                provider,
                refresh_token
            )
            
            # Update token store
            self.token_store.store_token(
                provider=provider,
                access_token=new_tokens["access_token"],
                refresh_token=new_tokens.get("refresh_token", refresh_token),
                expires_in=new_tokens.get("expires_in", 3600)
            )
            
            return new_tokens["access_token"]
        
        except Exception as e:
            print(f"❌ Failed to refresh {provider} token: {e}")
            return None
    
    async def ensure_valid_token(self, provider: str) -> str:
        """
        Ensure we have a valid token (raise if not)
        
        Raises:
            ValueError: If no valid token available
        """
        token = await self.get_valid_token(provider)
        if not token:
            raise ValueError(f"No valid OAuth token for {provider}. Please authenticate.")
        return token
