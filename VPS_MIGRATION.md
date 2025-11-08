# 🚀 CHIKA - Migration VPS (All-in-One)

## 🎯 Objectif
**UN SEUL SERVEUR, TOUT DEDANS!**
- Frontend (Nginx)
- Backend (FastAPI)
- Database (PostgreSQL local)
- Email (Gmail SMTP - déjà configuré)

---

## 📦 Stack VPS

**Serveur:** DigitalOcean / Hetzner / Contabo (2-5€/mois)
**OS:** Ubuntu 22.04 LTS
**Services:**
- Nginx (frontend + reverse proxy)
- Uvicorn (backend FastAPI)
- PostgreSQL 15 (database locale)
- Systemd (auto-restart)
- Certbot (SSL gratuit)

---

## 🔧 Installation (1 commande!)

```bash
curl -fsSL https://raw.githubusercontent.com/ruipedro-pinheiro/CHIKA/main/scripts/vps-install.sh | bash
```

**Ce script fait TOUT:**
1. Install Nginx, PostgreSQL, Python 3.11
2. Clone repo GitHub
3. Setup backend + frontend
4. Configure SSL (Let's Encrypt)
5. Systemd service auto-restart
6. Migrate DB depuis Render

---

## 🌐 URLs Finales

**Production:** `https://chika.ai` (ton domaine)
**Backend API:** `https://chika.ai/api`
**Frontend:** `https://chika.ai`
**Admin:** `https://chika.ai/admin`

---

## ✅ Avantages VPS vs Render/Vercel

| Feature | VPS | Render + Vercel |
|---------|-----|-----------------|
| **Cost** | 3€/mois | 21€/mois (Render Pro) |
| **Control** | Full root access | Limited |
| **Debugging** | `tail -f /var/log/chika.log` | Dashboard web lent |
| **Deploy time** | 5 secondes | 2-3 minutes |
| **Database** | Local (0ms latency) | Frankfurt (50ms) |
| **Email debug** | Logs directs | Invisible |
| **Stress** | ZÉRO | MAXIMUM 🔥 |

---

## 📝 Next Steps

1. **Acheter VPS** (recommandé: Hetzner 3.79€/mois)
2. **Pointer domaine** (`chika.ai` → IP VPS)
3. **Run install script**
4. **Migrer DB** (export Render → import VPS)
5. **Deploy** (`git push` → auto-deploy!)

**Temps total:** 30 minutes max!

---

**Plus jamais de "attends que Render redéploie"!** 🎉
