# Solace+ Clinical Review Record

> **STATUS: PENDING CLINICAL REVIEW**
> **VERSION: 0.1.0**
> **Date Created:** [DATE]
> **Prepared by:** Engineering Team

---

> **⚠️ IMPORTANT**
>
> This document tracks the clinical review status of Solace+ safety-critical content.
>
> The production deployment of any safety feature is **blocked** until the clinical advisor has completed review and provided written sign-off.
>
> Do not remove this requirement or mark review as complete without actual clinical advisor confirmation.

---

## Review Record

| Field | Value |
|---|---|
| **Clinical Advisor** | [NAME — TO BE RECRUITED] |
| **Credentials** | [LICENSE TYPE, JURISDICTION — TO BE CONFIRMED] |
| **Status** | PENDING CLINICAL REVIEW |
| **Review Date** | NOT YET SCHEDULED |
| **Version Reviewed** | — |
| **Comments** | — |
| **Required Changes** | — |
| **Approval** | NOT GRANTED |
| **Signature** | — |

---

## Documents Requiring Clinical Review

The following documents and system components require clinical review before production deployment:

| Document / Component | Status |
|---|---|
| `docs/crisis-protocol.md` | PENDING REVIEW |
| Crisis response templates (in-app text) | PENDING REVIEW |
| Safety keyword/phrase list | PENDING REVIEW |
| Safety Screen UI language | PENDING REVIEW |
| Crisis resource registry | PENDING REVIEW |
| AI system prompt safety guidelines | PENDING REVIEW |
| Mental health disclaimer text | PENDING REVIEW |

---

## Clinical Advisor Recruitment Status

- [ ] Clinical advisor identified
- [ ] Advisor credentials verified
- [ ] Advisory agreement signed
- [ ] First review session scheduled
- [ ] Initial review completed
- [ ] Revisions applied
- [ ] Follow-up review completed
- [ ] Written sign-off received
- [ ] Sign-off archived in project documentation

---

## Production Deployment Gate

**The following are hard gates before any real user can interact with Solace+ safety features:**

1. ❌ **Clinical advisor sign-off on crisis protocol** — NOT YET RECEIVED
2. ❌ **Clinical advisor sign-off on all in-app safety language** — NOT YET RECEIVED
3. ❌ **Legal review of privacy policy and terms** — NOT YET RECEIVED
4. ❌ **Security audit completion** — NOT YET SCHEDULED
5. ❌ **Red-team safety test suite pass** — NOT YET BUILT

---

## Notes for Future Clinical Advisor

When a clinical advisor is engaged, they should review:

1. **The crisis detection thresholds** — Are the Level 0/1/2/3 definitions clinically appropriate?
2. **The keyword list** — Is it comprehensive enough? Does it avoid unnecessary false positives?
3. **Response language** — Is the language trauma-informed, non-stigmatizing, and appropriate?
4. **Safety Screen options** — Are the presented options appropriate for different risk levels?
5. **The escalation tree** — Is the routing logic clinically appropriate?
6. **System limitations** — Are the documented limitations complete and accurate?
7. **The "never do" list** — Is it complete?
8. **Crisis resource accuracy** — Are all listed crisis resources current and appropriate?

---

*This document must be updated and signed by a licensed clinical advisor before any safety feature is deployed to real users.*
