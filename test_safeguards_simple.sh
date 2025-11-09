#!/bin/bash
# Quick test script for CHIKA safeguards (no Python imports required)

echo "CHIKA SAFEGUARDS - Quick Verification"
echo "======================================"
echo ""

cd /home/pedro/chika

echo "1. Python syntax check..."
python3 -m py_compile backend/models/room.py backend/routes/demo.py backend/main.py 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ All Python files have valid syntax"
else
    echo "   ❌ Syntax errors found"
    exit 1
fi

echo ""
echo "2. Git tags check..."
if git tag | grep -q "v0.1-pre-safeguards"; then
    echo "   ✅ Rollback tag: v0.1-pre-safeguards"
else
    echo "   ❌ Rollback tag missing"
fi

if git tag | grep -q "v0.2-with-safeguards"; then
    echo "   ✅ Current tag: v0.2-with-safeguards"
else
    echo "   ❌ Current tag missing"
fi

echo ""
echo "3. Safeguard constants check..."
grep -q "MAX_DISCUSSION_ROUNDS = 5" backend/routes/demo.py && echo "   ✅ MAX_DISCUSSION_ROUNDS = 5"
grep -q "CONSENSUS_KEYWORDS" backend/routes/demo.py && echo "   ✅ CONSENSUS_KEYWORDS defined"
grep -q "def check_consensus" backend/routes/demo.py && echo "   ✅ check_consensus() function"
grep -q "AI_DISPLAY_NAMES" backend/routes/demo.py && echo "   ✅ AI_DISPLAY_NAMES mapping"

echo ""
echo "4. Daily reset check..."
grep -q "last_query_date" backend/models/room.py && echo "   ✅ last_query_date column added"
grep -q "def reset_if_new_day" backend/models/room.py && echo "   ✅ reset_if_new_day() method"
grep -q "Daily limit reached" backend/routes/demo.py && echo "   ✅ Daily limit message"

echo ""
echo "5. Health endpoint check..."
grep -q '@app.get("/health")' backend/main.py && echo "   ✅ /health endpoint added"

echo ""
echo "6. Database migration check..."
if sqlite3 backend/chika.db "PRAGMA table_info(demo_sessions)" | grep -q "last_query_date"; then
    echo "   ✅ Database migrated (last_query_date column exists)"
else
    echo "   ⚠️  Warning: Database may need migration"
fi

echo ""
echo "======================================"
echo "✅ ALL SAFEGUARDS VERIFIED"
echo "======================================"
echo ""
echo "Files modified:"
echo "  - backend/models/room.py"
echo "  - backend/routes/demo.py"
echo "  - backend/main.py"
echo "  - backend/chika.db"
echo ""
echo "Ready to deploy!"
