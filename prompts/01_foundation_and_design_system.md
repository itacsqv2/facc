# PROMPT 01 - CREATE FIRST RUNNING PUBLIC EXPERIENCE

This is an IMPLEMENTATION task. Read `CLAUDE.md`, `docs/PRODUCT_BRIEF.md`, `docs/UX.md`, `docs/DELIVERY_PLAN.md` and the Phase 00 audit decisions first. Use `/facc-ux` concepts for UI work. Inspect actual repository changes and existing code before editing.

Goal: deliver a **running, attractive, responsive, accessible FACC public discovery shell** with genuine working local demo interactions and no external service credentials. This is NOT a marketing landing page and NOT a full backend. If the repo is empty and Phase 00 confirmed the recommendation, scaffold Next.js App Router with TypeScript using the agreed package manager. Otherwise extend the viable existing stack without wiping content.

Implement only:
- Small maintainable design tokens, typography and responsive layout; Italian copy and a coherent provisional FACC look. Do not invent a real logo; a typographic wordmark is acceptable.
- Home with region/locality selector (manual, initially demo/local options), `Oggi` and `Questo weekend`, simple category and price/free filters, visible result count and helpful no-result state.
- Public list/cards with click-through to event detail route using 12-20 local **synthetic fixtures** defined in a typed module. Display a permanent DEMO notice and individual event markings; avoid invented social proof and partner logos.
- Event detail fields: scheduled occurrence, address, cost state, age suitability, organizer, booking conditions, source marker and last verified marker (use demo source). Provide a safe fake call to action for demo and prevent purchase claims.
- Working local bookmark control, shareable detail URL; optional map UI may be a disabled placeholder with an honest message, NOT a fake working map.
- Loading, empty, invalid slug and cancellation states (include one cancelled fixture). Basic metadata and accessibility essentials.
- Developer scripts/test framework matching actual stack and focused UI/filter/date tests. Do not require real database, auth, map API, AI calls or paid services.

Acceptance:
1. A first-time anonymous user can open the app and select today/weekend and filter synthetic events.
2. At 320px and desktop the homepage and detail remain readable; list use never requires map or GPS.
3. Any demo item is recognizably artificial and cannot be mistaken for a real bookable event.
4. Prices distinguish FREE, PAID with known amount, and UNKNOWN; cancelled occurrences do not expose active booking CTA.
5. Page has meaningful error/empty states, keyboard focus and semantic headings/labels.
6. Tests, typecheck, lint and build pass where configured. Provide exact logs or errors; run app/screenshot if environment permits.

Stop after this one slice. Report changed files, screenshots/viewport evidence, commands/exits, what is still mocked, and recommend Phase 02 only. No commit, push or deploy.
