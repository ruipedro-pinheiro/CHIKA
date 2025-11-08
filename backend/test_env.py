import os
print("=== ENV VARS CHECK ===")
print(f"GMAIL_USER: {os.getenv('GMAIL_USER', 'NOT SET')}")
print(f"GMAIL_APP_PASSWORD: {os.getenv('GMAIL_APP_PASSWORD', 'NOT SET')}")
print(f"DATABASE_URL exists: {bool(os.getenv('DATABASE_URL'))}")
