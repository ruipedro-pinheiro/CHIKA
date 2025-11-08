# Plan de Développement - Projet Chika

## Phase 1: Copier/Adapter Code Existant (Maintenant)

### Backend à Récupérer
- [x] `multi-ai-system-app/backend/security/` → `chika/backend/security/`
  - input_sanitizer.py (164 lignes)
  - prompt_filter.py (157 lignes)
  - secrets_manager.py (161 lignes)
  - rate_limiter.py (148 lignes)
  - headers.py (71 lignes)
  **Total: 701 lignes de sécurité**

- [x] `multi-ai-system-app/backend/llm_router/router.py` → `chika/backend/providers/llm_router.py`
  - LiteLLM router avec fallback (145 lignes)

- [ ] `multi-ai-system-app/backend/models.py` → Adapter pour Room/Message
- [ ] `multi-ai-system-app/backend/config.py` → Copier tel quel

### Nouveau Code à Écrire
- [ ] `backend/room/manager.py` - Logic chat room multi-IA
- [ ] `backend/orchestrator/ai_collaboration.py` - Les IA se parlent
- [ ] `backend/main.py` - FastAPI app (WebSocket + REST)

### Frontend
- [ ] Copier base de `multi-ai-system-app/frontend/`
- [ ] Refaire UI style Discord (messages, avatars, threads)

### CLI
- [ ] Nouveau: Python Textual (TUI)

---

## Phase 2: Features Core

### Room System
```python
class Room:
    user: User
    ais: List[AI]  # ['claude', 'gpt', 'grok']
    messages: List[Message]
    private_discussions: List[Discussion]
```

### AI Orchestrator
- Décide quelles IA répondent
- Détecte désaccords
- Lance discussions privées
- Retourne consensus

### Security
- Tout le code déjà écrit (701 lignes)
- Tests exploit déjà écrits

---

## Phase 3: Polish

- Docker compose
- Documentation
- Tests
- Landing page

---

**Estimation:** 2-3 jours de dev
