# PROMPT 02 - POSTGRES/POSTGIS DOMAIN + CATALOG QUERY

Implement the smallest real persistence vertical slice behind the existing public demo. Before editing read `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/DOMAIN_MODEL.md`, `docs/DECISIONS.md`, and inspect the Phase 01 code and git status. Reuse the ratified provider; if no provider/account exists, prefer a documented local Postgres/PostGIS test setup or add migrations without pretending to have connected cloud infrastructure.

Bounded scope:
- Schema and reversible version-controlled migration for Organization, Venue, Event, Occurrence and minimal Source + License provenance. Add fields necessary to distinguish synthetic demo from licensed published content, stable IDs, UTC instants, IANA timezone, states and price UNKNOWN.
- Implement read-only server catalog query with date window, manual locality/radius support via indexed PostGIS distance search and state/privacy/source eligibility conditions. Use validated query parameters, bounded limits and a stable sort.
- Add clearly synthetic seed records for the DEMO environment; never seed fake events into a public live dataset unmarked.
- Define role/tenant policies for writes as migrations are introduced, even if organizer UI is in Phase 04. No privileged DB key in the browser.
- Connect the existing public list/detail through one small repository/service abstraction with a graceful local-demo fallback if infrastructure has not been configured.

Required tests:
- Two dates of one event are distinct occurrences; cancelling one does not erase the other.
- Unknown price/age/accessibility states retain UNKNOWN semantics.
- Invalid/future vs past dates, midnight boundary and Europe/Rome DST edge case.
- Distance filter measured in meters; invalid latitude/radius rejected.
- Published eligible occurrences appear; draft, ended, cancelled and unlicensed external records do not.
- Reproducible migrations and seeded test data with no secrets.

Do not add a separate search engine, scrape sources, implement payment/AI or build organizer/admin UI. Run real tests/typecheck/build; list executed commands and limitations. Stop after this slice.
