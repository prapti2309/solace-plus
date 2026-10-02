# Solace+ Compliance Notes

> **STATUS: ENGINEERING DRAFT — INCOMPLETE**
> **Version:** 0.1.0
> **Last Updated:** [DATE]
> **Prepared by:** Engineering Team
> **Legal Review:** PENDING
> **Clinical Review:** PENDING

---

> **⚠️ IMPORTANT NOTICE**
>
> This document tracks the compliance posture of the Solace+ platform. It documents **only what has actually been implemented** and marks everything else as pending.
>
> **Solace+ does not claim HIPAA, GDPR, DPDP, or any other regulatory compliance** simply because it implements privacy-oriented engineering controls. Formal compliance assessments require legal review, external audits, and operational processes that have not yet been completed.

---

## 1. Legal Review Status

| Document | Status |
|---|---|
| Privacy Policy | DRAFT — PENDING LEGAL REVIEW |
| Terms of Service | DRAFT — PENDING LEGAL REVIEW |
| Crisis Protocol | DRAFT — PENDING CLINICAL + LEGAL REVIEW |
| Cookie/Consent Notices | NOT YET CREATED |
| Data Processing Agreements | NOT YET CREATED |
| GDPR Article 30 Record of Processing | NOT YET CREATED |
| DPDP Consent Notice (if applicable) | NOT YET CREATED |
| COPPA Compliance (if applicable) | NOT YET ASSESSED |

---

## 2. Clinical Review Status

| Item | Status |
|---|---|
| Crisis Protocol | PENDING CLINICAL REVIEW |
| Safety Response Templates | PENDING CLINICAL REVIEW |
| Safety Keyword List | PENDING CLINICAL REVIEW |
| Safety Screen Language | PENDING CLINICAL REVIEW |
| Mental Health Disclaimer | PENDING CLINICAL REVIEW |
| Crisis Resource Registry | PENDING CLINICAL REVIEW |

**Clinical advisor has NOT yet been recruited.** Production safety features are gated on clinical sign-off.

---

## 3. Implemented Security Controls

The following security controls are implemented in the current codebase:

### 3.1 Authentication and Authorization
- ✅ Password hashing with bcrypt (plaintext passwords never stored)
- ✅ JWT-based authentication with short expiry (15-minute access tokens)
- ✅ Refresh token rotation (7-day expiry)
- ✅ Anonymous session support (no email required)
- ✅ Role-based access control (user / support_admin / system_admin)

### 3.2 Data Encryption
- ✅ Field-level AES-256-GCM encryption for sensitive fields:
  - Conversation messages
  - Journal entries
  - Memory descriptions
  - Emergency contact information
- ✅ Data in transit: TLS (enforced by hosting infrastructure — **[CONFIRM WITH HOSTING PROVIDER]**)
- ❌ Database-level encryption at rest: **NOT YET CONFIRMED**

### 3.3 Privacy Controls
- ✅ Consent flags per profile field (granular consent)
- ✅ Consent audit log (every grant/revoke recorded)
- ✅ Account deletion cascades all user data
- ✅ Memory can be individually deleted, paused, or fully disabled
- ❌ Full data export (partial — memories only; conversations/journals pending)
- ❌ Automated data retention enforcement: **NOT YET IMPLEMENTED**
- ❌ Right-to-restriction workflow: **NOT YET IMPLEMENTED**

### 3.4 Safety
- ✅ Keyword-based crisis screening on every chat message
- ✅ Safety event logging (severity + action only; no raw message content)
- ✅ Crisis resource registry (US, UK, India, Australia, Canada, Global)
- ❌ Semantic AI classifier for safety detection: **NOT YET IMPLEMENTED**
- ❌ Clinical review of safety features: **NOT YET COMPLETED**
- ❌ Red-team safety test suite: **NOT YET BUILT**

---

## 4. Pending Compliance Work

### 4.1 Legal

- [ ] Engage legal counsel for privacy policy, terms, and compliance review
- [ ] Determine applicable jurisdictions (user base geography)
- [ ] Assess GDPR applicability and requirements
- [ ] Assess India DPDP Act applicability
- [ ] Assess COPPA applicability (minimum age)
- [ ] Define data retention periods per legal requirements
- [ ] Implement cookie consent (if legally required)
- [ ] Draft data processing agreements with AI provider and cloud infrastructure
- [ ] Establish a Data Subject Request (DSR) handling process
- [ ] Define international data transfer mechanisms (e.g., SCCs for GDPR)

### 4.2 Clinical

- [ ] Recruit a licensed clinical advisor
- [ ] Complete crisis protocol review
- [ ] Complete safety language review
- [ ] Complete red-team testing of safety features
- [ ] Establish ongoing clinical review cadence

### 4.3 Security

- [ ] Third-party security penetration test (pre-launch requirement)
- [ ] Dependency vulnerability scanning setup (Snyk / Dependabot)
- [ ] Rate limiting implementation (Redis-based)
- [ ] Production secrets management setup (AWS Secrets Manager / Doppler / Vault)
- [ ] Database-level encryption at rest (PostgreSQL — production)
- [ ] Logging with PII redaction (structured logging — Sentry / similar)
- [ ] Incident response plan

### 4.4 Infrastructure

- [ ] Production PostgreSQL database (currently using SQLite for development)
- [ ] Separate dev / staging / production database environments
- [ ] Vector database setup (Qdrant / Chroma) for memory retrieval
- [ ] Background worker (Celery) for async jobs
- [ ] Production secrets manager integration

---

## 5. Data Architecture Assumptions

The following architectural decisions have security and compliance implications:

| Decision | Current State | Production Requirement |
|---|---|---|
| Database | SQLite (dev) | PostgreSQL (prod) |
| Encryption | Field-level AES-256-GCM | Review whether DB-level encryption also required |
| AI Provider | Anthropic Claude | Data processing agreement with Anthropic required |
| Hosting | Not yet decided | Provider selection required; DPA with provider required |
| Secrets | Hardcoded defaults in config | Secrets manager required for production |
| Logs | Console/stdout | Structured logging with PII redaction required |
| Backups | Not implemented | Backup strategy + retention policy required |

---

## 6. Unresolved Jurisdictional Questions

The following questions must be resolved before launch:

1. **What is the minimum age for users?** (affects COPPA / GDPR child consent requirements)
2. **Which countries will Solace+ serve?** (determines applicable data protection laws)
3. **Where will data be hosted?** (determines international transfer requirements)
4. **Is a Data Protection Officer (DPO) required?** (GDPR Art. 37)
5. **Does the crisis detection constitute medical device functionality under any jurisdiction?** (EU MDR, FDA SaMD rules)
6. **What consent mechanisms are legally required for cookie use?** (varies by jurisdiction)

---

## 7. Third-Party Service Review Required

| Service | Purpose | DPA Status |
|---|---|---|
| Anthropic (Claude API) | AI responses | NOT YET REVIEWED |
| [Cloud Provider TBD] | Hosting | NOT YET SELECTED |
| [Monitoring TBD] | Error tracking | NOT YET SELECTED |
| [Secrets Manager TBD] | Credential management | NOT YET SELECTED |

---

## 8. Production Readiness Gates

The following must be completed before Solace+ processes real user data in production:

- [ ] Legal review of privacy policy and terms completed
- [ ] Clinical advisor sign-off on crisis protocol completed
- [ ] Third-party security audit completed
- [ ] Production secrets management implemented
- [ ] Data retention enforcement implemented
- [ ] Full data export for users implemented
- [ ] Rate limiting implemented
- [ ] Structured logging with PII redaction implemented
- [ ] Red-team safety test suite built and passed (clinical sign-off)

---

*This document reflects the compliance posture as of the time of writing. It must be updated as each item is addressed. It does not represent a claim of regulatory compliance.*
