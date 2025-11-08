# 🇨🇭 CHIKA - Multi-AI Collaboration Platform

> **The OS for your AIs. Stop switching. Let them collaborate.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

---

## 🎯 What is CHIKA?

CHIKA is a multi-AI orchestration platform that makes your AIs collaborate like a real team.

**Instead of:**
- Switching between ChatGPT, Claude, Gemini
- Copy-pasting context everywhere
- Losing conversation history

**You get:**
- Automatic AI selection based on your need
- Real-time collaboration between AIs
- Unlimited memory (never forget context)
- Your own API keys (you keep control)

---

## 🔥 The Problem

```
You on Claude.ai:
"Write me a Python backup script"
→ Claude responds ✅

You on ChatGPT:
"Is this RGPD compliant?"
→ ChatGPT: "What script?" ❌
→ You must copy-paste → ANNOYING!

You back on Claude 2 days later:
"Improve the script"
→ Claude forgot (new session) ❌
→ You must re-explain everything → TIME WASTE!
```

**You pay $40/month (Claude Pro + ChatGPT Plus) for tools that don't talk to each other.**

---

## 💡 The Solution

```
You: "Python backup script with crontab"

CHIKA automatically:
→ Analyzes: "python script" = needs CODE expert
→ Analyzes: "crontab" = needs SYSADMIN expert
→ Analyzes: "backup" = needs RGPD check

🤖 Claude (Code Expert):
"I'll code it. @Gemini check RGPD? @ChatGPT creative alternatives?"

✨ Gemini (Legal Expert):
"RGPD OK if AES-256 encryption + retention <30 days"

🧠 ChatGPT (Creative Expert):
"Alternative: use systemd timer instead of cron (better logging)"

🤖 Claude:
"@You Here's your script:
✅ Auto backup with encryption (RGPD compliant)
✅ systemd timer (modern approach)
Ready to use!"
```

**Result:** 1 question → 3 AIs collaborate → Best possible solution!

---

## 🚀 Key Features

### 🧠 SmartRouter
Automatic AI selection based on your message:
- "Python code bug" → Claude (code expert)
- "RGPD compliance" → Gemini (legal expert)
- "Creative blog post" → ChatGPT (creative expert)
- "Script + RGPD + alternatives" → All 3 together!

### 🤝 Native Collaboration
AIs discuss together like a team:
- Claude proposes code
- Gemini checks security
- ChatGPT suggests improvements
- If disagreement → private discussion until consensus

### 💾 Unlimited Memory
**ChatGPT/Claude:** Forget after X messages

**CHIKA PRO:** Never forgets!

```
Day 1: "Explain JavaScript closures"
Day 30: "Give me closure example from before"
→ CHIKA REMEMBERS! ✅
```

### 🔐 You Keep Control
**Freemium:** Our free AIs (Gemini, Llama, Mixtral)

**PRO:** YOUR AIs!
- Connect your Claude Max (OAuth)
- Connect your ChatGPT Plus (API key)
- Connect any AI you want

**Privacy:** Your keys = your data. We don't store anything.

---

## 🏗️ Architecture

### Backend
```
FastAPI (Python 3.11+)
├── SmartRouter (intent analysis + AI selection)
├── AICollaborator (multi-AI coordination)
├── AI Personas (identity system - each AI knows who it is)
├── Context Manager (unlimited memory)
├── OAuth2 (Anthropic reverse-engineered)
└── LiteLLM (100+ providers support)
```

### Frontend
```
Vanilla JS (max performance)
├── Zen Mode (focused conversation)
├── Arena Mode (compare AI responses)
├── Cards Mode (knowledge base)
└── Settings (OAuth/API keys management)
```

### Infrastructure
```
Docker Compose
├── FastAPI backend
├── PostgreSQL (production) / SQLite (dev)
├── Qdrant (vector DB for RAG - future)
└── Nginx (reverse proxy)
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Docker & Docker Compose
- API keys (at least one):
  - Google AI Studio (Gemini - free)
  - Groq (Llama/Mixtral - free)
  - OpenAI API key
  - Anthropic API key

### Installation

```bash
# Clone repo
git clone https://github.com/ruipedro-pinheiro/multi-ai-system.git
cd multi-ai-system

# Copy .env.example
cp .env.example .env

# Add your API keys in .env
GOOGLE_API_KEY=your_key_here
GROQ_API_KEY=your_key_here

# Run with Docker
docker-compose up -d

# Or run locally
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd backend && uvicorn main:app --reload
```

### Access
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 📖 Documentation

- **[PITCH.md](PITCH.md)** - Full product pitch (tech + non-tech)
- **[FREEMIUM_SETUP.md](FREEMIUM_SETUP.md)** - How to get free API keys
- **[VALIDATION_ROADMAP.md](VALIDATION_ROADMAP.md)** - Market validation plan
- **[RAPPORT_ANALYSE_COMPLETE.md](RAPPORT_ANALYSE_COMPLETE.md)** - Deep technical analysis

### Technical Docs
- **[backend/](backend/)** - Backend architecture & code
- **[frontend-zen/](frontend-zen/)** - Zen Mode interface
- **[frontend-settings/](frontend-settings/)** - Settings interface
- **[design-system/](design-system/)** - Design system & branding

---

## 🎯 Roadmap

### V1 (Current - Q1 2026)
- [x] SmartRouter (intent analysis)
- [x] Multi-AI collaboration
- [x] Freemium support (Gemini + Groq)
- [x] AI Personas (identity system)
- [x] Context Manager (unlimited memory)
- [ ] Frontend Zen Mode refactor
- [ ] OAuth flow completion
- [ ] Beta launch

### V2 (Q2-Q3 2026)
- [ ] RAG with Qdrant (upload docs/code)
- [ ] Session management
- [ ] TUI (terminal interface)
- [ ] Plugins system
- [ ] VS Code extension

### V3 (Q4 2026 - 2027)
- [ ] Mobile app
- [ ] Public API
- [ ] Marketplace plugins
- [ ] Enterprise features (SSO, audit logs)

---

## 💰 Pricing (Planned)

### Freemium - $0
- Gemini 2.0 Flash (free Google)
- Llama 3.1 70B (free Groq)
- Mixtral 8x7B (free Groq)
- Multi-AI collaboration
- Context limited: 50 messages

### PRO - $20/month
- Connect YOUR AIs (OAuth/API keys)
- Unlimited memory
- Unlimited sessions
- Advanced settings
- Priority support

### Enterprise - Custom
- Self-hosted (your infrastructure)
- SSO/SAML
- Custom branding
- Dedicated support
- SLA guaranteed

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Code formatting
black backend/
isort backend/

# Linting
flake8 backend/
mypy backend/
```

---

## 🔐 Security

- Input sanitization (XSS, SQL injection)
- Prompt injection protection
- Rate limiting (10 req/min)
- OAuth2 PKCE flow
- Encrypted token storage

Report vulnerabilities: security@chika.app

---

## 📊 Status

- **Version:** 1.0.0-beta
- **Status:** Pre-launch validation
- **Backend:** Production-ready
- **Frontend:** In development
- **Launch:** Q1 2026 (planned)

### Current Metrics
- GitHub Stars: 0 (just launched!)
- Beta Users: 0 (accepting applications)
- Waitlist: [Join here](https://chika.app)

---

## 📞 Contact

- **Website:** chika.app (coming soon)
- **Email:** pedro@chika.app
- **GitHub:** [@ruipedro-pinheiro](https://github.com/ruipedro-pinheiro)
- **Twitter:** @chika_ai (coming soon)

---

## ⚖️ License

MIT License - see [LICENSE](LICENSE) for details.

**Core:** Open source (MIT)  
**Enterprise:** Commercial license available

---

## 🙏 Acknowledgments

- **Anthropic** - Claude API & OAuth flow inspiration
- **OpenAI** - ChatGPT & API design patterns
- **Google** - Gemini 2.0 Flash (free tier ❤️)
- **Groq** - Ultra-fast inference (free tier ❤️)
- **LiteLLM** - Universal LLM gateway
- **FastAPI** - Best Python web framework
- **42 Network** - Community & feedback

---

## 🇨🇭 Made in Switzerland

**Philosophy:**
- 🎯 Simple, no bullshit
- 🔐 Privacy-first
- 🛠️ Open source core
- 💪 Self-hostable
- 🧠 Actually intelligent (not just marketing)

---

**CHIKA - Stop switching. Let your AIs collaborate.** 🚀
