# FACC - persistent project instructions

## Mission and source of truth
Build FACC: a reliable, local-first **event discovery platform**, initially for families and nearby cultural activities. Its core promise is not "all events" but "find a realistic, verified activity I can attend". The business plan in `docs/source/business_plan_event_platform_full.html` is strategic source material; `docs/PRODUCT_BRIEF.md` is its compact operational summary. Follow explicit decisions recorded in `docs/DECISIONS.md`. Do not present business-plan assumptions as validated facts.

## Scope and launch sequence
- Start with **one configurable local catchment**, not Italy-wide coverage. Bergamo and Bologna were candidate hypotheses in the plan; neither is selected.
- Public consumer: mobile-first, SSR/SEO-friendly PWA, accessible without account; today/weekend discovery, manual location, essential filters, event detail, optional map, save/share.
- Organizer: individual accounts linked to organizations; create/edit/duplicate/cancel events and occurrences with a fast, understandable workflow.
- Admin: moderate and correct data; import authorized CSV/feeds; record source, rights, field provenance, freshness, revisions, and reports.
- Postpone native apps, chatbot/conversational AI, consumer paid subscription, proprietary ticket checkout, public ratings/reviews, social feed, automated scraping, heavy ML and microservices.
- The **90-day validation** can start with a manual/concierge catalog; do not confuse building software with validating the business.

## Architecture guardrails
- Inspect the actual repository before selecting or modifying tooling. Proposed greenfield stack (NOT yet approved): Next.js App Router + TypeScript for web/SSR, PostgreSQL/PostGIS (managed, e.g. Supabase), managed auth, object storage, a commercial/licensed map tiles provider on demand, modest first-party analytics.
- Favor a modular monolith over microservices, small dependencies, clear boundaries, testable business logic and reversible decisions.
- Separate `Event` (identity/content) from `Occurrence` (date/time/status). Preserve IANA timezone and UTC instants; handle recurrence and DST explicitly.
- Use PostGIS to filter by distance; do not geocode every consumer request or download unrestricted public map tiles.
- Seed or mock records must be clearly labeled **DEMO**; never pretend they are verified live events.

## Non-negotiable data and trust rules
- No ingestion or publication of third-party descriptions, images, feeds or events without a documented permission/license or another reviewed legal basis. Public availability does NOT grant reuse rights; no indiscriminate scraping.
- Keep source owner, allowed fields/media, attribution terms, license validity, import audit and last verification. Where information is unknown, say "not verified" rather than inventing it.
- Organizer-verified updates take precedence over stale imports; every significant change should be auditable. Cancellation and expiry must propagate to all public views.
- External booking links lead to partners; FACC does not take payment for event tickets in MVP.

## Security and privacy by design
- No mandatory consumer sign-in; manual location first, device geolocation only on explicit interaction; never maintain GPS history.
- Treat minors as audience suitability metadata, **not** as child accounts or profiles. The MVP targets adults making choices for families.
- Minimize personal data; no optional analytics/marketing trackers before a justified permission/consent choice. Do not treat "first-party" as automatically exempt.
- Enforce ownership, role-based authorization and database policies (RLS where applicable), including tests for cross-tenant access and object IDs.
- Never put credentials in source, console output, seed data or client bundles; never expose privileged database keys to the browser.
- URLs, file uploads, imports, dates, sizes and content must be validated server-side. Use safe outbound link handling and rate limiting.
- Legal/compliance items are engineering design constraints, not a substitute for legal review before production.

## Definition of done for EVERY slice
1. Inspect and summarize impacted existing files before edits.
2. State a small, testable goal, assumptions, and explicit exclusions; update relevant plan/checklist.
3. Implement only the agreed slice, favoring working vertical paths over speculative abstraction.
4. Add/adjust tests for behavior, failures, accessibility where UI is impacted, and authorization/privacy where relevant.
5. Run available typecheck, lint, tests and build, reporting actual commands, exit statuses and failures. If unavailable, say so.
6. When UI changes, inspect mobile and desktop; record known limitations instead of claiming visual QA without evidence.
7. End with: files changed, what works, proof of verification, remaining risks, exactly one suggested next slice.

## Collaboration and repository hygiene
- Default to Italian for user-facing explanations; code identifiers can be English. Keep public UI copy in clear Italian.
- Never overwrite existing architecture, secrets, user code or uncommitted work without an explicit reason and approval.
- Do not commit, push, deploy, purchase services, enable paid APIs or migrate production data unless explicitly instructed.
- Do not invent test outputs or user decisions. Ask only when an actual blocking decision prevents safe progress; otherwise use reversible defaults and label them.
- Before implementation, read `docs/DELIVERY_PLAN.md` and the appropriate domain specification. Apply relevant `.claude/skills` when needed.
