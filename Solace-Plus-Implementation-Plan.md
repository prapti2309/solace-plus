# Solace+ Implementation Plan
### Engineering Execution Plan — Derived from Product Roadmap

**Version:** 1.0
**Companion to:** `Solace-Plus-Roadmap.md`
**Purpose:** Translate each roadmap phase into concrete, buildable engineering work — repo structure, schemas, APIs, sprint breakdowns, and Definition of Done for every phase.

---

## 0. How This Plan Is Organized

Each phase below includes:
- **Duration & dependencies**
- **Sprint-level task breakdown**
- **Concrete deliverables** (files, endpoints, schemas, components)
- **Definition of Done (DoD)**
- **Risks / things that block the next phase**

Total estimated timeline: **~26 weeks (6 months) to launch-ready beta**, matching the roadmap, executed in 2-week sprints (13 sprints).

---

## 1. Repository & Project Structure

```
solace-plus/
├── apps/
│   ├── web/                      # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── home/
│   │   │   │   ├── chat/
│   │   │   │   ├── journal/
│   │   │   │   ├── mood-tracker/
│   │   │   │   ├── wellness/
│   │   │   │   ├── memory/
│   │   │   │   ├── progress/
│   │   │   │   ├── insights/
│   │   │   │   ├── settings/
│   │   │   │   └── profile/
│   │   │   └── (safety)/safety-screen/
│   │   ├── components/
│   │   │   ├── ui/               # design system primitives
│   │   │   ├── chat/
│   │   │   ├── charts/
│   │   │   ├── theme-engine/
│   │   │   └── animations/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── styles/
│   └── admin/                    # Separate admin dashboard app
├── services/
│   ├── api/                      # FastAPI backend
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── routers/
│   │   │   │   ├── auth.py
│   │   │   │   ├── chat.py
│   │   │   │   ├── mood.py
│   │   │   │   ├── journal.py
│   │   │   │   ├── memory.py
│   │   │   │   ├── safety.py
│   │   │   │   ├── recommendations.py
│   │   │   │   └── admin.py
│   │   │   ├── core/              # config, security, encryption
│   │   │   ├── models/            # SQLAlchemy models
│   │   │   ├── schemas/           # Pydantic schemas
│   │   │   ├── services/
│   │   │   │   ├── ai_orchestration/
│   │   │   │   ├── emotion_detection/
│   │   │   │   ├── memory_engine/
│   │   │   │   └── safety_engine/
│   │   │   └── db/
│   │   └── tests/
│   └── worker/                    # Background jobs (Celery/RQ): reminders, reports
├── packages/
│   ├── shared-types/               # Shared TS/py types via OpenAPI codegen
│   └── design-tokens/
├── infra/
│   ├── docker/
│   ├── terraform/ (or pulumi)
│   └── ci-cd/
└── docs/
    ├── Solace-Plus-Roadmap.md
    └── Solace-Plus-Implementation-Plan.md
```

---

## 2. Phase 0 — Foundation & Compliance (Sprint 1, Weeks 1–2)

**Dependencies:** None
**Goal:** Nothing ships without this phase locked down.

### Tasks
1. **Legal/Clinical**
   - Draft privacy policy + terms of service (mental-health-data specific clauses)
   - Recruit/contract a licensed mental health clinical advisor for ongoing review
   - Draft the crisis-response protocol document (exact language, escalation tree) — clinical advisor sign-off required
2. **Repo & Infra Bootstrap**
   - Monorepo setup (Turborepo or Nx)
   - CI/CD pipeline: lint → test → build → deploy (GitHub Actions)
   - Environments: `dev`, `staging`, `prod` with isolated databases and secrets
   - Secrets management (e.g., AWS Secrets Manager / Doppler / Vault)
3. **Design System Bootstrap**
   - Tailwind config with Solace+ design tokens (colors per emotion state, spacing scale, radius scale 20–28px)
   - Typography setup: Inter, Plus Jakarta Sans, Manrope via `next/font`
   - Base component library scaffold: Button, Card (glass), Input, Modal, Toast

### Deliverables
- `docs/privacy-policy.md`, `docs/crisis-protocol.md` (clinically reviewed, versioned)
- Working CI pipeline with green build on `main`
- `packages/design-tokens` published and consumed by `apps/web`

### Definition of Done
- Clinical advisor has signed off on the crisis protocol document
- A developer can clone repo → `pnpm install` → `pnpm dev` and see a themed empty shell app

### Risk
- Legal/clinical review often takes longer than engineering estimates — start this in parallel with Sprint 1 engineering, don't block on it sequentially.

---

## 3. Phase 1 — Core Infrastructure (Sprints 2–3, Weeks 3–6)

### 3.1 Database Schema (PostgreSQL)

```sql
-- users
users (
  id UUID PK,
  email TEXT UNIQUE NULLABLE,       -- null for anonymous
  password_hash TEXT NULLABLE,
  auth_provider TEXT,               -- 'email' | 'google' | 'anonymous'
  is_anonymous BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ
)

-- profiles (consent-gated, nullable fields)
profiles (
  user_id UUID FK -> users.id,
  name TEXT,
  nickname TEXT,
  age_group TEXT,
  pronouns TEXT,
  timezone TEXT,
  language TEXT,
  goals JSONB,
  interests JSONB,
  occupation TEXT,
  routine JSONB,
  communication_style TEXT,
  emergency_contact JSONB ENCRYPTED,
  consent_flags JSONB   -- per-field consent tracking
)

-- consent_log (audit trail)
consent_log (
  id UUID PK,
  user_id UUID FK,
  field_name TEXT,
  action TEXT,           -- granted | revoked
  timestamp TIMESTAMPTZ
)

-- sessions / devices
sessions (
  id UUID PK,
  user_id UUID FK,
  device_info JSONB,
  ip_hash TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)

-- moods
mood_entries (
  id UUID PK,
  user_id UUID FK,
  mood_label TEXT,        -- happy|calm|sad|anxious|angry|exhausted
  intensity SMALLINT,
  note TEXT NULLABLE,
  created_at TIMESTAMPTZ
)

-- journals
journal_entries (
  id UUID PK,
  user_id UUID FK,
  type TEXT,              -- daily|gratitude|voice
  content TEXT ENCRYPTED,
  ai_summary TEXT NULLABLE,
  mood_tag TEXT NULLABLE,
  created_at TIMESTAMPTZ
)

-- conversations & messages
conversations (
  id UUID PK,
  user_id UUID FK,
  title TEXT,
  category TEXT,
  created_at TIMESTAMPTZ
)

messages (
  id UUID PK,
  conversation_id UUID FK,
  role TEXT,              -- user|assistant
  content TEXT ENCRYPTED,
  emotion_tags JSONB,
  created_at TIMESTAMPTZ
)

-- memories (structured facts; vectors live in Qdrant/Chroma, referenced by id)
memories (
  id UUID PK,
  user_id UUID FK,
  category TEXT,           -- goals|family|relationships|triggers|preferences|coping|achievements|dates|notes
  title TEXT,
  description TEXT ENCRYPTED,
  importance SMALLINT,
  is_locked BOOLEAN DEFAULT false,
  vector_id TEXT NULLABLE, -- pointer into vector DB
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- safety_events (no raw content stored beyond what's clinically necessary)
safety_events (
  id UUID PK,
  user_id UUID FK,
  severity TEXT,          -- flagged|elevated|imminent
  action_taken TEXT,
  created_at TIMESTAMPTZ
)
```

### 3.2 Backend Tasks
- FastAPI project scaffold with async SQLAlchemy + Alembic migrations
- Auth router: register/login (email+password), Google OAuth, anonymous session issuance, JWT + refresh token flow, optional TOTP 2FA
- RBAC middleware (`user`, `support_admin`, `system_admin` roles)
- Field-level encryption utility (AES-256-GCM) applied to sensitive columns (journal content, messages, memory descriptions, emergency contact)
- Redis integration: session cache, rate limiting middleware

### 3.3 Frontend Tasks
- Auth pages (sign up, login, Google button, "Continue anonymously")
- Global auth context/provider + protected route wrapper
- Base design system components wired to theme tokens

### Definition of Done
- User can register, log in, log out, and access a protected dashboard shell
- Anonymous mode creates a Redis-backed temp session with no Postgres user row
- All sensitive fields verified encrypted at rest (spot-checked via direct DB query)

---

## 4. Phase 2 — AI Chat Engine (Sprints 3–5, Weeks 6–10, overlaps Phase 1 tail)

### Backend
- `POST /chat/message` — streaming endpoint (SSE or WebSocket) that:
  1. Persists user message (encrypted)
  2. Runs emotion detection (see 4.2)
  3. Assembles prompt: system prompt (personality mode) + recent history + retrieved memory (stubbed until Phase 4) + safety pre-check
  4. Streams Claude response back to client
  5. Persists assistant message
- System prompt library per personality mode (Gentle Listener / Practical Coach / Motivator / Reflective Guide) — versioned in `services/api/app/services/ai_orchestration/prompts/`
- Conversation CRUD: list, rename, pin, search, delete

### 4.2 Emotion Detection (v1 — text only)
- Sentiment/emotion classifier (start with a hosted API or fine-tuned lightweight model; e.g., a distilled RoBERTa emotion classifier) run on each user message
- Emoji-to-emotion mapping table
- Output: `{ primary_emotion, intensity, secondary_signals[] }` attached to `messages.emotion_tags` and fed into the theme engine (Phase 7 consumes this)

### Frontend
- Chat UI: floating glass bubbles, streaming text render, status states ("Listening…", "Reflecting…", "Understanding…", "Thinking…") mapped to backend processing stages
- Glowing orb avatar component (idle / pulsing-while-responding states) — placeholder animation now, refined in Phase 7
- Conversation list/search/pin UI

### Definition of Done
- End-to-end streaming conversation works with at least 2 personality modes
- Every message gets an emotion tag stored
- Conversations persist, are searchable, and are fully encrypted at rest

---

## 5. Phase 3 — Safety System (Sprints 4–6, Weeks 8–12 — highest priority, overlaps Phase 2)

**This phase gates public release. No shortcuts.**

### Backend
- Safety pre-check runs **before** every message reaches the main LLM call:
  - Layer 1: fast keyword/regex screen for high-risk phrases
  - Layer 2: semantic classifier (fine-tuned or prompted Claude classification call) for risk severity (`none | flagged | elevated | imminent`)
  - Layer 3: on `elevated`/`imminent`, short-circuit normal chat flow and route to the Safety Protocol response generator (uses clinically-reviewed templates, not freeform generation, for the highest-risk tier)
- `safety_events` logged (severity + action taken, not raw content) for admin visibility
- Escalation logic: `imminent` → surface crisis resources + trusted contact prompt immediately, keep session open, never auto-terminate

### Frontend
- Safety Screen component: calm, soft-colored, no flashing, options = Continue chatting / Contact trusted person / View coping exercises / Find local crisis resources / Emergency guidance
- Local crisis resource lookup (by user locale/timezone/IP-derived region, with manual override)

### Testing (mandatory before any further phase ships to real users)
- Build a red-team test suite (100+ adversarial prompts across ideation, indirect language, escalating conversations, multi-turn evasion)
- Clinical advisor reviews transcript outputs
- Track false-negative rate to near-zero as the release blocker metric

### Definition of Done
- Red-team suite passes clinical review sign-off
- Safety screen triggers correctly in staging for all test cases
- Admin dashboard (stub) shows safety event counts

---

## 6. Phase 4 — Memory System (Sprints 6–7, Weeks 10–14)

### Backend
- Vector DB setup (Qdrant self-hosted or Chroma) — one collection per environment, namespaced by `user_id`
- Memory write path: on conversation end (or explicit "remember this"), extraction service pulls candidate facts → presents to user for consent confirmation → on accept, writes to `memories` table + embeds into vector DB
- Memory retrieval: on each chat turn, top-k semantic search scoped to `user_id`, filtered by consented categories, injected into prompt context
- Memory management endpoints: list, edit, delete, lock, pause-all, disable-all, export (JSON download)

### Frontend
- Memory page: card grid by category, timeline view, search/filter
- Memory detail modal: edit/delete/lock controls
- "AI-suggested relationship map" — simple graph view (defer complex version to Phase 10; ship a basic category-linked graph now)
- Consent toggles surfaced during onboarding and in Settings → Memory Management

### Definition of Done
- User can decline memory entirely and chat still works statelessly
- Export produces a complete, human-readable JSON of all stored memories
- Deleting/pausing memory immediately stops it from being retrieved in the next chat turn (verify via test)

---

## 7. Phase 5 — Mood Tracking & Wellness Toolkit (Sprints 7–8, Weeks 12–16)

### Backend
- `mood_entries` CRUD + aggregation endpoints (weekly/monthly rollups, trigger frequency, improvement score calculation)
- Wellness content service: static content library (JSON/CMS-backed) for breathing exercises, CBT modules, grounding scripts — versionable without code deploys

### Frontend
- Mood check-in widget (home dashboard + standalone page)
- Mood Tracker page: calendar heatmap, weekly/monthly trend charts (Recharts), stress/anxiety/burnout scores
- Wellness Toolkit page: card grid, each opening a guided-flow modal/page with animation (box breathing pacer, 4-7-8 timer, 5-4-3-2-1 grounding steps, PMR script, sleep guidance)
- CBT toolkit flows: thought record form, cognitive distortion picker, reframing exercise, gratitude journal entry point

### Recommendation Engine (v1 — rule-based)
- Simple rules engine: `mood + time_of_day + recent_activity_gap → suggested activity`
- Defer ML-personalized recommendations to post-launch (Phase 10)

### Definition of Done
- Mood check-ins visible in trend charts within the same session
- At least 6 wellness exercises fully built with working timers/animations
- Recommendations appear on home dashboard based on latest mood entry

---

## 8. Phase 6 — Journal & Voice (Sprints 8–9, Weeks 14–18)

### Backend
- Journal CRUD endpoints (+ AI summary generation job — async, via worker queue)
- Whisper integration endpoint: `POST /voice/transcribe` (audio upload → text)
- TTS endpoint: `POST /voice/synthesize` (text → audio stream) for assistant voice responses
- Voice journaling: transcribe → store as journal entry with `type=voice`, retain original audio only if user opts in (else discard immediately post-transcription)

### Frontend
- Journal page (Apple-Notes-like layout): list, editor, search, timeline
- Voice input button in chat + journal (record → waveform indicator → transcribe)
- Voice output toggle in chat settings
- Gratitude journal quick-entry flow

### Definition of Done
- Voice message round-trips: record → transcribe → AI response → optional TTS playback
- Journal AI summaries generate asynchronously without blocking the UI
- Audio is discarded post-transcription unless explicit consent to retain is given

---

## 9. Phase 7 — Emotion-Adaptive UI (Sprints 9–10, Weeks 16–20)

### Frontend (this phase is UI/animation-heavy, minimal backend)
- **Theme Engine**: React context that maps `current_detected_emotion` (from latest message's `emotion_tags` or latest mood check-in) → CSS variable set (colors, gradient stops, particle behavior config)
- Transition logic: all theme changes animate over 2–5s using Framer Motion `transition={{ duration: 3 }}` style easing — never instant
- Ambient background system: layered canvas/WebGL or CSS-only blurred blob components, aurora effect for "Hopeful", breathing-synced pulse for "Anxiety" state
- Orb avatar: idle float animation, pulse-while-responding, color shifts with theme
- Full micro-interaction pass: hover glows, elastic button presses, liquid page transitions, message fade-ins

### Definition of Done
- Switching detected/selected mood visibly and smoothly re-themes the entire app in real time
- No animation exceeds "calm" motion budget (design QA checklist: no motion faster than defined max velocity/duration thresholds)
- Anxiety-state breathing animation actually syncs to a fixed slow cadence (e.g., 4s inhale / 4s exhale)

---

## 10. Phase 8 — Progress, Notifications, Admin (Sprints 10–11, Weeks 20–23)

### Backend
- Progress aggregation endpoints (streaks, activity completion %, monthly report generation — worker job)
- Notification service: scheduling engine (Celery beat / cron) for mood check-in reminders, hydration, journaling nudges, therapy-appointment reminders (user-created), gratitude prompts
- Push notification delivery (Web Push / FCM)
- Admin API: aggregated, anonymized metrics only — active users, error rates, AI response latency/quality sampling, safety event counts, feedback trends

### Frontend
- Progress dashboard: streaks, weekly/monthly report views, animated charts
- Notification preference center in Settings
- Separate Admin app (`apps/admin`): system health dashboard, safety event monitor (counts/severity only, no content), feedback trend viewer

### Definition of Done
- Admin dashboard shows real aggregated data from staging with zero exposure of raw conversation/journal content
- Notifications fire on schedule and respect user-configured quiet hours/timezone

---

## 11. Phase 9 — Hardening & Launch Prep (Sprints 11–13, Weeks 23–26)

### Security & Compliance
- Full third-party security audit + penetration test
- Verify GDPR export/delete flows end-to-end (data fully purged across Postgres, Redis, and vector DB on delete request)
- Rate limiting and abuse-prevention review
- Dependency vulnerability scan (Snyk/Dependabot) resolved

### Quality
- Accessibility audit (WCAG 2.1 AA): screen reader pass on chat, keyboard navigation, motion-reduction setting (`prefers-reduced-motion` respected — critical given the animation-heavy UI)
- Load testing (chat streaming under concurrent load, especially safety-check latency under load)
- Cross-device/browser QA

### Beta
- Closed beta with mental-health-literate reviewers + general users
- Feedback loop → triage → fix cycle (1–2 sprints buffer)
- App Store / Play Store listing prep (screenshots, privacy nutrition labels, content ratings — mental health category disclosures)

### Definition of Done
- Zero critical/high security findings unresolved
- Reduced-motion mode fully disables ambient/particle animation without breaking layout
- Beta feedback triaged with no unresolved safety-related bugs

---

## 12. Phase 10 — Post-Launch Enhancements

- Voice emotion analysis (tremor, crying probability, confidence) as an opt-in beta feature
- Typing-behavior-based emotion signals (consent-gated, off by default)
- Full AI-generated memory relationship graph (beyond the basic version shipped in Phase 4)
- ML-personalized recommendation engine (replace rule-based v1)
- Continuous safety-model refinement using anonymized, aggregate usage patterns
- Expand language support beyond initial launch set

---

## 13. Cross-Cutting Concerns (Apply Throughout All Phases)

| Concern | Practice |
|---|---|
| **Encryption** | Every field touching personal/emotional content encrypted at rest from Phase 1 onward — never retrofitted |
| **Consent** | No new memory/data category ships without a corresponding consent toggle and audit log entry |
| **Testing** | Unit tests for services, integration tests for API routes, red-team suite for safety (continuously expanded) |
| **Observability** | Structured logging with PII redaction; Sentry error tracking from Phase 1 |
| **Accessibility** | Reduced-motion and screen-reader support considered in every UI phase, not bolted on at the end |
| **Feature flags** | Use flags (e.g., LaunchDarkly or simple config-based) to gate risky features (voice analysis, new safety models) for gradual rollout |

---

## 14. Sprint Calendar Overview (13 × 2-week Sprints)

| Sprint | Weeks | Focus |
|---|---|---|
| 1 | 1–2 | Phase 0: Foundation & Compliance |
| 2–3 | 3–6 | Phase 1: Core Infrastructure |
| 3–5 | 6–10 | Phase 2: AI Chat Engine (overlaps) |
| 4–6 | 8–12 | Phase 3: Safety System (overlaps, top priority) |
| 6–7 | 10–14 | Phase 4: Memory System |
| 7–8 | 12–16 | Phase 5: Mood Tracking & Wellness Toolkit |
| 8–9 | 14–18 | Phase 6: Journal & Voice |
| 9–10 | 16–20 | Phase 7: Emotion-Adaptive UI |
| 10–11 | 20–23 | Phase 8: Progress, Notifications, Admin |
| 11–13 | 23–26 | Phase 9: Hardening & Launch Prep |
| Post-launch | 26+ | Phase 10: Enhancements |

---

*All safety-critical and clinical-content work (Phase 3 in particular) requires clinical advisor sign-off before any release to real users — this gate is non-negotiable and should not be compressed to meet a timeline.*
