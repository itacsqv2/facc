---
name: attorno-security-privacy
description: Audit or implement Attorno authorization, multi-tenant isolation, GDPR-aware data minimization, tracking/consent constraints and secure import/upload behavior. Use for auth, API, admin, analytics, personal data and deployment-readiness work.
---

Read `CLAUDE.md`, `docs/DOMAIN_MODEL.md` and relevant section 15 of the source plan.

- Consumer can browse anonymously; adults are users; do not create child accounts or location histories. Prefer manually selected area; precise device location only on affirmative request.
- Never assume first-party analytics is automatically exempt from cookie/GDPR rules. Prevent optional tracking pending a documented lawful basis/consent review. Separate marketing notifications and transactional mail.
- Organizer membership is per organization, not one password shared by a volunteer group. Enforce auth on every mutation and record/query, with negative tests for cross-org IDs and privilege escalation.
- Service role/admin credentials must stay server-side. No secrets in git, browser assets, logs or prompts. Minimize PII exposure and log retention.
- Validate input lengths, times, HTML, URLs, file types/sizes/content, source/venue IDs and redirect destinations on server; prevent XSS/CSRF/SSRF and abuse as relevant to chosen stack.
- Moderate untrusted organizer-submitted events and reports. A verified organizer label means identity check, not certified safe events.
- Require privacy notices, processing inventory, retention/deletion rights, vendor/region assessment and applicable DSA/accessibility review before public production launch. Treat legal interpretation as an open review item, not an engineer's declaration of compliance.
- For review output produce a concise threat model: attack surface, threat, mitigation, negative test, residual risk and owner.
