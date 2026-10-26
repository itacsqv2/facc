# Kesifa - working backlog

Statuses: NOT STARTED / IN PROGRESS / DONE / BLOCKED. A ticket is DONE only with proof of tests and user-visible behavior.

| ID | Priority | Slice | Acceptance summary | Status |
|---|---|---|---|---|
| KESIFA-001 | P0 | Repo audit and architecture ADR | Inventory, decisions, feasible stack, no modifications in 00 | DONE (Phase 00, 2026-10-23) |
| KESIFA-002 | P0 | Public homepage and demo | Usable 320px+; today/weekend; DEMO labeled; tests/build | DONE (2026-10-23): 01A + 01B + 01C quality gate; 51 unit + 38 e2e pass on Node 25.8.1; see docs/PHASE_01C_REVIEW.md |
| KESIFA-003 | P0 | Catalog data model | Event / Occurrence / Venue and explicit status, migrations/tests | NOT STARTED |
| KESIFA-004 | P0 | Spatial + date search | Distance in meters; timezone correctness; cancellation excluded | NOT STARTED |
| KESIFA-005 | P0 | Event details | Price / accessibility unknown states, contact, source, verified_at | IN PROGRESS: semantics fixed and tested on DEMO data (01C: price basis, all ages, booking states, real 404s); real source/verified_at pending Phase 02 |
| KESIFA-006 | P0 | Consumer save/share | No account, working deep link, accessible controls | IN PROGRESS: bookmarks + copy-link fallback verified by e2e (incl. cancelled and unavailable bookmarks); native Web Share not exercised; cross-device sync out of scope |
| KESIFA-007 | P0 | Organizer auth & tenancy | Member roles; denied cross-org object access | NOT STARTED |
| KESIFA-008 | P0 | Organizer event workflow | Create/edit/duplicate/cancel one occurrence; audit | NOT STARTED |
| KESIFA-009 | P0 | Admin review/report | Authorized moderation and resolutions, evidence log | NOT STARTED |
| KESIFA-010 | P0 | Licensed CSV import | Staging, preview, rights, dedup, idempotency, corrections | NOT STARTED |
| KESIFA-011 | P0 | Privacy-ready measurement | Review basis/consent; qualified query success; no fake orders | NOT STARTED |
| KESIFA-012 | P0 | PWA + accessibility | Core journeys work on mobile; stale catalog not presented as live | NOT STARTED |
| KESIFA-013 | P1 | Organizer follow / email digest | Explicit opt-in, unsubscribe, safe delivery | NOT STARTED |
| KESIFA-014 | P1 | Calendar ICS | Correct timezone, cancelled instance handling | NOT STARTED |
| KESIFA-015 | P1 | Organizer widget | Embeddable and source attribution, rate limit | NOT STARTED |
| KESIFA-016 | DEFER | Ticket checkout / LLM assistant / native / reviews | Investment gate, dedicated spec and legal assessment required | NOT STARTED |
| KESIFA-017 | P1 | Interactive event map (01D) | List/Map share one result set; clusters; preview; search this area; geolocation on click; WebGL/provider fallbacks | DONE on DEMO data (2026-10-23): 63 unit + 56 e2e pass with mocked MapTiler style. Real MapTiler key verified on localhost 2026-10-26 (style, tiles, sprite HTTP 200; attribution shown once with links, uncovered at 320/390/1280) |
| KESIFA-018 | P1 | DEMO events around Lago d'Orta | 10 invented events, zone + map framing, all DEMO-labelled, no real organizers | DONE (2026-10-26): 69 unit + 58 e2e pass; checked on real MapTiler tiles at 390/1280 |

## Phase 02 debts carried from 01C
| ID | Priority | Debt | Done when |
|---|---|---|---|
| DEBT-01 | P0 | Postgres repository keeps `getPublicOccurrenceIds` as the single public-URL eligibility check (no Proxy duplication) | HTTP matrix e2e passes against the DB repository |
| DEBT-02 | P0 | Persist `price.basis`, age states and booking states without collapsing UNKNOWN / not_verified into defaults | Migration + repository tests mirror `tests/unit/catalog.test.ts` |
| DEBT-03 | P0 | Run the CI workflow on GitHub with Node 24 (only local Node 25.8.1 verified) | First green run of `.github/workflows/ci.yml` |
| DEBT-04 | P1 | Filters and the "Altri filtri" toggle require JavaScript (no GET-form fallback) | Filters usable with JS disabled, or limitation accepted |
| DEBT-05 | P1 | Review braces / GHSA-vfj7-8cjw-p6xm exception | By 2026-11-15 (docs/SECURITY_AUDIT.md) |
| DEBT-06 | P1 | Real MapTiler key: rendering verified on localhost (2026-10-26). Still open: confirm the key is restricted to allowed origins (localhost worked, so either localhost is allowed or the key is unrestricted), quotas and cost | Owner checks MapTiler dashboard; staging domain test |
| DEBT-07 | P1 | Phase 02: move venue coordinates to PostGIS `geography(Point,4326)` and the area filter to `ST_Intersects`/`ST_MakeEnvelope`, keeping `[lng, lat]` | Repository returns the same entries; map e2e unchanged |
| DEBT-08 | P1 | Map basemap/attribution contrast and screen-reader experience on real tiles; marker order for keyboard users | Manual a11y review with real tiles |
