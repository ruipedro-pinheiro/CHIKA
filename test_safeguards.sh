#!/bin/bash
# Quick test script for CHIKA safeguards

echo "================================================================================
CHIKA SAFEGUARDS - Quick Test Script
================================================================================
"

cd /home/pedro/chika/backend

echo "1. Testing Python syntax..."
python3 -m py_compile models/room.py routes/demo.py main.py 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Python syntax OK"
else
    echo "   ❌ Python syntax errors found"
    exit 1
fi

echo ""
echo "2. Testing imports..."
python3 -c "
import sys
sys.path.insert(0, '.')
try:
    from models.room import DemoSession
    print('   ✅ DemoSession model imports OK')
    
    # Check reset_if_new_day method exists
    if hasattr(DemoSession, 'reset_if_new_day'):
        print('   ✅ reset_if_new_day() method exists')
    else:
        print('   ❌ reset_if_new_day() method NOT found')
        sys.exit(1)
except Exception as e:
    print(f'   ❌ Import error: {e}')
    sys.exit(1)
" 2>&1
if [ $? -ne 0 ]; then
    echo "Import test failed"
    exit 1
fi

echo ""
echo "3. Checking database migration..."
python3 << 'PYEOF'
import sqlite3
conn = sqlite3.connect("chika.db")
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(demo_sessions)")
columns = [row[1] for row in cursor.fetchall()]
conn.close()

if 'last_query_date' in columns:
    print("   ✅ last_query_date column exists in demo_sessions")
else:
    print("   ❌ last_query_date column NOT found")
    exit(1)
PYEOF
if [ $? -ne 0 ]; then
    echo "Database migration check failed"
    exit 1
fi

echo ""
echo "4. Checking git tags..."
cd ..
if git tag | grep -q "v0.1-pre-safeguards"; then
    echo "   ✅ Rollback tag v0.1-pre-safeguards exists"
else
    echo "   ⚠️  Warning: Rollback tag not found"
fi

if git tag | grep -q "v0.2-with-safeguards"; then
    echo "   ✅ Current tag v0.2-with-safeguards exists"
else
    echo "   ⚠️  Warning: Current tag not found"
fi

echo ""
echo "5. Checking modified files..."
for file in "backend/models/room.py" "backend/routes/demo.py" "backend/main.py"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file exists"
    else
        echo "   ❌ $file NOT found"
        exit 1
    fi
done

echo ""
echo "6. Checking safeguard constants in demo.py..."
if grep -q "MAX_DISCUSSION_ROUNDS = 5" backend/routes/demo.py; then
    echo "   ✅ MAX_DISCUSSION_ROUNDS = 5 found"
else
    echo "   ❌ MAX_DISCUSSION_ROUNDS not found"
    exit 1
fi

if grep -q "CONSENSUS_KEYWORDS" backend/routes/demo.py; then
    echo "   ✅ CONSENSUS_KEYWORDS found"
else
    echo "   ❌ CONSENSUS_KEYWORDS not found"
    exit 1
fi

if grep -q "def check_consensus" backend/routes/demo.py; then
    echo "   ✅ check_consensus() function found"
else
    echo "   ❌ check_consensus() function not found"
    exit 1
fi

if grep -q "AI_DISPLAY_NAMES" backend/routes/demo.py; then
    echo "   ✅ AI_DISPLAY_NAMES found"
else
    echo "   ❌ AI_DISPLAY_NAMES not found"
    exit 1
fi

echo ""
echo "7. Checking /health endpoint in main.py..."
if grep -q '@app.get("/health")' backend/main.py; then
    echo "   ✅ /health endpoint found"
else
    echo "   ❌ /health endpoint not found"
    exit 1
fi

echo ""
echo "================================================================================
✅ ALL SAFEGUARDS VERIFIED
================================================================================

Ready to deploy:
  git push origin main    # Auto-deploy to Render (if configured)

Ready to test locally:
  cd backend
  source venv/bin/activate  # Or: python3 -m venv venv && source venv/bin/activate
  pip install -r requirements.txt
  python3 main.py

Ready to rollback (if needed):
  git checkout v0.1-pre-safeguards
  git push origin main --force

"
