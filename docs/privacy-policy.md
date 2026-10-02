# Solace+ Privacy Policy

> **STATUS: DRAFT — REQUIRES LEGAL REVIEW BEFORE PUBLICATION**
> **Version:** 0.1.0-draft
> **Last Updated:** [DATE]
> **Prepared by:** Engineering Team
> **Legal Review:** PENDING — [COMPANY LEGAL COUNSEL]
> **Clinical Review:** PENDING — [LICENSED CLINICAL ADVISOR]

---

> **⚠️ IMPORTANT NOTICE TO REVIEWERS**
>
> This document is an **engineering draft** prepared to identify all data-handling categories relevant to the Solace+ platform. It has **not** been reviewed or approved by legal counsel, a licensed mental health professional, or any regulatory body.
>
> All sections marked `[LEGAL REVIEW REQUIRED]` must be reviewed and completed by qualified legal counsel before publication. Do not publish this document as a user-facing policy without such review.

---

## 1. Introduction

Welcome to Solace+ ("Solace+", "we", "our", or "us"). Solace+ is an AI-powered mental wellness platform designed to provide emotional support, self-reflection tools, and wellness resources.

**[LEGAL REVIEW REQUIRED]** — Confirm the correct legal entity name, jurisdiction, and registered address.

**Company Legal Name:** [COMPANY LEGAL NAME]
**Registered Address:** [COMPANY ADDRESS]
**Contact Email:** [CONTACT EMAIL]

This Privacy Policy explains how we collect, use, store, and protect information about you when you use our services, including our web application and any related mobile applications (collectively, the "Service").

By using Solace+, you agree to the practices described in this Privacy Policy. If you do not agree, please do not use the Service.

---

## 2. Scope

This Privacy Policy applies to:

- The Solace+ web application
- Any future Solace+ mobile applications
- All interactions between you and the Solace+ AI system
- All data stored by Solace+ on your behalf

This policy does **not** apply to third-party services linked from within Solace+. Please review the privacy policies of any third-party services separately.

---

## 3. Information We Collect

We collect information in the following categories:

### 3.1 Account Information

If you create an account, we may collect:

- Email address (optional — you may use Solace+ anonymously)
- Password (stored only as a cryptographic hash, never in plaintext)
- Authentication provider information (email/password, Google Sign-In, or anonymous)
- Account creation date and last login date

If you choose **anonymous mode**, no email or identifying information is required. An anonymous session identifier is created locally.

### 3.2 Profile Information (Consent-Gated)

With your explicit consent, you may optionally provide:

- Display name and nickname
- Age group
- Pronouns
- Timezone and language preference
- Personal goals and interests
- Occupation
- Daily routine description
- Communication style preference
- Emergency contact information (encrypted at rest — see Section 3.9)

Each profile field is gated behind individual consent controls. You can grant or revoke consent for any field at any time in your Settings. Every consent change is recorded in an audit log.

### 3.3 Conversation Data

Solace+ stores your conversations with the AI system, including:

- Messages you send
- AI-generated responses
- Emotion tags associated with messages (detected automatically from message content)
- Conversation titles, timestamps, and categories

Conversation content is **encrypted at rest** using AES-256-GCM encryption.

### 3.4 Mood and Wellness Information

If you use mood tracking features, we collect:

- Mood label (e.g., calm, anxious, happy)
- Intensity rating
- Optional notes you attach to mood entries
- Timestamps

This data is used to generate trend charts and wellness insights visible only to you.

### 3.5 Journal Entries

If you use journaling features, we collect:

- Journal entry text
- AI-generated summaries (generated asynchronously, stored separately)
- Journal type (daily, gratitude, voice)
- Timestamps

Journal content is **encrypted at rest**.

### 3.6 Memory Data

With your consent, Solace+ may store structured facts extracted from conversations ("Memories"), including:

- Personal goals
- Family and relationship context
- Emotional triggers
- Coping preferences
- Important dates
- Personal notes

Each memory category has an individual consent toggle. Memory retrieval can be paused or disabled at any time. All memory descriptions are **encrypted at rest**.

You can export all memories as a JSON file or delete them individually or in bulk at any time.

### 3.7 Voice and Audio Data

**[LEGAL REVIEW REQUIRED]** — Review applicable laws for voice/biometric data in target jurisdictions.

If voice features are enabled and you consent:

- Audio recordings are processed for transcription
- Audio is discarded immediately after transcription unless you have explicitly opted in to audio retention
- Transcribed text is stored as a journal entry or chat message (subject to the relevant data handling described above)

Voice analysis is an **opt-in** feature, disabled by default.

### 3.8 Safety Events

If our system detects potential safety concerns during a conversation, we log:

- Severity level (flagged, elevated, or imminent)
- Action taken (e.g., "crisis resources surfaced")
- Timestamp

We do **not** store the raw message content in safety event logs beyond what is clinically necessary. Safety event logs use anonymized identifiers only.

### 3.9 Device and Technical Information

We may collect:

- IP address (stored as a one-way hash — never in plaintext)
- Browser and device type
- Operating system
- Session identifiers
- Error logs (with PII redacted)

### 3.10 Cookies and Similar Technologies

**[LEGAL REVIEW REQUIRED]** — Confirm cookie consent requirements under applicable law (e.g., GDPR, DPDP).

We use session cookies and, where permitted, local storage for:

- Authentication tokens
- User preferences (mood, persona, reduced-motion setting)
- Anonymous session state

We do **not** use third-party advertising cookies or tracking pixels.

---

## 4. How We Use Your Information

We use collected information for the following purposes:

### 4.1 Providing the Service

- Authenticating your account and managing sessions
- Delivering AI-powered chat responses
- Storing your conversations, journal entries, and mood logs
- Displaying your wellness trends and progress

### 4.2 Personalization

- Adapting the AI's responses based on your preferred communication style and persona
- Surfacing relevant memories (with consent) to provide contextual support
- Adjusting the UI's emotion-adaptive theme based on detected emotional state

### 4.3 Safety

- Screening messages for potential safety concerns
- Surfacing crisis resources when safety concerns are detected
- Logging safety events for system monitoring (without storing raw content)

### 4.4 Service Improvement

**[LEGAL REVIEW REQUIRED]** — Define exact scope of any aggregate analytics and confirm legal basis.

We may use aggregated, anonymized data to:

- Monitor service reliability and AI response quality
- Identify patterns in safety trigger frequency (aggregate only)
- Improve the overall product

We do **not** use your individual conversation content to train AI models without your explicit informed consent.

### 4.5 Legal and Compliance

- Maintaining audit logs for consent changes
- Responding to lawful data requests where required

---

## 5. Data Retention

**[LEGAL REVIEW REQUIRED]** — Define specific retention periods for each data category and confirm compliance with applicable law.

| Data Category | Retention Period |
|---|---|
| Account credentials | Until account deletion |
| Profile information | Until account deletion or field-level deletion |
| Conversation history | Until account deletion or manual deletion |
| Mood entries | Until account deletion or manual deletion |
| Journal entries | Until account deletion or manual deletion |
| Memory nodes | Until account deletion, memory deletion, or memory disable |
| Safety event logs | [LEGAL REVIEW REQUIRED] |
| Session tokens | Until expiry (15 minutes for access tokens, 7 days for refresh tokens) |
| Consent audit logs | [LEGAL REVIEW REQUIRED] |
| Anonymous sessions | [LEGAL REVIEW REQUIRED] |

---

## 6. Data Deletion

You have the right to delete your data:

- **Individual deletion:** Delete specific conversations, journal entries, mood entries, or memory nodes within the app
- **Full account deletion:** Delete your entire account, which permanently removes all associated data from our database
- **Memory management:** Disable memory entirely, which stops retrieval immediately

Upon account deletion, data is removed from our primary database. **[LEGAL REVIEW REQUIRED]** — Define exact timelines for backup purge cycles and vector database cleanup.

---

## 7. Data Export

You may export your data at any time:

- Memory nodes: exportable as JSON
- **[FUTURE FEATURE]** Full data export (conversations, journal entries, mood logs) — planned for a future release

---

## 8. Data Security

We implement the following technical security measures:

- **Encryption at rest:** Sensitive fields (conversation content, journal entries, memory descriptions, emergency contact) are encrypted using AES-256-GCM
- **Encryption in transit:** All data transmitted between your browser and our servers uses TLS
- **Password security:** Passwords are hashed using bcrypt before storage; plaintext passwords are never stored
- **Token security:** JWT access tokens expire after 15 minutes; refresh tokens expire after 7 days
- **IP anonymization:** IP addresses are hashed before storage

**[LEGAL REVIEW REQUIRED]** — Confirm security measures meet applicable regulatory standards. A third-party security audit is planned prior to production launch.

---

## 9. Third-Party Services

**[LEGAL REVIEW REQUIRED]** — Review data processing agreements with all third-party services listed below.

Solace+ uses the following third-party services:

| Service | Purpose | Data Shared |
|---|---|---|
| Anthropic (Claude API) | AI chat responses | Message content sent for processing |
| [CLOUD PROVIDER] | Infrastructure hosting | All data stored on provider infrastructure |
| [MONITORING SERVICE] | Error tracking | Error logs with PII redacted |

We do **not** sell your personal information to third parties.

---

## 10. Data Sharing

We do not share your personal information with third parties except:

- As required by law (valid legal process)
- With your explicit written consent
- With service providers acting as data processors under written agreements
- In connection with a merger or acquisition (with notice to you)

**[LEGAL REVIEW REQUIRED]** — Define exact scope of any data processor agreements.

---

## 11. International Data Transfers

**[LEGAL REVIEW REQUIRED]** — Confirm applicable cross-border transfer mechanisms (e.g., Standard Contractual Clauses for GDPR, requirements under India's DPDP Act).

**Applicable Jurisdictions:** [APPLICABLE JURISDICTIONS]

If you access Solace+ from outside the country where our servers are located, your data may be transferred internationally. We implement appropriate safeguards for such transfers.

---

## 12. Your Rights

**[LEGAL REVIEW REQUIRED]** — Confirm specific rights applicable under each target jurisdiction.

Depending on your jurisdiction, you may have the right to:

- **Access:** Request a copy of your personal data
- **Correction:** Correct inaccurate personal data
- **Deletion:** Request deletion of your personal data
- **Portability:** Receive your data in a machine-readable format
- **Objection:** Object to specific processing of your personal data
- **Restriction:** Request restriction of processing
- **Withdraw consent:** Withdraw consent at any time for consent-based processing

To exercise your rights, contact us at: **[CONTACT EMAIL]**

---

## 13. Children's Privacy

**[LEGAL REVIEW REQUIRED]** — Confirm minimum age requirements under applicable law (e.g., COPPA in the US, GDPR requirements in the EU).

Solace+ is not directed at children under the age of **[MINIMUM AGE — LEGAL REVIEW REQUIRED]**. We do not knowingly collect personal information from children below this age. If we become aware that we have collected data from a minor without appropriate consent, we will promptly delete it.

---

## 14. Mental Health Disclaimer

> **IMPORTANT:** Solace+ is a **wellness support tool**, not a mental health treatment service.
>
> Solace+ is **not**:
> - A licensed medical or mental health service
> - A substitute for professional therapy or psychiatric treatment
> - Capable of providing clinical diagnoses
> - A crisis intervention service
>
> The AI conversations provided by Solace+ are for **general wellness support and self-reflection only**. If you are experiencing a mental health crisis or emergency, please contact a qualified mental health professional or emergency services immediately.

---

## 15. Crisis and Emergency Disclaimer

Solace+ includes crisis-detection features designed to surface relevant support resources. However:

- The system's detection of safety concerns is **imperfect** and may produce false positives or false negatives
- **Solace+ is not a substitute for emergency services**
- In a life-threatening emergency, call your local emergency number (e.g., 911 in the US, 999 in the UK, 112 in the EU, 112 in India) immediately

---

## 16. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of material changes by:

- Displaying a notice within the Solace+ application
- **[LEGAL REVIEW REQUIRED]** — Define exact notification method and opt-out rights on material change

Your continued use of the Service after changes are posted constitutes acceptance of the updated policy.

---

## 17. Contact Information

For privacy-related questions or requests:

**[COMPANY LEGAL NAME]**
**[COMPANY ADDRESS]**
**Email:** [CONTACT EMAIL]

**[LEGAL REVIEW REQUIRED]** — Confirm whether a Data Protection Officer (DPO) is required under applicable law.

**Data Protection Officer (if applicable):** [DPO NAME AND CONTACT — LEGAL REVIEW REQUIRED]

---

*This document is a draft prepared by the Solace+ engineering team for legal and clinical review. It does not constitute legal advice and has not been approved by legal counsel. All bracketed placeholders require resolution before this document may be published as a user-facing policy.*
