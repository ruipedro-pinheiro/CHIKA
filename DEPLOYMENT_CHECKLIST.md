# 🚀 CHIKA - Deployment Checklist

**RÈGLE D'OR:** Jamais déployer sans avoir testé localement ET sans backup!

---

## ✅ PRE-DEPLOY CHECKLIST

### 1. Local Testing (OBLIGATOIRE)
- [ ] Backend run localement avec la nouvelle feature
- [ ] Test tous les endpoints modifiés
- [ ] Vérifier logs pour erreurs
- [ ] Test avec données réelles (pas juste mock)

### 2. Database Changes
- [ ] **BACKUP** des données actuelles (export JSON/SQL)
- [ ] Migration script testé localement
- [ ] Rollback plan si ça fail
- [ ] **JAMAIS utiliser /tmp pour données critiques!**

### 3. Environment Variables
- [ ] Toutes les env vars nécessaires ajoutées sur Render
- [ ] Secrets jamais committés dans git
- [ ] .env.example à jour

### 4. Code Quality
- [ ] Pas de `console.log()` debug oubliés
- [ ] Pas de clés API hardcodées
- [ ] Error handling sur tous les endpoints critiques

---

## 🔄 DEPLOYMENT PROCESS

### Step 1: Backup Production Data
```bash
# Export waitlist AVANT tout changement
curl https://chika-backend-r3ue.onrender.com/waitlist/admin > backup_$(date +%Y%m%d_%H%M%S).json
```

### Step 2: Deploy
- Push to GitHub
- Render auto-deploy
- Monitor logs en temps réel

### Step 3: Validation Post-Deploy
- [ ] /health endpoint répond
- [ ] Test signup waitlist
- [ ] Vérifier count waitlist (pas tombé à 0!)
- [ ] Test email delivery
- [ ] Comparer backup vs nouvelle DB

---

## 🚨 ROLLBACK PROCEDURE

Si deploy fail:
1. Render Dashboard → Rollback to previous deploy
2. Restore backup data si nécessaire
3. Debug localement
4. Re-deploy quand fix validé

---

## 📊 VALIDATION METRICS

**Avant de dire "Deploy OK":**
- ✅ Backend health: 200
- ✅ Waitlist count >= count avant deploy
- ✅ Email delivery fonctionne
- ✅ Pas d'erreurs dans Render logs

---

**Dernière update:** 2025-11-08  
**Lessons learned:** Migration PostgreSQL - Will & Krystian signups perdus
