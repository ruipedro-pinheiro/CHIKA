# 🚀 CHIKA - DÉMARRAGE RAPIDE

## 🎯 OPTION 1: VOIR LES FRONTENDS IMMÉDIATEMENT (Sans backend)

### Étape 1: Ouvrir dans le navigateur
```bash
cd ~/chika

# HOME PAGE (Landing)
firefox frontend-home/index.html &

# ZEN MODE
firefox frontend-zen/index.html &

# ARENA MODE
firefox frontend-arena/index.html &

# CARDS MODE
firefox frontend-cards/index.html &

# SETTINGS
firefox frontend-settings/index.html &
```

**Résultat:** Tu vois les 4 interfaces en local (offline)!

---

## 🎯 OPTION 2: LANCER AVEC SERVEUR LOCAL (Recommandé)

### Serveur Python Simple
```bash
cd ~/chika

# Lancer serveur HTTP
python -m http.server 8080

# Ouvrir dans navigateur
firefox http://localhost:8080/frontend-home/index.html
```

**URLs disponibles:**
- Home: http://localhost:8080/frontend-home/index.html
- Zen: http://localhost:8080/frontend-zen/index.html
- Arena: http://localhost:8080/frontend-arena/index.html
- Cards: http://localhost:8080/frontend-cards/index.html
- Settings: http://localhost:8080/frontend-settings/index.html

---

## 🎯 OPTION 3: FULL STACK (Backend + Frontend)

### Prérequis
```bash
# Python 3.11+
python --version

# Node.js (optional pour build)
node --version
```

### Installation Backend
```bash
cd ~/chika/backend

# Créer venv
python -m venv venv
source venv/bin/activate

# Installer dépendances
pip install -r requirements.txt

# Configurer
cp ../.env.example .env
# Éditer .env avec tes API keys

# Lancer
python main.py
```

**Backend running:** http://localhost:8000

### Ouvrir Frontends
```bash
# Serveur static files
cd ~/chika
python -m http.server 3000

# Ouvrir
firefox http://localhost:3000/frontend-home/index.html
```

---

## 🐳 OPTION 4: DOCKER (Production-Ready)

### Lancer tout avec Docker Compose
```bash
cd ~/chika

# Build et start
docker-compose up -d

# Check status
docker-compose ps

# Logs
docker-compose logs -f
```

**URLs:**
- Home: http://localhost:3000
- Zen: http://localhost:3001
- Arena: http://localhost:3002
- Cards: http://localhost:3003
- Backend: http://localhost:8000
- Settings: (intégré dans Home)

### Arrêter
```bash
docker-compose down
```

---

## 🎨 CE QU'ON PEUT TESTER MAINTENANT

### Sans Backend (Offline)
✅ Design complet (4 interfaces)
✅ Branding suisse 🇨🇭
✅ Thèmes dark/light
✅ Responsive mobile
✅ Animations
✅ Trust & Proof section
✅ Audits page

### Avec Backend
✅ Chat avec Mock AI
✅ Multi-rooms
✅ Context partagé
✅ WebSocket (si configuré)
✅ Settings save/load

### Avec API Keys
✅ Chat avec vraies IA (Claude, GPT, Gemini)
✅ OAuth flow
✅ Token optimization
✅ Compression context

---

## 🔍 QUICK CHECKS

### 1. Vérifier fichiers
```bash
cd ~/chika
ls -la frontend-*/
```

### 2. Vérifier design system
```bash
cat design-system/chika-design.css | head -50
```

### 3. Test simple
```bash
cd ~/chika
python -m http.server 8080 &
firefox http://localhost:8080/frontend-home/index.html
```

---

## 🎯 RECOMMENDED: DÉMARRER PAR OPTION 2

**Pourquoi?**
- ✅ Rapide (30 secondes)
- ✅ Vois tout le frontend
- ✅ Pas besoin backend
- ✅ Pas besoin API keys
- ✅ Zero config

**Command:**
```bash
cd ~/chika && python -m http.server 8080
```

**Then open:** http://localhost:8080/frontend-home/index.html

---

## ❗ TROUBLESHOOTING

### Port déjà utilisé
```bash
# Changer port
python -m http.server 8888
```

### Fichiers manquants
```bash
cd ~/chika
ls -la frontend-home/
ls -la design-system/
```

### Erreur CORS (avec backend)
```bash
# Check .env
cat .env | grep CORS

# Should have:
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,...
```

---

**🚀 PRÊT? GO!**

```bash
cd ~/chika
python -m http.server 8080
firefox http://localhost:8080/frontend-home/index.html
```
