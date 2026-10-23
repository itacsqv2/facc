# PROMPT 07 - PWA + PRE-PILOT SAFETY GATE

Read `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/UX.md`, `docs/VALIDATION.md` and relevant security/privacy skill. Inspect the current app, tests and `git status` before editing. We are preparing an internal or limited pilot, NOT authorizing a public launch.

Implement the smallest hardening changes to provide:
- PWA manifest/icons only if legally owned/generated specifically for this app; service worker app-shell caching with safe cache strategy. Do NOT blindly cache live events such that cancelled or stale listings appear valid offline.
- Accessible keyboard and mobile/desktop QA for core consumer + organizer + admin paths.
- Structured metadata/SEO for public events only, prevent accidental indexing of private drafts/admin pages.
- Secrets/config/role audit, authorization tests, request/input limits, upload handling and secure redirects, dependency checks where locally available.
- Operational runbook for backup/restore testing, logs/retention, safe environment variables, uptime/error tracking and costs; document what needs external confirmation.
- Launch blockers review: rights/licensing, privacy/cookie/analytics legal basis, terms/DSA where applicable, organizer verification, support capacity, provider quota, accessibility applicability and any public-body qualification rules.

Acceptance:
- Core workflows tested end to end; exact commands/outputs cited.
- Cancelled event or stale offline content cannot be accidentally presented as guaranteed bookable.
- No secrets in browser/client Git history; private operations authorization enforced.
- Accessibility and responsive review documented with actual verification, not claims.
- Produce a checklist `READY FOR CONTROLLED PILOT` vs `BLOCKED`, list residual legal/operational risks and owners.

Do not deploy, commit, invite users, pay providers or declare legal compliance without explicit approval. Stop at the pilot gate.
