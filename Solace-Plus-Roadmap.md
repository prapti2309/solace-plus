# Solace+ — Listen. Understand. Support.
### Product Roadmap & Technical Requirements Document

---

## 1. Overview

**Product**: Solace+ — an AI-powered mental wellness companion offering emotionally adaptive conversations, mood tracking, long-term consent-based memory, evidence-informed coping tools, and crisis safety detection.

**Positioning**: Not a clinical/medical app. A calm, private, emotionally intelligent space — closer to Headspace/Calm/Linear/Apple in feel than to a hospital portal or generic chatbot.

**Core Differentiators**
- Emotion-Adaptive UI that shifts color, motion, and ambience with detected mood
- Consent-first, user-controlled long-term memory
- Multi-signal emotion detection (text, emoji, typing behavior, optional voice)
- Built-in crisis detection and safety escalation flow
- CBT/MI-informed coping toolkit, not diagnosis or therapy replacement

---

## 2. Suggested Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js (React) + TypeScript | App Router, SSR for SEO/marketing pages, CSR for app shell |
| Styling | Tailwind CSS | Design tokens for emotion-adaptive theming |
| Animation | Framer Motion + Lottie | Slow, therapeutic motion curves |
| Backend | FastAPI (Python) | Async, OpenAPI docs, good ML/AI ecosystem fit |
| Primary DB | PostgreSQL | Users, profiles, journals, mood logs, structured memory metadata |
| Cache/Session | Redis | Sessions, rate limiting, ephemeral anonymous-mode memory |
| Vector DB | Qdrant or Chroma | Semantic memory retrieval (RAG over user memories) |
| Memory Orchestration | LangGraph / LangChain | Memory read/write policies, retrieval pipelines |
| LLM Provider | Claude (Anthropic API) primary; pluggable adapter for GPT/Gemini/self-hosted Llama | Model-agnostic service layer |
| Speech-to-Text | Whisper (OpenAI) or self-hosted faster-whisper | Voice journaling / voice chat |
| Text-to-Speech | ElevenLabs / Azure Neural TTS | Calm, warm voice profile |
| Auth | Clerk, Firebase Auth, or Auth.js (NextAuth) | Email/password, Google OAuth, anonymous sessions, optional 2FA |
| Charts | Recharts | Mood trends, dashboards |
| Notifications | Firebase Cloud Messaging / OneSignal | Push + in-app soft reminders |
| Infra | Docker + Kubernetes (or Render/Fly.io for MVP) | Containerized services |
| CI/CD | GitHub Actions | Lint, test, build, deploy pipelines |
| Observability | Sentry (errors), Grafana + Prometheus (metrics), PostHog (product analytics) | Anonymous-first analytics |
| Secrets Mgmt | Doppler / AWS Secrets Manager / Vault | API keys, DB creds |
| Storage | S3-compatible (S3/Cloudflare R2) | Voice recordings, profile images |
| Encryption | AES-256 at rest, TLS 1.3 in transit, field-level encryption for sensitive memory fields | |

---

## 3. High-Level Architecture

```
[Next.js Web/App Client]
        │  (HTTPS/WSS)
[API Gateway / FastAPI Backend]
   ├── Auth Service (Clerk/Auth.js)
   ├── Chat Orchestration Service
   │      ├── LLM Adapter (Claude/GPT/Gemini/Llama)
   │      ├── Emotion Detection Service (NLP + emoji + typing signals)
   │      └── Safety/Crisis Detection Middleware (runs on every message)
   ├── Memory Service
   │      ├── PostgreSQL (structured memory + metadata)
   │      └── Vector DB (semantic recall via embeddings)
   ├── Mood & Journal Service (PostgreSQL)
   ├── Notification Service
   ├── Speech Service (Whisper STT / TTS)
   └── Admin & Analytics Service (aggregated, anonymized)
        │
[Redis: sessions, cache, rate limits, anonymous ephemeral memory]
```

**Key architectural rule**: The Safety/Crisis Detection Middleware sits in-line on every chat turn, before the response is returned to the user, independent of which LLM backend is active.

---

## 4. Roadmap Phases

### Phase 0 — Discovery & Foundations (Weeks 1–3)
- Finalize scope, compliance requirements (GDPR-style, regional mental-health app regulations)
- Define ethical/safety guidelines with a mental-health professional advisor (recommended, not optional)
- Design system foundations: color tokens per emotional state, typography scale, motion tokens
- Set up repo, CI/CD, environments (dev/staging/prod), infra skeleton
- Data model design (Postgres schema + vector schema)

**Deliverables**: Architecture doc, design tokens, DB schema v1, project scaffolding

---

### Phase 1 — MVP Core (Weeks 4–9)
- Auth: email/password, Google sign-in, anonymous mode
- Basic profile with consent-gated fields
- Core chat engine (single LLM provider, non-adaptive UI first)
- Basic emotion detection from text sentiment only
- Mood check-in (emoji-based) + simple mood history
- Crisis keyword detection (rule-based first pass) + static safety response flow
- Minimal dashboard (recent chats, mood log)
- Basic settings (privacy toggle, delete account/data)

**Deliverables**: Usable MVP web app, safety flow v1, mood tracking v1

---

### Phase 2 — Memory & Personalization (Weeks 10–15)
- Consent-based memory system (basic + advanced tiers)
- Memory CRUD UI (view/edit/delete/pause/export)
- Vector DB integration for semantic recall
- LangGraph/LangChain memory retrieval pipeline
- Conversation style selector (Gentle Listener, Practical Coach, Motivator, Reflective Guide)
- Journaling module (text + mood tagging + AI reflection)

**Deliverables**: Working memory system with full user controls, journal module

---

### Phase 3 — Emotion-Adaptive Experience (Weeks 16–21)
- Emotion-Adaptive theming engine (color/gradient/ambient transitions, 2–5s easing)
- Ambient background system (particles, aurora, blobs, breathing sync for anxiety state)
- Glowing-orb AI avatar with pulse animation
- Typing-state indicators (Listening…, Reflecting…, Understanding…, Thinking…)
- Emoji-based emotion signal layer added to text sentiment
- Typing-behavior signal capture (speed, pauses, deletions) — consent-gated

**Deliverables**: Full emotion-adaptive UI shipped across chat, home, and mood pages

---

### Phase 4 — Wellness & CBT Toolkits (Weeks 22–26)
- Guided breathing (box breathing, 4-7-8), grounding (5-4-3-2-1), PMR, mindfulness
- CBT toolkit: thought records, cognitive distortion ID, reframing, behavioral activation, values clarification, self-compassion prompts
- Personalized recommendation engine (mood → activity mapping)
- Sleep, hydration, gratitude, affirmation reminder system
- Wellness activity streaks

**Deliverables**: Full wellness/CBT toolkit with recommendation logic

---

### Phase 5 — Voice & Advanced Signals (Weeks 27–31)
- Voice input (Whisper STT) and voice output (TTS) in chat
- Voice journaling
- Optional voice emotion analysis (pitch, tremor, pace, hesitation, crying probability) — explicit opt-in, clearly disclosed
- Panic support flow (real-time guided intervention)

**Deliverables**: Voice-enabled chat and journaling, enhanced emotion signals

---

### Phase 6 — Safety Hardening & Compliance (Weeks 32–35, run in parallel throughout)
- Full crisis-detection pipeline: ML classifier + rule-based keyword layer + context-aware scoring
- Calming Safety Screen UI (no flashing, soft colors)
- Escalation flow: trusted contact prompt, professional-help prompt, localized crisis resources, emergency guidance
- Security audit: encryption review, penetration testing, role-based access control audit
- GDPR-style data export/delete flow, audit logging, session/device management
- Legal review of disclaimers (not a therapist, not diagnostic)

**Deliverables**: Safety system certified by internal/external review, compliance documentation

---

### Phase 7 — Dashboards, Insights & Admin (Weeks 36–39)
- Progress dashboard (mood, anxiety, stress, streaks, animated Recharts visualizations)
- AI-generated weekly/monthly insight summaries
- Memory relationship map (visual graph of connected memories)
- Admin dashboard: active users, system health, safety event counts (aggregated, privacy-preserving), feedback trends, AI response quality metrics

**Deliverables**: User-facing insights + internal admin analytics dashboard

---

### Phase 8 — Polish, Accessibility & Launch Prep (Weeks 40–44)
- Accessibility pass (contrast, screen readers, reduced-motion setting, keyboard nav)
- Performance optimization (bundle size, lazy loading, animation frame budgets)
- Cross-device QA (mobile web, tablet, desktop)
- Beta testing with feedback loop + safety-response red-teaming
- App Store / Play Store packaging (if wrapped via Capacitor/Expo or native shell)

**Deliverables**: Production-ready, accessible, tested application

---

### Phase 9 — Launch & Post-Launch (Week 45+)
- Staged rollout (waitlist → limited beta → GA)
- Monitoring dashboards live (Sentry, Grafana, PostHog)
- Feedback-driven iteration cadence (bi-weekly release cycle)
- Continued safety-system tuning based on real (anonymized) event patterns

---

## 5. Functional Requirements Summary

**Auth & Profile**: email/password, Google OAuth, anonymous mode, optional 2FA, consent-gated profile fields, device/session management.

**Chat Engine**: multi-provider LLM adapter, CBT/MI-style conversational techniques, category-aware context (personal, relationships, mental wellness, student life, office life), conversation search, pin important chats.

**Emotion Detection**: text sentiment/intensity, emoji mapping, typing-behavior signals (consent-based), optional voice-based signals.

**Memory System**: tiered (basic/advanced), full user control (view/edit/delete/pause/disable/export), semantic + structured storage.

**Mood Tracking**: daily emoji check-in, weekly/monthly trends, emotional calendar, trigger frequency, improvement scoring.

**Recommendations**: mood-mapped suggestions (meditation, music, journaling, exercise, breathing, affirmations, digital detox, sleep hygiene).

**CBT & Wellness Toolkits**: as detailed in Phase 4.

**Safety System**: real-time crisis-phrase detection, calm compassionate response, escalation to trusted contact/professional/local crisis resources, non-abrupt conversation continuity, clear non-therapist disclaimers.

**Dashboards**: user progress dashboard; admin dashboard with aggregated, privacy-preserving metrics only.

**Notifications**: soft, non-intrusive reminders (hydration, mood check-in, journaling, meditation, gratitude, user-created therapy appointments).

---

## 6. Non-Functional Requirements

- **Privacy & Security**: end-to-end encrypted conversations, encrypted DB fields for sensitive memory, no data selling, role-based backend access, full audit logging, secure API key handling, GDPR-style export/delete.
- **Performance**: chat response latency target < 2s perceived (streaming tokens), animation frame budget ≥ 55fps on mid-tier devices.
- **Accessibility**: WCAG 2.1 AA target, reduced-motion mode, screen-reader support, adjustable animation intensity.
- **Scalability**: stateless API layer behind load balancer, horizontally scalable chat/memory services, Redis-backed session/rate-limiting.
- **Reliability**: 99.9% uptime target for chat and safety systems specifically (safety path should have its own health checks and fallback static response if LLM is unavailable).
- **Compliance**: GDPR-style data rights globally; region-specific mental-health app regulations should be reviewed with legal counsel before launch (this varies by country and is not something to infer from general knowledge).

---

## 7. Data Model (Simplified)

**Postgres core tables**
- `users` (auth id, email, anon flag, created_at)
- `profiles` (user_id, name, nickname, age_group, pronouns, timezone, language, goals, interests, occupation, routine, comm_style, emergency_contact)
- `memories` (id, user_id, title, description, category, importance, created_at, locked, consent_tier)
- `mood_logs` (id, user_id, mood_emoji, note, created_at)
- `journal_entries` (id, user_id, content, mood_tag, ai_summary, created_at)
- `safety_events` (id, user_id_hashed, trigger_type, response_flow, timestamp) — anonymized/aggregated for admin view
- `sessions` / `devices` (auth/session management)

**Vector DB**
- Embedding per memory/journal entry, tagged with user_id, category, importance, for semantic retrieval during chat context assembly.

---

## 8. Design System Snapshot (for engineering handoff)

- **Theme base**: dark, soft — deep navy / charcoal / midnight blue / slate (never pure black)
- **Style**: glassmorphism, 20–28px rounded corners, soft shadows, generous whitespace
- **Typography**: Inter (primary), Plus Jakarta Sans (secondary), Manrope (large headings)
- **Emotion-adaptive palettes**: Happy (butter yellow/cream/peach), Calm (sky blue/lavender), Sad (muted lavender/slate/moonlight grey), Anxious (mint/sage/teal, breathing-synced animation), Angry (muted terracotta/burnt orange — never bright red), Burnout (deep indigo/pale blue), Hopeful (soft pink/lavender/warm gold)
- **Transitions**: 2–5s ease, never instant
- **Motion principle**: always slow, calm, therapeutic — no flashing, shaking, or fast transitions anywhere in the app, including safety screens

---

## 9. Team & Roles (Suggested)

| Role | Responsibility |
|---|---|
| Product Lead | Scope, prioritization, safety/ethics sign-off |
| Mental Health Advisor (consultant) | Reviews conversational techniques, safety flows, disclaimers |
| Frontend Engineers (2–3) | Next.js/Tailwind/Framer Motion build-out |
| Backend Engineers (2–3) | FastAPI services, memory pipeline, safety middleware |
| ML/AI Engineer | LLM orchestration, emotion detection models, embeddings |
| Designer (UI/UX + Motion) | Design system, emotion-adaptive theming, animation specs |
| DevOps/Infra Engineer | CI/CD, observability, scaling |
| QA/Safety Tester | Crisis-flow red-teaming, accessibility QA |
| Legal/Compliance Advisor | Privacy policy, GDPR-style compliance, disclaimers |

---

## 10. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| False negatives in crisis detection | Layered detection (keyword + ML classifier + context), regular red-team testing, conservative thresholds |
| Users mistaking app for therapy | Persistent, clear non-therapist disclaimers; onboarding consent screen |
| Memory misuse or over-collection | Explicit per-field consent, easy delete/export, default to minimal collection |
| LLM provider outage | Model-agnostic adapter layer with fallback provider and static safety response |
| Emotional data sensitivity/breach | Field-level encryption, strict RBAC, audit logs, regular security audits |
| Regulatory variance by region | Legal review before each regional launch; do not assume one policy fits all jurisdictions |

---

## 11. Success Metrics

- Daily/weekly active check-ins
- Journal and wellness activity streak retention
- Memory feature adoption vs. anonymous-mode usage
- Safety flow engagement (% who continue conversation, % who access resources)
- Crisis-detection precision/recall from red-team + anonymized event review
- User-reported sense of calm/support (in-app micro-survey)

---

*This roadmap is a planning document. Regional mental-health regulatory requirements, clinical-safety review, and legal disclaimers should be finalized with qualified professionals before any public launch.*
