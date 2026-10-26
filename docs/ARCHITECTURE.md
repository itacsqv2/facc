# Architecture hypothesis (not yet ratified)

## Governing decision
A **modular monolith with server-rendered PWA** is the recommended starting point. Before creating project scaffolding, inspect the existing repo and record actual findings. If it already contains useful code, adapt rather than rewrite.

## Recommended greenfield implementation
| Area | Proposed implementation | Reason / caveat |
|---|---|---|
| Web | Next.js App Router + TypeScript | Shareable SEO pages and mobile-first PWA with one codebase. Confirm runtime versions with current docs before installing. |
| UI | Accessible components + CSS tokens / Tailwind if appropriate | Consistent brand, fast design iterations; avoid multiple UI frameworks. |
| API | Route handlers/server-side services in same repository | Keep business logic server-controlled; minimal operational layers. |
| DB | PostgreSQL + PostGIS | `Event`, `Occurrence`, organizer tenancy, radius search and full-text in one datastore. |
| Managed platform | Supabase (proposed), or equivalent managed Postgres/auth/storage | Validate PostGIS/RLS, backup, EU region, costs and vendor limitations. |
| Authentication | Managed auth, email sign-in or magic link | Organizer/admin only in MVP; consumer public. |
| Authorization | DB RLS where possible + server-side role checks | Defense in depth; no privileged client credentials. |
| Media | Object storage with controlled upload, image optimization and rights metadata | Avoid copied third-party imagery without permission. |
| Maps | MapLibre GL JS 6.13.0 + MapTiler (implemented 01D, D019) | Load on demand; not from unrestricted public OSM servers; no geocoding yet. |
| Search | Postgres full-text + spatial indexes | Add external index only after evidence. |
| Background jobs | Simple queued jobs/scheduler for import, expiry and verification reminders | Isolate only after volume requires it. |
| Analytics | Minimal, privacy-reviewed event records + aggregates | Do not collect entire clickstream by default. |
| AI | Not needed for core MVP; optional assisted extraction with human review later | Never let a model invent price/date/accessibility. |

## Suggested modules (logical, not microservices)
- `catalog`: events/occurrences, search, filtering, ranking.
- `geo`: venue coordinates, distance in meters, locality selection, geocoding policy.
- `organizers`: identity, membership, ownership, verified organization.
- `publishing`: drafts, updates, cancellation, permissions, revisions.
- `ingestion`: sources/licenses, import runs, dedup candidates, review queue.
- `trust`: reports, moderation cases, fraud/spam controls, takedown.
- `measurement`: privacy-respecting analytics, query success, quality/retention.

## Implemented map slice (Phase 01D)
| Piece | Path | Notes |
|---|---|---|
| Geo helpers | `src/modules/geo/bbox.ts` | `[lng, lat]` points, `[west, south, east, north]` boxes (= `ST_MakeEnvelope`), `area=` URL parsing |
| GeoJSON transform | `src/modules/map/geojson.ts` | The only Occurrence+Venue -> GeoJSON conversion; input is the already filtered result list; invalid/missing coordinates are reported, never placed at 0,0 |
| Provider | `src/modules/map/provider.ts` | Resolved on the server per request from env (`MAP_PROVIDER`, `MAPTILER_PUBLIC_KEY`, `MAPTILER_MAP_ID`); the browser only gets a style URL + attribution. Swappable |
| Map UI | `src/features/map/{map-panel,event-map,webgl}.tsx` | `next/dynamic` with `ssr: false`: MapLibre JS/CSS/worker load only in "Mappa" mode. HTML `<button>` markers over a clustered GeoJSON source (keyboard reachable). Fallback messages for no provider, no WebGL, provider error/timeout |
| Worker | `scripts/copy-map-worker.mjs` | MapLibre v6 worker copied to `public/vendor/maplibre/` by `predev`/`prebuild`; set with `setWorkerUrl` |

Data flow: `CatalogSection` (server) -> `CatalogExplorer` computes ONE `results` list = `filterCatalog(...)` + optional map area -> cards (Lista) and `toEventFeatureCollection(results)` (Mappa). Phase 02 can replace the area filter with `ST_Intersects(venue.location, ST_MakeEnvelope(...))` returning the same entries.

## Important invariants
1. Public results use published, current, eligible occurrences; the organizer may manage ended/cancelled ones separately.
2. `Event` (concept) and `Occurrence` (dated instance) have different IDs, statuses and deduplication semantics.
3. Canonical timezone is IANA `Europe/Rome` for Italian venue defaults, stored per venue/occurrence. Store UTC instants plus original local time/timezone when applicable. Define policy for ambiguous DST times and validate invalid date-time combinations.
4. Each event has an owner or a documented authorized source. Attribution and source verification visible and enforceable.
5. An organizer's direct verified edit wins over stale import. A new source import cannot silently revert a human correction.
6. Database queries filter tenant ownership; never rely on a button being hidden for authorization.
7. Display unknown values honestly: `not_verified` is not `false` and unknown price is not free.
8. Search ranking favors relevance, active state, proximity and data quality, not popularity alone.
9. Map must have a list fallback. Location permission is user-triggered and optional.
10. Rollouts remain reversible; store auditable migration files, never change a production database without explicit instruction.

## Minimal verification strategy
- Unit: date window logic, DST, age/price unknown, relevance, report/validation and dedup helpers.
- Integration: SQL spatial query, occurrence status, role boundary/tenant isolation, authorized source import.
- E2E: mobile no-login discovery; filtered weekend search; organizer lifecycle; admin correction/report; cancellation state.
- Quality: lint, typecheck, build; accessibility check of critical flows; dependency/secrets scan as applicable.

## Nonfunctional targets
No hard-coded unsupported SLO. Measure core web vitals, search latency with seeded dataset, map requests, import human minutes/accepted event, and operational cost. Cache only content that is safe to cache; avoid offline stale listings being shown as available without a warning.

## Architectural decisions to validate in Phase 00
See `docs/DECISIONS.md`. Frontend/database/auth/hosting are recommendations, not facts about the existing repository.
