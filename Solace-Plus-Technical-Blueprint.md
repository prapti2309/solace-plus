# Solace+ Technical Blueprint
### Full-Stack Architecture & Build Specification

**Version:** 1.0
**Companion to:** `Solace-Plus-Roadmap.md` + `Solace-Plus-Implementation-Plan.md`
**Purpose:** The single technical source of truth — exact stack, versions, configs, API contracts, data flow, and deployment topology needed to actually start writing code.

---

## 1. Stack-at-a-Glance

| Layer | Choice | Version (baseline) |
|---|---|---|
| Frontend framework | Next.js (App Router) | 15.x |
| UI language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Animation | Framer Motion | 11.x |
| Component primitives | Radix UI (headless, wrapped in custom design system) | latest |
| Charts | Recharts | 2.x |
| State/data fetching | TanStack Query + Zustand (light global state: theme/emotion) | latest |
| Backend framework | FastAPI | 0.115+ |
| Backend language | Python | 3.12 |
| ORM / migrations | SQLAlchemy 2.0 (async) + Alembic | latest |
| Primary DB | PostgreSQL | 16 |
| Cache/session store | Redis | 7.x |
| Vector DB | Qdrant (self-hosted) | 1.x |
| AI orchestration | LangGraph | latest |
| LLM provider | Anthropic Claude (Messages API) | claude-sonnet-4-6 (chat), claude-haiku for cheap classification tasks |
| Speech-to-text | Whisper (via faster-whisper self-hosted, or OpenAI Whisper API) | large-v3 or API |
| Text-to-speech | ElevenLabs API (fallback: Azure Neural TTS) | — |
| Auth | Auth.js (NextAuth v5) + custom FastAPI JWT verification | — |
| Background jobs | Celery + Celery Beat (Redis broker) | latest |
| Containerization | Docker + Docker Compose (dev), Kubernetes or ECS Fargate (prod) | — |
| CI/CD | GitHub Actions | — |
| Hosting (frontend) | Vercel | — |
| Hosting (backend/services) | AWS (ECS Fargate) or Fly.io | — |
| Observability | Sentry + OpenTelemetry + Grafana/Prometheus | — |
| Secrets | AWS Secrets Manager (or Doppler for simpler start) | — |

---

## 2. Frontend Blueprint (`apps/web`)

### 2.1 Directory Detail
```
apps/web/
├── app/
│   ├── layout.tsx                  # Root layout: fonts, ThemeProvider, QueryProvider
│   ├── globals.css                 # Tailwind base + emotion CSS variables
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── anonymous/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Sidebar + theme-aware shell
│   │   ├── home/page.tsx
│   │   ├── chat/[conversationId]/page.tsx
│   │   ├── journal/page.tsx
│   │   ├── mood-tracker/page.tsx
│   │   ├── wellness/[exerciseId]/page.tsx
│   │   ├── memory/page.tsx
│   │   ├── progress/page.tsx
│   │   ├── insights/page.tsx
│   │   ├── settings/page.tsx
│   │   └── profile/page.tsx
│   └── (safety)/safety-screen/page.tsx
├── components/
│   ├── ui/ (Button, GlassCard, Modal, Toast, Slider, Tabs...)
│   ├── chat/ (ChatBubble, OrbAvatar, StatusIndicator, VoiceRecorder)
│   ├── charts/ (MoodTrendChart, StressGauge, StreakCalendar)
│   ├── theme-engine/ (ThemeProvider.tsx, useEmotionTheme.ts, ambientConfig.ts)
│   └── animations/ (AuroraBackground.tsx, ParticleField.tsx, BreathingPulse.tsx)
├── lib/
│   ├── api-client.ts                # typed fetch wrapper (OpenAPI-generated types)
│   ├── auth.ts
│   └── encryption-helpers.ts        # client-side field masking, never real crypto here
├── hooks/
│   ├── useChatStream.ts             # SSE/WebSocket consumer
│   ├── useMood.ts
│   └── useReducedMotion.ts
└── styles/design-tokens.css
```

### 2.2 Theme Engine (Emotion-Adaptive System)
- CSS custom properties driven by React context, e.g.:
```css
:root {
  --accent-primary: #FFD68A;   /* happy */
  --bg-gradient-start: #0B1220;
  --bg-gradient-end: #16213A;
  --particle-speed: 0.3;
  --transition-duration: 3s;
}
```
- `useEmotionTheme()` hook subscribes to latest `emotion_tags` from chat stream or latest mood entry, and animates CSS variable changes via `framer-motion`'s `animate()` on a hidden state object, applied through `style` bindings — this avoids re-render thrash from unmounting components.
- `prefers-reduced-motion` is checked globally; when true, ambient particle/aurora layers render as static gradients (no motion), satisfying the accessibility requirement without removing the visual identity.

### 2.3 Chat Streaming Contract (client side)
- Connects via `EventSource` (SSE) to `/api/chat/stream?conversation_id=...`
- Event types received: `status` (Listening/Reflecting/Understanding/Thinking), `token` (partial text), `emotion` (detected tag for theming), `done`, `safety_redirect` (triggers navigation to Safety Screen)

---

## 3. Backend Blueprint (`services/api`)

### 3.1 Directory Detail
```
services/api/
├── app/
│   ├── main.py                      # FastAPI app init, CORS, middleware registration
│   ├── core/
│   │   ├── config.py                # Pydantic Settings (env-driven)
│   │   ├── security.py              # JWT issue/verify, password hashing (argon2)
│   │   ├── encryption.py            # AES-256-GCM field encryption utility
│   │   └── rate_limit.py            # Redis-backed limiter middleware
│   ├── routers/
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── mood.py
│   │   ├── journal.py
│   │   ├── memory.py
│   │   ├── safety.py
│   │   ├── recommendations.py
│   │   ├── voice.py
│   │   └── admin.py
│   ├── models/                      # SQLAlchemy ORM models (1 file per table group)
│   ├── schemas/                     # Pydantic request/response schemas
│   ├── services/
│   │   ├── ai_orchestration/
│   │   │   ├── graph.py             # LangGraph state machine definition
│   │   │   ├── prompts/             # versioned system prompts per personality
│   │   │   └── claude_client.py
│   │   ├── emotion_detection/
│   │   │   ├── text_classifier.py
│   │   │   └── emoji_map.py
│   │   ├── memory_engine/
│   │   │   ├── extractor.py         # candidate-fact extraction from conversation
│   │   │   ├── vector_store.py      # Qdrant client wrapper
│   │   │   └── retriever.py
│   │   └── safety_engine/
│   │       ├── keyword_screen.py
│   │       ├── semantic_classifier.py
│   │       └── response_templates.py
│   └── db/
│       ├── session.py
│       └── base.py
├── alembic/
└── tests/
    ├── unit/
    ├── integration/
    └── safety_redteam/               # adversarial prompt suite, run in CI
```

### 3.2 LangGraph Orchestration Flow

```
[User Message]
      │
      ▼
[Safety Pre-Check Node] ──imminent/elevated──► [Safety Response Node] ──► [Client: safety_redirect]
      │ none/flagged(low)
      ▼
[Emotion Detection Node]
      │
      ▼
[Memory Retrieval Node] (Qdrant top-k, filtered by consent + category)
      │
      ▼
[Prompt Assembly Node] (personality system prompt + history + memory context)
      │
      ▼
[Claude Call Node] (streaming)
      │
      ▼
[Persist + Emit Node] → stores message, emits SSE events to client
```

### 3.3 Core API Contract (representative endpoints)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/anonymous
POST   /api/auth/refresh
POST   /api/auth/2fa/verify

GET    /api/conversations
POST   /api/conversations
GET    /api/chat/stream?conversation_id={id}      (SSE)
POST   /api/chat/message                           (fallback non-streaming)
DELETE /api/conversations/{id}

GET    /api/mood
POST   /api/mood
GET    /api/mood/trends?range=weekly|monthly

GET    /api/journal
POST   /api/journal
POST   /api/journal/{id}/summarize                 (async job trigger)

GET    /api/memory
POST   /api/memory/consent                          (per-category consent toggle)
PATCH  /api/memory/{id}
DELETE /api/memory/{id}
POST   /api/memory/pause
POST   /api/memory/export

POST   /api/voice/transcribe
POST   /api/voice/synthesize

GET    /api/recommendations

GET    /api/admin/metrics
GET    /api/admin/safety-events

GET    /api/user/export                             (GDPR full export)
DELETE /api/user/delete                             (GDPR full delete — cascades Postgres, Redis, Qdrant)
```

### 3.4 Data Flow: Message Encryption
```
Client → HTTPS/TLS 1.3 → FastAPI
                             │
                    encrypt_field(content)  [AES-256-GCM, key from KMS]
                             │
                         Postgres (ciphertext + nonce stored)
                             │
                    decrypt_field() only at read-time, in-memory, never logged
```

---

## 4. AI/ML Component Detail

| Component | Approach | Model |
|---|---|---|
| Main conversation | Streaming chat completion | Claude (Sonnet-tier) via Messages API |
| Safety semantic classification | Fast, cheap classification call with strict structured JSON output | Claude (Haiku-tier) with constrained prompt, or a fine-tuned lightweight classifier for latency-critical path |
| Text emotion detection | Lightweight local model (fast, no per-message API cost) | Fine-tuned DistilRoBERTa emotion classifier, hosted alongside API |
| Memory fact extraction | Structured extraction call, JSON-only output | Claude (Haiku-tier) |
| Journal summarization | Async batch job | Claude (Sonnet-tier), run via Celery worker, not on request path |
| Speech-to-text | Self-hosted or API | Whisper large-v3 |
| Text-to-speech | API | ElevenLabs (voice profile: calm, warm, moderate pace) |

**Latency budget target:** safety pre-check must resolve in <300ms before the main LLM call begins streaming — this is why the safety classifier runs on a fast/cheap model or local classifier, not the main conversational model.

---

## 5. Infrastructure & Deployment Topology

```
                         ┌─────────────┐
                         │   Vercel     │  (Next.js frontend, edge CDN)
                         └──────┬──────┘
                                │ HTTPS
                         ┌──────▼──────┐
                         │ Load Balancer│
                         └──────┬──────┘
                    ┌───────────┼────────────┐
              ┌─────▼─────┐          ┌───────▼───────┐
              │ FastAPI    │          │ FastAPI        │
              │ (Fargate)  │   ...    │ (Fargate)      │  (auto-scaled task group)
              └─────┬─────┘          └───────┬───────┘
                    │                        │
       ┌────────────┼────────────────────────┼─────────────┐
       │            │                        │             │
 ┌─────▼────┐ ┌─────▼─────┐          ┌───────▼──────┐ ┌────▼─────┐
 │ Postgres  │ │  Redis     │          │ Qdrant        │ │ Celery   │
 │ (RDS)     │ │ (ElastiCache)│        │ (self-hosted) │ │ Workers  │
 └───────────┘ └────────────┘          └───────────────┘ └──────────┘
```

- **Environments:** `dev` (local Docker Compose), `staging` (mirrors prod, smaller instance sizes), `prod`
- **Docker Compose (dev)** services: `web`, `api`, `postgres`, `redis`, `qdrant`, `worker`
- **Secrets:** injected via environment at deploy time, never committed; rotated quarterly
- **Backups:** Postgres automated daily snapshots (30-day retention); Qdrant snapshot exports weekly

---

## 6. Environment Variables (representative)

```
# Backend (.env)
DATABASE_URL=postgresql+asyncpg://...
REDIS_URL=redis://...
QDRANT_URL=http://...
ANTHROPIC_API_KEY=...
JWT_SECRET=...
FIELD_ENCRYPTION_KEY=...          # sourced from KMS, not hardcoded
ELEVENLABS_API_KEY=...
WHISPER_MODE=api|local
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
SENTRY_DSN=...

# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
```

---

## 7. CI/CD Pipeline

```
on: push / pull_request
jobs:
  lint        → eslint (web), ruff (api)
  typecheck   → tsc --noEmit, mypy
  test        → jest/vitest (web), pytest (api incl. safety_redteam suite)
  build       → next build, docker build (api)
  deploy      → (main branch only) → staging auto-deploy → manual promote to prod
```
- **Safety red-team suite runs on every PR touching `safety_engine/` or prompts** — failing this suite blocks merge, no exceptions.

---

## 8. Security Checklist (Blueprint-Level)

- TLS 1.3 everywhere; HSTS enabled
- AES-256-GCM field-level encryption for: messages, journal content, memory descriptions, emergency contact
- Argon2id for password hashing
- JWT access tokens (short-lived, 15 min) + rotating refresh tokens (httpOnly, secure cookies)
- Rate limiting per user/IP on auth and chat endpoints (Redis sliding window)
- RBAC enforced at router-dependency level (`Depends(require_role("support_admin"))`)
- Audit log on every consent change and every memory/data deletion
- Vector DB entries namespaced and access-checked by `user_id` — no cross-user retrieval possible even in a bug scenario (defense in depth: filter at query time AND separate collections per user tier if scale requires it)

---

## 9. How This Blueprint Maps Back

| Roadmap Phase | Implementation Plan Phase | Blueprint Section(s) |
|---|---|---|
| Privacy & Security | Phase 0 & 1 | §5, §6, §8 |
| AI Chat Engine | Phase 2 | §3.2, §3.3, §4 |
| Safety System | Phase 3 | §3.2, §4, §7, §8 |
| Memory System | Phase 4 | §3.1 (memory_engine), §3.3, §8 |
| Mood/Wellness/Journal | Phase 5 & 6 | §2.1, §3.3, §4 |
| Emotion-Adaptive UI | Phase 7 | §2.2 |
| Progress/Admin | Phase 8 | §3.3, §5 |
| Hardening/Launch | Phase 9 | §7, §8 |

---

*This blueprint should be treated as living documentation — update it as concrete architectural decisions are made or revised during implementation.*
