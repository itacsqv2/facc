# FACC - working backlog

Statuses: NOT STARTED / IN PROGRESS / DONE / BLOCKED. A ticket is DONE only with proof of tests and user-visible behavior.

| ID | Priority | Slice | Acceptance summary | Status |
|---|---|---|---|---|
| FACC-001 | P0 | Repo audit and architecture ADR | Inventory, decisions, feasible stack, no modifications in 00 | DONE (Phase 00, 2026-10-23) |
| FACC-002 | P0 | Public homepage and demo | Usable 320px+; today/weekend; DEMO labeled; tests/build | DONE (2026-10-23): 01A + 01B + 01C quality gate; 51 unit + 38 e2e pass on Node 25.8.1; see docs/PHASE_01C_REVIEW.md |
| FACC-003 | P0 | Catalog data model | Event / Occurrence / Venue and explicit status, migrations/tests | NOT STARTED |
| FACC-004 | P0 | Spatial + date search | Distance in meters; timezone correctness; cancellation excluded | NOT STARTED |
| FACC-005 | P0 | Event details | Price / accessibility unknown states, contact, source, verified_at | IN PROGRESS: semantics fixed and tested on DEMO data (01C: price basis, all ages, booking states, real 404s); real source/verified_at pending Phase 02 |
| FACC-006 | P0 | Consumer save/share | No account, working deep link, accessible controls | IN PROGRESS: bookmarks + copy-link fallback verified by e2e (incl. cancelled and unavailable bookmarks); native Web Share not exercised; cross-device sync out of scope |
| FACC-007 | P0 | Organizer auth & tenancy | Member roles; denied cross-org object access | NOT STARTED |
| FACC-008 | P0 | Organizer event workflow | Create/edit/duplicate/cancel one occurrence; audit | NOT STARTED |
| FACC-009 | P0 | Admin review/report | Authorized moderation and resolutions, evidence log | NOT STARTED |
| FACC-010 | P0 | Licensed CSV import | Staging, preview, rights, dedup, idempotency, corrections | NOT STARTED |
| FACC-011 | P0 | Privacy-ready measurement | Review basis/consent; qualified query success; no fake orders | NOT STARTED |
| FACC-012 | P0 | PWA + accessibility | Core journeys work on mobile; stale catalog not presented as live | NOT STARTED |
| FACC-013 | P1 | Organizer follow / email digest | Explicit opt-in, unsubscribe, safe delivery | NOT STARTED |
| FACC-014 | P1 | Calendar ICS | Correct timezone, cancelled instance handling | NOT STARTED |
| FACC-015 | P1 | Organizer widget | Embeddable and source attribution, rate limit | NOT STARTED |
| FACC-016 | DEFER | Ticket checkout / LLM assistant / native / reviews | Investment gate, dedicated spec and legal assessment required | NOT STARTED |

## Phase 02 debts carried from 01C
| ID | Priority | Debt | Done when |
|---|---|---|---|
| DEBT-01 | P0 | Postgres repository keeps `getPublicOccurrenceIds` as the single public-URL eligibility check (no Proxy duplication) | HTTP matrix e2e passes against the DB repository |
| DEBT-02 | P0 | Persist `price.basis`, age states and booking states without collapsing UNKNOWN / not_verified into defaults | Migration + repository tests mirror `tests/unit/catalog.test.ts` |
| DEBT-03 | P0 | Run the CI workflow on GitHub with Node 24 (only local Node 25.8.1 verified) | First green run of `.github/workflows/ci.yml` |
| DEBT-04 | P1 | Filters and the "Altri filtri" toggle require JavaScript (no GET-form fallback) | Filters usable with JS disabled, or limitation accepted |
| DEBT-05 | P1 | Review braces / GHSA-vfj7-8cjw-p6xm exception | By 2026-11-15 (docs/SECURITY_AUDIT.md) |
