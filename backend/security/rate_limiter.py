"""Rate Limiting - Prevent DoS attacks"""
from fastapi import Request, HTTPException
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple
import asyncio

class RateLimiter:
    """Simple in-memory rate limiter
    
    Protects against:
    - DoS (Denial of Service)
    - Brute force attacks
    - Resource exhaustion
    
    Note: For production, use Redis-based rate limiting
    """
    
    def __init__(self):
        # Store: IP -> [(timestamp, count)]
        self.requests: Dict[str, list] = defaultdict(list)
        self.lock = asyncio.Lock()
    
    async def check_rate_limit(
        self, 
        client_ip: str, 
        max_requests: int = 10, 
        window_seconds: int = 60
    ) -> Tuple[bool, int]:
        """Check if client has exceeded rate limit
        
        Args:
            client_ip: Client IP address
            max_requests: Maximum requests allowed
            window_seconds: Time window in seconds
            
        Returns:
            (is_allowed, requests_remaining)
        """
        async with self.lock:
            now = datetime.now()
            window_start = now - timedelta(seconds=window_seconds)
            
            # Get requests for this IP
            ip_requests = self.requests[client_ip]
            
            # Filter out old requests
            ip_requests = [
                req_time for req_time in ip_requests
                if req_time > window_start
            ]
            
            # Update stored requests
            self.requests[client_ip] = ip_requests
            
            # Check if limit exceeded
            if len(ip_requests) >= max_requests:
                return False, 0
            
            # Add current request
            ip_requests.append(now)
            
            # Return remaining requests
            remaining = max_requests - len(ip_requests)
            return True, remaining
    
    async def cleanup_old_entries(self, max_age_seconds: int = 3600):
        """Remove old entries to prevent memory growth
        
        Should be called periodically (e.g., every hour)
        """
        async with self.lock:
            cutoff = datetime.now() - timedelta(seconds=max_age_seconds)
            
            # Remove IPs with no recent requests
            ips_to_remove = []
            for ip, requests in self.requests.items():
                # Filter requests
                recent_requests = [r for r in requests if r > cutoff]
                
                if not recent_requests:
                    ips_to_remove.append(ip)
                else:
                    self.requests[ip] = recent_requests
            
            # Remove empty IPs
            for ip in ips_to_remove:
                del self.requests[ip]


# Global rate limiter instance
rate_limiter = RateLimiter()


async def check_rate_limit_middleware(request: Request, max_requests: int = 10):
    """Middleware to check rate limit
    
    Args:
        request: FastAPI request
        max_requests: Max requests per minute
        
    Raises:
        HTTPException: If rate limit exceeded
    """
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Check rate limit
    allowed, remaining = await rate_limiter.check_rate_limit(
        client_ip, 
        max_requests=max_requests, 
        window_seconds=60
    )
    
    # Set rate limit headers
    request.state.rate_limit_remaining = remaining
    
    if not allowed:
        raise HTTPException(
            status_code=429, 
            detail="Rate limit exceeded. Please try again later.",
            headers={
                "Retry-After": "60",
                "X-RateLimit-Limit": str(max_requests),
                "X-RateLimit-Remaining": "0"
            }
        )


def setup_rate_limiting(app):
    """Setup rate limiting for FastAPI app
    
    Usage:
        from security.rate_limiter import setup_rate_limiting
        setup_rate_limiting(app)
    """
    # Cleanup task
    async def cleanup_task():
        while True:
            await asyncio.sleep(3600)  # Every hour
            await rate_limiter.cleanup_old_entries()
    
    # Start cleanup task on startup
    @app.on_event("startup")
    async def start_cleanup():
        asyncio.create_task(cleanup_task())
    
    return app
