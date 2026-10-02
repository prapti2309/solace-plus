# Solace+ Crisis Protocol

> **STATUS: DRAFT — REQUIRES LICENSED CLINICAL ADVISOR REVIEW AND SIGN-OFF**
> **VERSION: 0.1.0**
> **Last Updated:** [DATE]
> **Prepared by:** Engineering Team
> **Clinical Reviewer:** PENDING — [LICENSED CLINICAL ADVISOR NAME AND CREDENTIALS]
> **Approval Status:** PENDING CLINICAL REVIEW
> **Legal Review:** PENDING — [COMPANY LEGAL COUNSEL]

---

> **⚠️ CRITICAL NOTICE**
>
> This document is an **engineering draft** created to define the architecture of Solace+'s safety response system.
>
> It has **not** been reviewed or approved by a licensed clinical professional, mental health advisor, psychologist, psychiatrist, or any qualified clinical authority.
>
> **This document must NOT be used to guide user-facing behavior until it has received explicit written sign-off from a licensed clinical advisor.**
>
> All response templates marked `[DRAFT — CLINICAL REVIEW REQUIRED]` must be reviewed, revised, and approved by a licensed mental health professional before being deployed to any real user-facing environment.

---

## 1. Purpose

This document defines the safety response architecture for the Solace+ AI wellness platform.

Its purpose is to:

1. Define how the system should detect and respond to potential safety concerns expressed during user conversations
2. Specify escalation behavior based on concern level
3. Provide draft response templates for clinical review
4. Document the limitations of AI-based safety detection
5. Establish the dependency on human clinical judgment for final production deployment

---

## 2. Scope

This protocol applies to all AI-powered conversation features within Solace+, including:

- The main AI chat interface
- Journal entry analysis (if AI summaries surface safety concerns)

This protocol does **not** claim to:

- Replace emergency services or licensed clinical assessment
- Diagnose or determine the clinical state of any user
- Guarantee detection of every safety concern (false negatives are a known limitation)
- Guarantee that every detected concern represents a genuine safety risk (false positives are a known limitation)

---

## 3. Risk Level Framework

> **[CLINICAL REVIEW REQUIRED]** — The following risk levels are engineering placeholders. Category definitions, language, and thresholds must be reviewed and approved by a licensed clinical advisor before production use.

| Level | Label | Description |
|---|---|---|
| **Level 0** | General emotional distress | User expresses sadness, anxiety, frustration, or burnout — within the expected range of wellness app use |
| **Level 1** | Elevated concern | User expresses statements suggesting significant distress, hopelessness, or difficulty coping — but no clear indication of self-harm intent |
| **Level 2** | Potential immediate safety concern | User expresses statements that may indicate thoughts of self-harm or harm to others — ambiguous or indirect language |
| **Level 3** | Emergency / Imminent danger | User expresses direct statements of intent to harm themselves or others imminently |

---

## 4. Detection Architecture

### 4.1 Layer 1 — Keyword / Rule-Based Screening (Fast Path)

A synchronous, low-latency rule-based check runs on every user message before the main AI call.

**Current implementation:** Keyword matching against a curated list.

> **[CLINICAL REVIEW REQUIRED]** — The keyword list must be reviewed, expanded, and approved by a clinical advisor. The current engineering list is a placeholder.

Current engineering keyword list (subject to clinical revision):

**Imminent risk indicators (Level 3):**
- "suicide", "kill myself", "end my life", "hurt myself", "cut myself", "want to die", "better off dead"

**Elevated concern indicators (Level 1–2):**
- "depressed", "hate my life", "no way out", "self-harm"

### 4.2 Layer 2 — Semantic Classification (AI-Assisted)

> **[FUTURE IMPLEMENTATION]** — A semantic classifier using the AI model to assess risk level from full conversational context, not just individual keywords.

**[CLINICAL REVIEW REQUIRED]** — The classifier's prompts, thresholds, and output definitions require clinical review before production deployment.

### 4.3 Layer 3 — Response Routing

Based on detected risk level:

| Detected Level | Action |
|---|---|
| Level 0 | Normal conversation continues |
| Level 1 | AI response includes a gentle acknowledgment and optional reference to support resources |
| Level 2 | Conversation is interrupted; Safety Screen is surfaced with support options |
| Level 3 | Conversation is interrupted immediately; Safety Screen is surfaced with emergency resources; session is kept open (not auto-terminated) |

---

## 5. Response Templates

> **⚠️ ALL TEMPLATES BELOW ARE DRAFTS — CLINICAL REVIEW REQUIRED**
>
> These templates have been prepared by the engineering team as structural placeholders. Every response that a user may see in a safety context must be reviewed, revised, and approved by a licensed clinical mental health professional before deployment.
>
> Do not assume these templates are clinically appropriate as written.

---

### 5.1 Level 1 — Elevated Concern (In-conversation gentle acknowledgment)

> **[DRAFT — CLINICAL REVIEW REQUIRED]**
>
> *"I can hear that things feel really heavy right now. You don't have to carry this alone. Would you like to talk more about what you're experiencing, or would it help to take a moment with a breathing exercise? I'm here with you either way."*

---

### 5.2 Level 2 — Potential Safety Concern (Safety Screen surfaced)

**Safety Screen heading:**

> **[DRAFT — CLINICAL REVIEW REQUIRED]**
>
> *"I'm glad you're here, and I want to make sure you're okay."*

**Safety Screen supporting text:**

> **[DRAFT — CLINICAL REVIEW REQUIRED]**
>
> *"What you've shared sounds really painful. Please know you don't have to face this alone. Below are some options that might help right now."*

**Safety Screen options presented:**

- Continue chatting with Solace+
- Try a grounding or breathing exercise
- Contact a trusted person in your life
- View crisis support resources for your region
- In an emergency: contact emergency services immediately

---

### 5.3 Level 3 — Imminent Danger (Emergency escalation)

**Safety Screen heading:**

> **[DRAFT — CLINICAL REVIEW REQUIRED]**
>
> *"Your safety matters. Please reach out for immediate support."*

**Safety Screen supporting text:**

> **[DRAFT — CLINICAL REVIEW REQUIRED]**
>
> *"What you've shared suggests you may be in immediate danger. I'm not able to provide the kind of help you need right now — but a trained crisis counselor can. Please reach out using one of the resources below. If you are in immediate physical danger, please call emergency services now."*

**Resources always surfaced at Level 3:**

- Local emergency services (call your country's emergency number)
- International crisis text lines
- Regional crisis hotlines (based on detected locale)
- Option to view local in-person crisis center locations

**Session behavior at Level 3:**

- The session remains **open** — Solace+ does not auto-terminate
- No new AI conversation responses are generated until user navigates away from Safety Screen or explicitly returns to chat
- The return to chat option remains visible

---

## 6. Escalation Decision Tree

> **[CLINICAL REVIEW REQUIRED]** — This decision tree must be reviewed by a licensed clinical advisor before production implementation.

```
User sends a message
          |
          v
  Layer 1: Keyword/Rule Check
          |
    ┌─────┴──────┐
    |             |
  No hit      Hit detected
    |             |
    v             v
  Layer 2:    Assess severity
  Normal AI   (Level 1 / 2 / 3)
  processing        |
          ┌────┬────┴────┐
          |    |         |
       Level 1  Level 2  Level 3
          |    |         |
          v    v         v
      Gentle  Safety  Emergency
      in-conv  Screen  Safety
      note    surfaced Screen
                |       surfaced
                v         |
          Options:       v
          - Keep         Immediate
            chatting     crisis
          - Resources    resources
          - Breathing    + emergency
          - Contact      services
            trusted      prominently
            person       displayed
```

---

## 7. What the System Must Never Do

Regardless of detected risk level, the system must **never**:

- Auto-terminate or close the user's session
- Tell a user their situation is hopeless or that help is unavailable
- Provide specific methods, instructions, or information related to self-harm
- Claim to have performed a clinical assessment of the user's state
- Tell a user they are or are not in danger (the AI cannot determine this)
- Prevent a user from accessing emergency resources
- Dismiss or minimize expressions of distress

---

## 8. Limitations

The following limitations are **inherent to the current system architecture** and must be clearly understood:

### 8.1 False Negatives (Missed detections)

The keyword-based and AI-assisted detection systems may **fail to detect** genuine safety concerns expressed through:

- Indirect or figurative language
- Language in languages not covered by the keyword list
- Coded language or metaphor
- Gradual escalation over many conversation turns
- Silence or avoidance

**The system cannot guarantee detection of every safety concern.**

### 8.2 False Positives (Incorrect detections)

The system may surface safety resources in response to:

- Literary or academic discussions of mental health
- References to safety concerns in fiction or media
- Casual expressions not reflecting genuine distress (e.g., "I could kill for a coffee")

**False positives should be handled gracefully, without being alarming or stigmatizing.**

### 8.3 No Clinical Authority

The Solace+ AI system:

- Is not a licensed clinical practitioner
- Cannot perform a clinical mental state examination
- Cannot determine clinical risk with clinical-grade reliability
- Must never represent itself as a substitute for clinical judgment

### 8.4 Emergency Limitations

Solace+ **cannot**:

- Contact emergency services on behalf of the user
- Verify the user's location for emergency dispatch
- Guarantee that crisis resources displayed are currently available

---

## 9. Review and Update Requirement

This protocol must be reviewed:

- Before any public or beta release of safety features
- After any significant change to the AI model used for detection
- After any safety incident involving the platform
- Periodically as clinical standards evolve

**[CLINICAL REVIEW REQUIRED]** — Define a specific review cycle (e.g., annually, after each major release).

---

## 10. Required Sign-offs Before Production Deployment

The following sign-offs are required before this protocol governs any user-facing behavior:

| Role | Name | Status |
|---|---|---|
| Licensed Clinical Advisor | [NAME] | PENDING |
| Legal Counsel | [NAME] | PENDING |
| Engineering Lead | [NAME] | PENDING |
| Product Lead | [NAME] | PENDING |

---

*This document is a draft prepared by the Solace+ engineering team. It has not been reviewed or approved by any licensed clinical professional or legal counsel. It must not govern any user-facing safety behavior until all required reviews and sign-offs have been completed.*
