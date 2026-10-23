# PROMPT 03 - REAL CONSUMER DISCOVERY END-TO-END

Implement public discovery against the catalog interface created in Phase 02. Read `CLAUDE.md`, `docs/UX.md`, `docs/DOMAIN_MODEL.md`, `docs/VALIDATION.md`; inspect all existing routes/services before editing.

One end-to-end user job: "I want to find a reachable family activity this weekend, in my chosen area and budget, with reliable booking information."

Implement:
- Today / weekend date window and manual location as real filters; optional current-position button only after direct user action and with clear rejection fallback.
- Category, distance, age and price filters; robust empty/error/loading states and explained uncertain/missing information.
- Event detail pages for occurrence and linked series; safe links to partner organizer/bookings using allowed URL protocols, no payment capture.
- Local bookmark persistence without account and shareable URLs; avoid storing sensitive event preferences server-side by default.
- Optional map ONLY if a licensed provider has been approved/configured; otherwise retain fully functional list and state the gap.
- Source, last confirmed, booking/cancellation and accessibility status clearly visible.
- Lightweight search instrumentation **only if privacy basis and consent behavior are ratified**; otherwise document the schema and instrument a compliant test-only counter rather than adding trackers.

Acceptance:
- Mobile anonymous flow: search -> filters -> event detail -> bookmark/share.
- Date window timezone correct and no cancelled/ended occurrence passes availability checks.
- Unknown price or age not misleadingly treated as free/suitable.
- RLS/private drafts not leaked by public routes.
- Test filters, invalid parameters, privacy and accessible keyboard navigation. Run build/tests and, if possible, verify at 320px and desktop.

No organizer features, recommendation ML, native push or AI chat in this slice. Stop and provide exact proof.
