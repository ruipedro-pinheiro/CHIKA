#!/bin/bash
# Backup CHIKA waitlist before any deployment

BACKEND_URL="https://chika-backend-r3ue.onrender.com"
BACKUP_DIR="$HOME/chika/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/waitlist_$TIMESTAMP.json"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🔄 Backing up waitlist..."
curl -s "$BACKEND_URL/waitlist/admin" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    COUNT=$(jq '.total' "$BACKUP_FILE")
    echo "✅ Backup saved: $BACKUP_FILE"
    echo "📊 Total signups: $COUNT"
    
    # Keep only last 30 backups
    ls -t "$BACKUP_DIR"/waitlist_*.json | tail -n +31 | xargs -r rm
else
    echo "❌ Backup failed!"
    exit 1
fi
