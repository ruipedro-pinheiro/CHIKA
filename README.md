# 🎯 Projet Chika

> **"Utiliser dix IA sans chichi"**

Multi-AI chat platform where AIs collaborate like teammates in a group chat.

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success)]()
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

---

## 🚀 Quick Start (One Command!)

```bash
./deploy.sh
```

That's it! Open http://localhost:3000 🎉

---

## ✨ Features

- **Multi-AI Collaboration** - AIs discuss and reach consensus
- **@Mentions System** - Tag specific AIs (`@claude`, `@gpt`)
- **Private Discussions** - See AIs debate (collapsible threads)
- **Real-Time** - WebSocket for instant updates
- **Discord-Style UI** - Familiar and intuitive
- **Secure** - 700+ lines of security hardening
- **Self-Hosted** - Your data, your server

---

## 🎨 Interfaces

### 1. Web UI (Recommended)
```bash
docker-compose up -d
# Open http://localhost:3000
```

### 2. CLI/TUI
```bash
cd cli
pip install -r requirements.txt
python chika_tui.py
```

---

## 🏗️ Architecture

```
Chika
├── Backend (FastAPI + WebSocket)
│   ├── Multi-AI Orchestrator
│   ├── LiteLLM Router (100+ providers)
│   ├── Security Hardened
│   └── SQLite Database
│
├── Frontend (React + Vite)
│   ├── Discord-style UI
│   ├── Real-time updates
│   └── Markdown support
│
└── CLI (Python Textual)
    └── Terminal interface
```

---

## 💡 Example Workflow

```
You: "@claude I need help with a Rust app"

[💭 Claude is thinking...]

Claude: "Sure! What kind of app?"

You: "@claude @gpt Can you both review this design?"

[💬 Private discussion: Claude & GPT]
Claude: "I suggest async/await"
GPT: "I disagree, sync is simpler here"
Claude: "Good point, I agree"
✅ Consensus reached

GPT: "@You We agree: use sync approach because..."
```

---

## 🔧 Configuration

Edit `.env`:

```bash
# Optional AI providers (Ollama works without keys)
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
GOOGLE_API_KEY=your_key

# Local AI (free!)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

---

## 📊 Tech Stack

- **Backend:** Python 3.11, FastAPI, LiteLLM, SQLAlchemy
- **Frontend:** React 18, Vite, TailwindCSS, ReactMarkdown
- **CLI:** Python Textual, Rich
- **Deploy:** Docker, Docker Compose
- **Security:** Custom hardening (701 lines)

---

## 🧪 Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Tests
```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

---

## 🐳 Docker

### Production
```bash
docker-compose up -d
```

### Development with hot-reload
```bash
docker-compose -f docker-compose.dev.yml up
```

### View logs
```bash
docker-compose logs -f
```

### Stop
```bash
docker-compose down
```

---

## 🔒 Security

- ✅ Input sanitization (XSS, SQL injection, path traversal)
- ✅ Prompt injection filtering (30+ patterns)
- ✅ Rate limiting (10 req/min)
- ✅ CORS strict
- ✅ Secrets redaction in logs
- ✅ DOMPurify frontend
- ✅ Non-root Docker containers

---

## 📝 Project Stats

- **2805 lines** of code
- **701 lines** security hardening
- **742 lines** polished React UI
- **50 lines** CLI/TUI
- **100+ AI providers** supported

---

## 🎯 Use Cases

### For Developers
```
You: "Help me optimize this algorithm"
→ Claude implements
→ GPT reviews
→ Gemini optimizes
→ You get best solution
```

### For Researchers
```
You: "Analyze this data"
→ Multiple AI perspectives
→ Cross-checking results
→ Consensus on findings
```

### For Teams
```
You: "Design this feature"
→ AIs collaborate
→ Debate approaches
→ Present unified solution
```

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 🙏 Credits

Built with ❤️ by Pedro

Powered by:
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [Textual](https://textual.textualize.io/)

---

**🎯 Chika - Utiliser dix IA sans chichi**
