# 🚀 CHIKA V1 - Setup Guide

**Date:** 8 Nov 2025  
**Deadline:** 22h00  
**Status:** IN PROGRESS

---

## ⚡ Quick Start (5 min)

### 1. Get FREE API Keys

#### Google AI Studio (Gemini 2.0 Flash)
1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy key (starts with `AIza...`)

#### Groq (Llama + Mixtral)
1. Go to: https://console.groq.com/keys
2. Sign up (free)
3. Click "Create API Key"
4. Copy key (starts with `gsk_...`)

---

### 2. Configure .env

```bash
cd /home/pedro/chika

# Edit .env file
nano .env  # or vim, code, etc.
```

**Add your keys:**
```bash
# === FREEMIUM AI (Free) ===
GOOGLE_API_KEY=AIza...your_key_here
GROQ_API_KEY=gsk_...your_key_here

# === PRO USERS (Optional) ===
ANTHROPIC_API_KEY=  # Your Claude key if you have
OPENAI_API_KEY=     # Your ChatGPT key if you have
```

---

### 3. Test Backend

```bash
# Install dependencies (if not done)
cd backend
pip install -r requirements.txt

# Test multi-AI
python test_smart_router.py
```

**Expected output:**
```
✅ Gemini available
✅ Llama available  
✅ Mixtral available
✅ SmartRouter tests passing
```

---

### 4. Run Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Access:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

---

### 5. Run Frontend

```bash
# In another terminal
cd /home/pedro/chika
python3 -m http.server 3000
```

**Access:**
- Zen Mode: http://localhost:3000/frontend-zen/
- Settings: http://localhost:3000/frontend-settings/

---

## 🧪 Test Multi-AI Collaboration

### Via API (curl):

```bash
# Create room
curl -X POST http://localhost:8000/rooms \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Multi-AI", "active_ais": ["gemini", "llama", "mixtral"]}'

# Send message (replace ROOM_ID)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": "ROOM_ID",
    "content": "Write a Python script for database backup"
  }'
```

**Expected response:**
```json
{
  "ai_message": {
    "author": "gemini",
    "content": "I'll check RGPD compliance...",
    ...
  },
  "discussion": {
    "participants": ["gemini", "llama", "mixtral"],
    "messages": [...]
  }
}
```

---

## 🎯 V1 Minimal Features

### ✅ Working:
- [x] SmartRouter (intent analysis)
- [x] Multi-AI selection (3 models)
- [x] AI Personas (each AI knows identity)
- [x] Context storage (SQLite)
- [x] API endpoints (/rooms, /chat)

### 🚧 In Progress:
- [ ] Frontend Zen Mode refactor
- [ ] Multi-IA thread display
- [ ] WebSocket real-time

### ❌ Not in V1:
- 75 modèles (just 3 for demo)
- OAuth flow UI
- Production optimizations
- Perfect UI/UX

---

## 📹 Demo Script

**Use case:** "Python backup script + RGPD check"

**Expected flow:**
1. User types question in Zen Mode
2. SmartRouter analyzes: code + legal
3. Backend calls:
   - Llama (code expert)
   - Gemini (legal expert)
   - Mixtral (creative alternatives)
4. All 3 responses displayed in thread
5. User sees collaboration

**Screencast:** 60 seconds max

---

## 🚨 Troubleshooting

### Backend won't start:
```bash
# Check Python version
python --version  # Must be 3.11+

# Reinstall deps
pip install --upgrade -r requirements.txt
```

### API keys not working:
```bash
# Verify .env loaded
cd backend
python -c "from config import settings; print(settings.google_api_key)"

# Should print your key (not empty)
```

### Frontend can't connect:
```bash
# Check CORS
# backend/config.py should have:
cors_origins = ["http://localhost:3000", ...]
```

---

## ⏰ Timeline

- **16h00:** Setup API keys
- **16h30:** Backend tests passing
- **18h30:** Frontend refactor done
- **19h00:** End-to-end working
- **20h00:** Demo recorded
- **22h00:** DEADLINE - STOP!

---

**Last updated:** 16h00  
**Next update:** 17h00
