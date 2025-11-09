# CHIKA - Multi-AI Collaboration Platform

**Live URL:** https://chika.page

## What is CHIKA?

CHIKA is a production web application that enables autonomous collaboration between multiple AI models (GPT-4, Claude, Gemini) to provide superior answers to user questions.

### Core Concept

Instead of users manually switching between different AI platforms:
1. User asks ONE question on CHIKA
2. Multiple AIs discuss the question privately
3. AIs challenge each other's responses
4. AIs reach consensus autonomously  
5. CHIKA synthesizes ONE superior answer

### Technical Implementation

**Frontend:**
- Single-page application (HTML5 + Vanilla JavaScript)
- Real-time status updates
- Collapsible AI discussion view
- No frameworks (lightweight, 2765 lines)

**Backend:**
- FastAPI (Python 3.13)
- LiteLLM (multi-provider AI gateway)
- SQLite database (demo sessions, rate limiting)
- Pydantic V2 data validation

**Infrastructure:**
- VPS: DigitalOcean (64.226.98.60)
- Nginx reverse proxy
- Systemd service management
- HTTPS enabled

### Production Safeguards (Critical)

1. **MAX_DISCUSSION_ROUNDS = 5**
   - Hard limit prevents infinite loops
   - Guarantees completion in <30 seconds
   - Protects against API cost explosion

2. **Multiple Consensus Keywords**
   - Detects: CONSENSUS, AGREE, AGREED, FINAL, CONCLUDED, COMPLETE
   - Fuzzy matching (case-insensitive)
   - Prevents missed termination signals

3. **Daily Rate Limit Reset**
   - 10 queries per day per session
   - Resets at midnight UTC
   - Users can return daily (not permanent lockout)

4. **Input Validation**
   - XSS sanitization
   - Prompt injection detection
   - Content length limits (1-5000 chars)

5. **Health Monitoring**
   - `/health` endpoint: Real-time AI availability
   - `/demo/stats`: Usage metrics
   - `/waitlist/stats`: Public statistics

### API Endpoints (Public)

**GET /health**
```json
{
  "status": "online",
  "available_ais": ["gemini", "gpt", "mock"],
  "timestamp": "2025-11-09T16:36:49.906478"
}
```

**GET /demo/stats**
```json
{
  "total_sessions": 15,
  "active_sessions": 8,
  "total_queries": 47
}
```

**GET /waitlist/stats**
```json
{
  "total_signups": 2,
  "success": true
}
```

**POST /demo/chat**
Request:
```json
{
  "content": "What is 2+2?"
}
```

Response:
```json
{
  "success": true,
  "session_id": "...",
  "query_count": 1,
  "queries_remaining": 9,
  "synthesis": "The answer is 4...",
  "ai_responses": [
    {
      "ai": "AI-1",
      "display_name": "GPT-4",
      "content": "2+2 equals 4. CONSENSUS."
    },
    {
      "ai": "AI-2", 
      "display_name": "Claude",
      "content": "CONSENSUS"
    }
  ]
}
```

**DELETE /demo/session/reset**
- Clears conversation messages
- Keeps session and query count

### AI Discussion Flow

```
User Question: "Explain quantum entanglement"
    ↓
Round 1: GPT-4 proposes initial explanation
    ↓
Round 2: Claude challenges accuracy, suggests improvements
    ↓
Round 3: Gemini adds complementary perspective
    ↓
Round 4: GPT-4 refines based on feedback
    ↓
Round 5: AIs say "CONSENSUS" (or MAX_ROUNDS reached)
    ↓
CHIKA synthesizes final answer from discussion
    ↓
User receives ONE superior answer + can view discussion
```

### Features

- ✅ **Autonomous discussion:** AIs decide when consensus reached
- ✅ **Shared context:** No token waste repeating information
- ✅ **Hard safeguards:** MAX 5 rounds prevents infinite loops
- ✅ **Daily reset:** 10 queries/day (resets at midnight UTC)
- ✅ **Real AI names:** Transparency (GPT-4, Claude, Gemini shown)
- ✅ **Session persistence:** Conversations restored on F5
- ✅ **SEO optimized:** robots.txt, sitemap.xml, Schema.org
- ✅ **Mobile friendly:** PWA meta tags, responsive design

### Current Status (2025-11-09)

**Production:**
- Site: https://chika.page ✅ LIVE
- Backend: 64.226.98.60:8000 ✅ RUNNING
- Service: chika.service ✅ ACTIVE
- Database: SQLite (demo_sessions, rooms, messages) ✅ MIGRATED
- Version: v0.2-with-safeguards

**Availability:**
- Free demo: 10 questions/day (no signup required)
- AIs available: Gemini, GPT-4, Mock (Claude configured)
- Uptime: Monitored via /health endpoint

**Known Issues:**
- All critical issues FIXED (2025-11-09)
- Minor: Apple mobile meta tag deprecated (non-blocking)

### SEO & Accessibility

**For AI Crawlers (Claude, ChatGPT, etc):**
- robots.txt: ✅ All bots allowed (`User-agent: * Allow: /`)
- sitemap.xml: ✅ Complete site structure
- Meta tags: ✅ Comprehensive (title, description, keywords)
- Schema.org: ✅ WebApplication structured data
- Open Graph: ✅ Social media previews
- Canonical URL: ✅ https://chika.page/

**Crawlable Pages:**
- https://chika.page/ (main demo)
- https://chika.page/health (backend status)
- https://chika.page/demo/stats (usage metrics)
- https://chika.page/waitlist/stats (public data)
- https://chika.page/robots.txt (bot permissions)
- https://chika.page/sitemap.xml (site map)

### GitHub Repository

**URL:** https://github.com/ruipedro-pinheiro/CHIKA

**Key Files:**
- `README.md` - Full documentation
- `SAFEGUARDS_APPLIED.md` - Production safeguards details
- `DEPLOYMENT_READY.md` - Deployment guide
- `backend/routes/demo.py` - Multi-AI collaboration logic
- `backend/models/room.py` - Database models
- `frontend-v1/index.html` - Main UI

**Git Tags:**
- v0.1-pre-safeguards (rollback point)
- v0.2-with-safeguards (current production)

### For AI Understanding

**What makes CHIKA unique:**
1. **Not just multiple AIs answering separately** - AIs actively discuss and challenge each other
2. **Autonomous termination** - AIs decide when they've reached consensus (not hardcoded rounds)
3. **Shared context** - Token-efficient (context injected once, not repeated)
4. **Production-grade safeguards** - MAX_ROUNDS, multiple keywords, daily resets
5. **Full transparency** - Real AI names shown, discussion viewable

**Business Model:**
- Current: Free demo (10 queries/day)
- Future: Freemium (beta waitlist open)
- Target: Developers, researchers, power users

**Technical Quality:**
- Zero `type: ignore` comments (RIGEUR 42)
- SQLAlchemy 2.0 with `Mapped[]` types
- Pydantic V2 field validators
- Input sanitization + prompt injection detection
- Health monitoring + metrics

### Contact & Contributing

**Live Demo:** https://chika.page (try it now!)
**GitHub:** https://github.com/ruipedro-pinheiro/CHIKA
**Issues:** https://github.com/ruipedro-pinheiro/CHIKA/issues

**Last Updated:** 2025-11-09 16:50 UTC
**Status:** PRODUCTION LIVE with full safeguards ✅
