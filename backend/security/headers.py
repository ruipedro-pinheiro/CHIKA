"""Security Headers Middleware - Protect against common web attacks"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to ALL responses
    
    Protects against:
    - Clickjacking (X-Frame-Options)
    - MIME sniffing (X-Content-Type-Options)
    - XSS (X-XSS-Protection, CSP)
    - Man-in-the-middle (HSTS)
    - Information leakage (X-Powered-By removal)
    """
    
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # Prevent clickjacking attacks
        response.headers["X-Frame-Options"] = "DENY"
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # XSS Protection (legacy, but still good to have)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Content Security Policy - STRICT!
        csp_policy = "; ".join([
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' http://localhost:8000 ws://localhost:8000",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ])
        response.headers["Content-Security-Policy"] = csp_policy
        
        # Force HTTPS in production
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        
        # Control referrer information
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions Policy (disable dangerous features)
        permissions_policy = ", ".join([
            "geolocation=()",
            "microphone=()",
            "camera=()",
            "payment=()",
            "usb=()",
            "magnetometer=()",
            "gyroscope=()",
            "accelerometer=()"
        ])
        response.headers["Permissions-Policy"] = permissions_policy
        
        # Remove server identification headers
        response.headers.pop("Server", None)
        response.headers.pop("X-Powered-By", None)
        
        # Add security contact
        response.headers["Security-Contact"] = "security@yourdomain.com"
        
        return response
