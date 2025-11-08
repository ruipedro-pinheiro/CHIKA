# 🎨 Chika Design System

Système de design unifié pour toutes les interfaces Chika.

## 🎯 Principes

1. **Cohérence** - Même look & feel sur toutes les interfaces
2. **Simplicité** - Minimaliste mais pas spartiate
3. **Accessibilité** - Contraste, tailles, navigation
4. **Performance** - CSS vanilla, pas de frameworks lourds

## 🎨 Palette de couleurs

### Brand
- **Primary**: `#6366f1` (Indigo) - Boutons principaux, liens
- **Secondary**: `#8b5cf6` (Violet) - Accents
- **Accent**: `#ec4899` (Rose) - Highlights

### AI Colors
- **Claude**: `#8b5cf6` (Violet)
- **GPT**: `#10b981` (Vert)
- **Gemini**: `#3b82f6` (Bleu)
- **Ollama**: `#f59e0b` (Orange)
- **Mock**: `#6b7280` (Gris)

### Modes
- **Light**: Fond blanc (`#fafafa`), texte noir (`#171717`)
- **Dark**: Fond noir (`#0a0a0a`), texte blanc (`#fafafa`)

## 📐 Composants réutilisables

### Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-ghost">Ghost</button>
```

### Inputs
```html
<input type="text" class="input" placeholder="Texte...">
```

### AI Chips
```html
<button class="ai-chip active claude">🤖 Claude</button>
<button class="ai-chip gpt">🧠 GPT</button>
```

### Messages
```html
<div class="message user">
    <div class="message-label">Toi</div>
    <div class="message-content">Message...</div>
</div>
```

### Cards
```html
<div class="card">
    <h3>Titre</h3>
    <p>Contenu...</p>
</div>
```

## 🏗️ Architecture des interfaces

### 1. **ZEN** (Mobile-first, swipe)
- Layout: Header fixe + Messages scroll + Input fixe
- Theme: Light par défaut, Dark/Entreprise optionnels
- Navigation: Swipe pour changer d'IA

### 2. **ARENA** (Graph visualization)
- Layout: Header + Graph central + Panel latéral
- Theme: Dark par défaut
- Navigation: Click nodes, drag graph

### 3. **CARDS** (Kanban workflow)
- Layout: Header + Colonnes drag-drop
- Theme: Light par défaut
- Navigation: Drag cards, filter

### 4. **HOME** (Landing page)
- Layout: Hero + 3 cards interfaces
- Theme: Dégradé brand
- Navigation: Click pour choisir interface

## 📦 Usage

```html
<!-- Dans chaque interface -->
<link rel="stylesheet" href="../design-system/chika-design.css">
```

Puis ajouter `data-theme="light"` ou `data-theme="dark"` sur `<body>`.

## 🔄 Mise à jour

Ce design system est **la source de vérité**. Toute modification doit se faire ici en premier, puis se propager aux interfaces.

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2025-11-08
