# FACC domain and state model (conceptual v0)

Do not generate every table in the first slice. This is an aggregate map. Implement only what current user flows require, with migration tests and scoped permissions.

## Identity and tenancy
- `users`: organizer/admin user identities through managed auth (consumer can remain anonymous).
- `organizations`: organizer or local network, name, contacts (prefer generic role address), verification state, verified_at.
- `memberships`: `(user_id, organization_id, role, status)`; role owner/editor/viewer with server and DB enforcement.
- `venues`: reusable place, location display, structured address, geography Point (SRID 4326), IANA timezone, geocode origin and manual correction metadata.

## Catalog
- `events`: persistent identity, title, original description/rights flags, organizer, category tags, age_min/max (nullable), accessibility (`yes/no/not_verified`), indoor/outdoor (`indoor/outdoor/mixed/not_verified`), pricing model, contact, external booking link, license/source pointers, revision number.
- `occurrences`: event_id, venue_id, local start/end & timezone, UTC starts/ends, capacity/availability if verified, booking requirement, individual status (`draft/published/needs_confirmation/cancelled/ended`), confirmed_at.
- Separate event identity from repeated individual dates; cancellation/status is per occurrence when possible. A multi-date series is not multiple organizers or unique events.
- `bookmarks`: local browser storage first; no personal account needed. Cloud sync is optional later.

## Provenance, imports and trust
- `sources`: origin type (direct organizer/authorized feed/open data/other reviewed), owner, reference URL, attribution wording, approved scope, refresh cadence, current state.
- `licenses`: document/reference of permission or reuse basis; allowed text/media/fields, expiry, attribution, reviewer, review timestamp. Missing grant means **hold**, not default publish.
- `source_event_links`: original identifier to canonical event/occurrence, source_updated_at and import timestamps.
- `field_provenance`: optional per-critical-field source + last asserted value + verification confidence. Avoid overengineering in first schema migration: implement an immutable structured revision record if easier for pilot.
- `import_runs`: source, start/end, attempted/accepted/held/rejected, exceptions, operator, hashes, human minutes, source license status.
- `revisions`: actor, aggregate, action, previous/new values (privacy-limited), time, reason and winning source.
- `reports`: event/occurrence, issue category, reporter contact only if necessary, received_at, triage state, resolution, audit trail.
- `moderation_cases`: actor, reason, status, outcome, appeal if required; use internal access restrictions.

## Later/not first-phase entities
- `campaigns`, `billing_accounts`, subscription plans and B2G territory agreements are **future candidates**. Do not create payment integration before a commercial/legal decision.

## Geosearch and indexing
- Use geometry/geography with valid lat/lon, GiST indexes; indexed `ST_DWithin` on venue geography for radius. Radius defined in meters, limits defensively clamped.
- A locality can be selected manually from a curated table/search; never require device geolocation.
- Datetime filter must compare venue-local calendar windows correctly. Search results return relevant occurrences, not merely events, ordered by imminence, proximity and documented quality.
- Duplicate candidates: exact source ID first, then deterministic normalized title+venue+nearby time; semantic similarity may only propose human-reviewed merges. Avoid automatic merging across distinct sessions.

## State and conflict resolution
- Publication: draft -> review/approved -> published; expired -> ended; cancellation explicit. Needs confirmation is visible as such or hidden by quality policy until reconfirmed.
- Source freshness: record last verified independently of scrape/import timestamp. Date-sensitive data can expire sooner than stable event description.
- Verified organizer update > older import; record conflict as a review case. Do not overwrite a critical verified field silently.
- Withdrawn permission -> unpublish affected text/media as dictated by the license and audit obligations; retain only minimal audit as reviewed legally.

## Explicit edge cases for test fixtures
- Two occurrences of same workshop on different Saturdays; cancel only second.
- Event starts at 23:30, ends after midnight; weekend boundaries must work.
- Two venues sharing an address; geocoding cannot assume one unique venue.
- Date around Italian DST switch; never silently shift by an hour.
- Free event vs unknown price; child-friendly vs age unknown.
- Cancelled occurrence with a still-live outbound URL should never be shown bookable.
- Duplicate CSV row / repeated import must be idempotent and not reset organizer-confirmed values.
- User from org A requesting org B data by guessed ID must be denied.
