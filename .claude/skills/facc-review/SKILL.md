---
name: facc-review
description: Independently verify a completed FACC feature against business-plan acceptance, real tests, accessibility, data quality, privacy, authorization and regression risk; report blockers without rewriting features.
disable-model-invocation: true
argument-hint: "<slice ID or feature>"
context: fork
---

Review: `$ARGUMENTS`.

- Read `CLAUDE.md`, relevant `docs/` specs and changed files. Assess actual git diff; flag unrelated edits and uncommitted changes.
- Independently trace both happy path and critical negative paths. Try commands/tests where the local environment allows; quote exact executed commands and outcomes.
- For consumer: no login required, demo labeling, practical result fields, accurate cancellation and date/price/age states, accessible mobile workflow and map fallback.
- For organizer/admin: tenant boundaries, source rights, actor/audit history, safe imports, duplicate behavior and malicious links.
- For metrics: privacy basis/consent, no fabricated real users/purchases/attendance, exact cohorts and definitions.
- Security checks: secrets leakage, API exposure, broken object-level access, server validation, vulnerable file handling, improper caching of private content.
- Rank findings `BLOCKER`, `MAJOR`, `MINOR`; every finding names file/path, reproduction/evidence, user impact and proposed correction. Do not claim a test passed unless actually run.
- End with a clear GO/NO-GO for this slice, distinguishing code readiness from commercial validation. **Do not deploy or commit.**
