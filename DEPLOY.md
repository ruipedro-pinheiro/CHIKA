# 🚀 CHIKA - DEPLOYMENT GUIDE

## 📦 DEPLOY TO GITHUB PAGES

### Step 1: Push to GitHub

```bash
cd ~/chika

# Add all files
git add .

# Commit
git commit -m "🇨🇭 Initial release - Swiss-made multi-AI platform"

# Create GitHub repo (do this on GitHub.com first)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/chika.git

# Push
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to: `https://github.com/YOUR_USERNAME/chika/settings/pages`
2. Source: **GitHub Actions**
3. Save

### Step 3: Wait for Deployment

- GitHub Actions will auto-deploy
- Check: `https://github.com/YOUR_USERNAME/chika/actions`
- Wait ~2 minutes

### Step 4: Access Your Site

**Your Chika site will be live at:**
```
https://YOUR_USERNAME.github.io/chika/
```

**URLs:**
- Home: `https://YOUR_USERNAME.github.io/chika/`
- Zen: `https://YOUR_USERNAME.github.io/chika/frontend-zen/`
- Arena: `https://YOUR_USERNAME.github.io/chika/frontend-arena/`
- Cards: `https://YOUR_USERNAME.github.io/chika/frontend-cards/`
- Settings: `https://YOUR_USERNAME.github.io/chika/frontend-settings/`
- Audits: `https://YOUR_USERNAME.github.io/chika/frontend-home/audits.html`

---

## 🔧 UPDATE LINKS IN CODE

Before pushing, update these files with your GitHub username:

### 1. frontend-home/audits.html
```html
<!-- Replace all instances of -->
yourusername.github.io/chika
<!-- with -->
YOUR_ACTUAL_USERNAME.github.io/chika
```

### 2. README.md
```markdown
<!-- Update badge links -->
https://github.com/YOUR_USERNAME/chika
```

### 3. All HTML files
```html
<!-- Update footer links -->
<a href="https://github.com/YOUR_USERNAME/chika">
```

---

## 🎯 QUICK DEPLOY SCRIPT

```bash
#!/bin/bash
# deploy.sh

USERNAME="YOUR_GITHUB_USERNAME"

echo "🚀 Deploying Chika to GitHub Pages..."

# Replace username in files
find . -type f -name "*.html" -o -name "*.md" | while read file; do
    sed -i "s/yourusername/$USERNAME/g" "$file"
done

# Git operations
git add .
git commit -m "🇨🇭 Deploy Chika - Swiss-made multi-AI platform"
git push origin main

echo "✅ Deployed! Check:"
echo "   https://github.com/$USERNAME/chika/actions"
echo ""
echo "📍 Your site will be live at:"
echo "   https://$USERNAME.github.io/chika/"
```

---

## 🌐 CUSTOM DOMAIN (Optional)

### Step 1: Add CNAME file

```bash
echo "chika.yourdomain.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push
```

### Step 2: Configure DNS

Add these DNS records:
```
Type: CNAME
Name: chika
Value: YOUR_USERNAME.github.io
```

### Step 3: Enable HTTPS

GitHub Pages will auto-provision SSL certificate.

---

## 📊 POST-DEPLOYMENT CHECKS

### 1. Run External Audits

```bash
# Security Headers
https://securityheaders.com/?q=YOUR_USERNAME.github.io/chika

# SSL Labs
https://www.ssllabs.com/ssltest/analyze.html?d=YOUR_USERNAME.github.io

# PageSpeed
https://pagespeed.web.dev/analysis?url=https://YOUR_USERNAME.github.io/chika

# Accessibility
https://wave.webaim.org/report#/YOUR_USERNAME.github.io/chika
```

### 2. Update Badges in README

Replace placeholders with actual scores from audits above.

### 3. Verify All Pages Load

- [ ] Home page
- [ ] Zen mode
- [ ] Arena mode  
- [ ] Cards mode
- [ ] Settings
- [ ] Audits page
- [ ] All links work
- [ ] Images load
- [ ] CSS loads
- [ ] JS works

---

## 🔄 CONTINUOUS DEPLOYMENT

Every push to `main` branch will auto-deploy:

```bash
# Make changes
git add .
git commit -m "Update feature X"
git push

# GitHub Actions auto-deploys
# Check: github.com/YOUR_USERNAME/chika/actions
```

---

## 🐛 TROUBLESHOOTING

### Pages not deploying?

1. Check GitHub Actions: `https://github.com/YOUR_USERNAME/chika/actions`
2. Check Pages settings: `https://github.com/YOUR_USERNAME/chika/settings/pages`
3. Verify workflow file: `.github/workflows/deploy.yml`

### 404 errors?

1. Check file paths are correct
2. Verify `index.html` exists at root
3. Check relative paths in HTML

### CSS/JS not loading?

1. Check paths are relative: `../design-system/chika-design.css`
2. Verify files exist in repo
3. Check browser console for errors

---

## 📈 ANALYTICS (Optional)

Add Google Analytics to `frontend-home/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🎯 LAUNCH CHECKLIST

- [ ] Create GitHub repo
- [ ] Push code to GitHub
- [ ] Enable GitHub Pages
- [ ] Wait for deployment
- [ ] Verify site loads
- [ ] Run external audits
- [ ] Update README badges with real scores
- [ ] Share on social media
- [ ] Submit to Product Hunt (optional)
- [ ] Add to portfolio

---

**🇨🇭 Ready to show the world Swiss quality!**

```bash
git add .
git commit -m "🚀 Launch Chika - Utiliser l'IA sans chichi !"
git push origin main
```
