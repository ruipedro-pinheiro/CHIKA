# 🎯 Chika Zen - Frontend Minimaliste

Interface mobile-first ultra-simple pour Chika.

## 🚀 Lancement rapide

```bash
cd ~/chika/frontend-zen
python3 server.py
```

Puis ouvre **http://localhost:3001**

## ✨ Features

- ✅ Interface minimaliste (1 input, swipe)
- ✅ Swipe pour changer d'IA (Claude ↔ GPT ↔ Gemini)
- ✅ 3 modes visuels (Lambda, Dev, Entreprise)
- ✅ Connexion backend Chika (http://localhost:8000)
- ✅ Messages real-time
- ✅ 100% vanilla JS (no framework)

## 🎨 Modes disponibles

- **λ Lambda** - Blanc minimaliste (grand public)
- **{'{ }'}** Dev - Dark mode GitHub (développeurs)
- **💼 Entreprise** - Bleu corporate (business)

## 🔄 Architecture

```
frontend-zen (port 3001)
    ↓ HTTP
backend Chika (port 8000)
    ↓
LiteLLM → Claude/GPT/Gemini/Ollama
```

## 📱 UX

1. Tape ta question
2. Swipe l'indicateur IA pour changer
3. Clique mode en haut à droite
4. Profite de la simplicité Zen 🧘

---

**Fait avec ❤️ par Pedro & Claude**
