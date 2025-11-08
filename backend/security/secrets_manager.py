"""Secrets Management - Prevent API key leakage"""
import re
import logging
import sys
from typing import Any

class SecretsManager:
    """Prevent API keys and secrets from being leaked"""
    
    # API key patterns to detect and redact
    API_KEY_PATTERNS = [
        (r'sk-ant-api03-[a-zA-Z0-9_-]{95}', 'REDACTED_ANTHROPIC_KEY'),
        (r'sk-ant-[a-zA-Z0-9_-]{95,}', 'REDACTED_ANTHROPIC_KEY'),
        (r'sk-[a-zA-Z0-9]{48}', 'REDACTED_OPENAI_KEY'),
        (r'sk-proj-[a-zA-Z0-9]{48}', 'REDACTED_OPENAI_PROJECT_KEY'),
        (r'AIza[a-zA-Z0-9_-]{35}', 'REDACTED_GOOGLE_KEY'),
        (r'api[_-]?key["\']?\s*[:=]\s*["\']?([a-zA-Z0-9_-]{20,})', 'REDACTED_API_KEY'),
        (r'token["\']?\s*[:=]\s*["\']?([a-zA-Z0-9_-]{20,})', 'REDACTED_TOKEN'),
        (r'password["\']?\s*[:=]\s*["\']?([^\s"\']{8,})', 'REDACTED_PASSWORD'),
        (r'postgresql://[^:\s]+:[^@\s]+@[^\s]+', 'REDACTED_DB_CONNECTION'),
        (r'mongodb://[^:\s]+:[^@\s]+@[^\s]+', 'REDACTED_MONGO_CONNECTION'),
        (r'mysql://[^:\s]+:[^@\s]+@[^\s]+', 'REDACTED_MYSQL_CONNECTION'),
    ]
    
    ENV_VAR_PATTERNS = [
        r'ANTHROPIC_API_KEY',
        r'OPENAI_API_KEY',
        r'GOOGLE_API_KEY',
        r'DATABASE_URL',
        r'SECRET_KEY',
        r'PRIVATE_KEY',
        r'AWS_SECRET',
    ]
    
    @staticmethod
    def redact_secrets(text: str) -> str:
        """Remove all API keys and secrets from text"""
        if not text:
            return text
        
        redacted = text
        
        for pattern, replacement in SecretsManager.API_KEY_PATTERNS:
            redacted = re.sub(pattern, replacement, redacted, flags=re.IGNORECASE)
        
        for env_var in SecretsManager.ENV_VAR_PATTERNS:
            redacted = re.sub(
                f'{env_var}\\s*=\\s*[^\\s]+',
                f'{env_var}=REDACTED',
                redacted,
                flags=re.IGNORECASE
            )
        
        return redacted
    
    @staticmethod
    def contains_secrets(text: str) -> bool:
        """Check if text contains potential secrets"""
        if not text:
            return False
        
        for pattern, _ in SecretsManager.API_KEY_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        return False


class SecureLogHandler(logging.StreamHandler):
    """Logging handler that automatically redacts secrets"""
    
    def emit(self, record: logging.LogRecord):
        """Emit log record with secrets redacted"""
        # Redact message
        if isinstance(record.msg, str):
            record.msg = SecretsManager.redact_secrets(record.msg)
        
        # Redact args
        if record.args:
            safe_args = tuple(
                SecretsManager.redact_secrets(str(arg)) if isinstance(arg, str) else arg
                for arg in record.args
            )
            record.args = safe_args
        
        # Call parent to actually output
        super().emit(record)


def setup_secure_logging():
    """Setup logging with automatic secret redaction"""
    root_logger = logging.getLogger()
    
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    secure_handler = SecureLogHandler(sys.stdout)
    secure_handler.setFormatter(
        logging.Formatter('[%(asctime)s] %(levelname)s: %(message)s')
    )
    root_logger.addHandler(secure_handler)
    root_logger.setLevel(logging.INFO)
    
    return root_logger
