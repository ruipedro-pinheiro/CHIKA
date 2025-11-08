"""Input Sanitization - Protect against ALL injection attacks"""
import re
import html
from typing import Tuple

class InputSanitizer:
    """Sanitize ALL user inputs before processing
    
    Protects against:
    - SQL Injection
    - XSS (Cross-Site Scripting)
    - Path Traversal
    - Command Injection
    - LDAP Injection
    - XML Injection
    """
    
    # Dangerous patterns that should NEVER appear in user input
    FORBIDDEN_PATTERNS = [
        # SQL Injection
        r"(\bOR\b|\bAND\b)\s+['\"]?\d+['\"]?\s*=\s*['\"]?\d+",
        r";\s*DROP\s+TABLE",
        r";\s*DELETE\s+FROM",
        r"UNION\s+SELECT",
        r"--\s*$",
        r"\/\*.*\*\/",
        
        # Command Injection
        r";\s*(rm|cat|ls|wget|curl|bash|sh|python|node)\s+",
        r"\|\s*(rm|cat|ls|wget|curl|bash|sh|python|node)\s+",
        r"`.*`",
        r"\$\(.*\)",
        
        # Path Traversal
        r"\.\.[/\\]",
        r"\.\.%2[fF]",
        r"\.\.%5[cC]",
        
        # LDAP Injection
        r"[*()|\&]",
        
        # Null bytes
        r"\x00",
    ]
    
    # XSS patterns
    XSS_PATTERNS = [
        r"<script[\s\S]*?>[\s\S]*?</script>",
        r"javascript:",
        r"on\w+\s*=",  # onclick, onerror, etc.
        r"<iframe",
        r"<object",
        r"<embed",
        r"<svg[\s\S]*?onload",
    ]
    
    @staticmethod
    def sanitize_string(input_str: str, max_length: int = 50000) -> Tuple[str, bool, str]:
        """Sanitize a string input
        
        Args:
            input_str: The input to sanitize
            max_length: Maximum allowed length
            
        Returns:
            Tuple of (sanitized_string, is_safe, error_message)
        """
        if not input_str:
            return "", True, ""
        
        # Check length
        if len(input_str) > max_length:
            return "", False, f"Input too long (max {max_length} chars)"
        
        # Check for null bytes
        if '\x00' in input_str:
            return "", False, "Null bytes not allowed"
        
        # Check forbidden patterns
        for pattern in InputSanitizer.FORBIDDEN_PATTERNS:
            if re.search(pattern, input_str, re.IGNORECASE):
                return "", False, f"Forbidden pattern detected: {pattern}"
        
        # Check XSS patterns
        for pattern in InputSanitizer.XSS_PATTERNS:
            if re.search(pattern, input_str, re.IGNORECASE):
                return "", False, "Potential XSS detected"
        
        # HTML escape special characters
        sanitized = html.escape(input_str)
        
        # Remove excessive whitespace (but keep single spaces)
        sanitized = re.sub(r'\s+', ' ', sanitized)
        
        return sanitized, True, ""
    
    @staticmethod
    def sanitize_session_id(session_id: str) -> Tuple[str, bool, str]:
        """Validate session ID format
        
        Session IDs should be:
        - Alphanumeric + hyphens/underscores only
        - Between 10-100 characters
        """
        if not session_id:
            return "", False, "Session ID required"
        
        # Check length
        if len(session_id) < 10 or len(session_id) > 100:
            return "", False, "Invalid session ID length"
        
        # Only allow safe characters
        if not re.match(r'^[a-zA-Z0-9_-]+$', session_id):
            return "", False, "Invalid session ID format"
        
        return session_id, True, ""
    
    @staticmethod
    def sanitize_ai_provider(provider: str) -> Tuple[str, bool, str]:
        """Validate AI provider name
        
        Only allow whitelisted providers
        """
        ALLOWED_PROVIDERS = {'ollama', 'claude', 'gpt', 'gemini'}
        
        if not provider:
            return "ollama", True, ""  # Default to local
        
        provider_lower = provider.lower().strip()
        
        if provider_lower not in ALLOWED_PROVIDERS:
            return "", False, f"Unknown AI provider: {provider}"
        
        return provider_lower, True, ""
    
    @staticmethod
    def sanitize_message(message: str) -> Tuple[str, bool, str]:
        """Sanitize chat message
        
        More lenient than general string sanitization,
        but still blocks dangerous patterns
        """
        if not message:
            return "", False, "Message cannot be empty"
        
        # Check length
        if len(message) > 50000:
            return "", False, "Message too long (max 50000 chars)"
        
        # Check for null bytes
        if '\x00' in message:
            return "", False, "Invalid characters in message"
        
        # Remove excessive whitespace
        message = message.strip()
        
        if not message:
            return "", False, "Message cannot be empty after sanitization"
        
        # Check for excessive repeated characters (potential DoS)
        if re.search(r'(.)\1{100,}', message):
            return "", False, "Excessive character repetition detected"
        
        return message, True, ""
