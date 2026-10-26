# Attorno UX and provisional visual direction

## Core promise
Answer the actual consumer question in seconds: **"Cosa facciamo oggi o nel weekend, vicino a noi?"** Do not force onboarding before showing useful choices. Use concise Italian, warm but factual language. Prioritize practical data over social vanity metrics.

## Provisional art direction (not an approved brand)
- Feel: trustworthy local editorial guide, contemporary, inviting, not corporate dashboard or generic app template.
- Suggested tokens: warm canvas `#FAF8F2`, near-black ink `#21312D`, evergreen accent `#17695C`, sunny warm action `#E9B950`, muted body `#65736B`, border `#DCE4DB`. WCAG contrast must be verified rather than inferred from hex colors.
- Typography: distinctive editorial heading and legible system UI sans, self-hosted or properly licensed, with accessible fallback. Avoid remote font dependencies when unnecessary.
- Mobile-first cards: date badge, image *only if rights are recorded*, title, place/distance, price state, age suitability, organizer, source/last confirmation. No fabricated ratings, attendees or availability.
- Important: deliberate empty states and clear filter chips; keyboard and screen-reader navigation; visible focus; minimum touch targets; a map toggle that never blocks list use.

## Public consumer flows
1. Home: location manually selected (or a clearly labeled demo area), day switch `Oggi` / `Questo weekend`, prominent compact search controls, useful upcoming results above the fold.
2. Filters: category, relevant ages, cost and maximum distance; unknown data must not be falsely presented as matching an exact requirement.
3. Event details: what/when/where, price, booking requirements, link to organizer/partner, contact, original source, last confirmed, accessibility if verified; clear cancellation and outdated information messages.
4. Save/share: local bookmark without sign-in, copy/share accessible URL; no pretend server sync.
5. Map: optional on demand, with matching list; no map provider quota or geolocation permission needed to use list.
6. Report: concise issue form with category and optionally contact; no unnecessary identity capture.

## Organizer flows
1. Log in to organizer workspace, pick authorized organization or request access.
2. Create event in progressive steps: identity/venue -> dates/occurrences -> practical details/rights -> preview/submit.
3. Edit and duplicate without accidentally preserving previous dates; cancellation per occurrence; source confirmation and revision log.
4. Understand status and action needed, not opaque codes. Measure *second publication without assistance* as a real success condition.

## Admin flows
- Queue sorted by urgency and next occurrence, with evidence/source/license status and conflict flags.
- CSV preview -> field validation -> duplicates and rights check -> human approval -> result and import log.
- Report resolution and correction with reason/audit, including rollback visibility.

## Demo integrity
- Clearly label synthetic content `Evento dimostrativo - dati fittizi`, include recognizable demo banner and no live ticket purchase routes. Avoid generated stock event photos presented as genuine local events.

## Interaction/accessibility acceptance
- 320px through desktop, keyboard only path through search and details, visible focus, headings/labels, accessible date controls, empty/error states and no color-only meaning.
- Verify metadata, semantic page structure and indexability of public event pages; avoid leaking drafts or future private admin pages through SEO.
