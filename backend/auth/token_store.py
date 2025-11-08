"""Token Storage & Auto-Refresh System"""
import json
import time
from pathlib import Path
from typing import Optional, Dict
from threading import Lock
import asyncio

class TokenStore:
    """Thread-safe token storage with auto-refresh"""
    
    def __init__(self, storage_path: str = "./data/auth_tokens.json"):
        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()
        self._tokens = self._load_tokens()
    
    def _load_tokens(self) -> Dict:
        """Load tokens from disk"""
        if self.storage_path.exists():
            try:
                with open(self.storage_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ Failed to load tokens: {e}")
                return {}
        return {}
    
    def _save_tokens(self):
        """Save tokens to disk (thread-safe)"""
        with self._lock:
            try:
                with open(self.storage_path, 'w') as f:
                    json.dump(self._tokens, f, indent=2)
            except Exception as e:
                print(f"⚠️ Failed to save tokens: {e}")
    
    def store_token(
        self, 
        provider: str, 
        access_token: str, 
        refresh_token: Optional[str] = None,
        expires_in: Optional[int] = None
    ):
        """Store OAuth token for a provider"""
        expires_at = None
        if expires_in:
            expires_at = int(time.time() * 1000) + (expires_in * 1000)
        
        self._tokens[provider] = {
            "type": "oauth",
            "access": access_token,
            "refresh": refresh_token,
            "expires": expires_at
        }
        self._save_tokens()
        print(f"✅ Token stored for {provider}")
    
    def get_token(self, provider: str) -> Optional[str]:
        """Get access token for provider (returns None if expired)"""
        token_data = self._tokens.get(provider)
        if not token_data:
            return None
        
        # Check expiration
        if token_data.get("expires"):
            now = int(time.time() * 1000)
            if now >= token_data["expires"]:
                print(f"⚠️ Token expired for {provider}")
                return None
        
        return token_data.get("access")
    
    def get_refresh_token(self, provider: str) -> Optional[str]:
        """Get refresh token for provider"""
        token_data = self._tokens.get(provider)
        if not token_data:
            return None
        return token_data.get("refresh")
    
    def is_token_valid(self, provider: str) -> bool:
        """Check if token exists and is not expired"""
        return self.get_token(provider) is not None
    
    def remove_token(self, provider: str):
        """Remove token for provider"""
        if provider in self._tokens:
            del self._tokens[provider]
            self._save_tokens()
            print(f"🗑️ Token removed for {provider}")
    
    def list_providers(self) -> list[str]:
        """List all providers with stored tokens"""
        return list(self._tokens.keys())
