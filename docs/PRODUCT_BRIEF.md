# Attorno - product brief (business plan -> implementation)

## Opportunity / user job
Consumer intent: "Choose a credible activity for a real day, reachable from my area, compatible with time, age, price, booking requirements and practical constraints." The public experience must optimize **time to useful choice**, not list length. An organizer wants to **publish once, correct quickly and distribute** with less manual effort. A territorial network may pay to coordinate supply from multiple local entities.

## First wedge
- Free PWA for public discovery, initially families and local culture, in a **compact 20-30-minute catchment**.
- Bergamo + surroundings is the initial recommendation in the business plan; Bologna + surroundings an alternative. **No city or partners have been confirmed**. Keep location configurable and default to clearly marked demo data.
- Enter through licensed/direct supply + basic organizer workflow; prove consumer repeat utility before distribution spending.

## MVP P0: must-have
1. Server-rendered mobile responsive discovery, today/weekend, manually selected area; no account required.
2. Essential filters: dates, distance, categories, child age suitability, price/free; robust empty states.
3. Optional map view (list remains fully usable); accessible event detail with date/time, exact place, price, booking conditions, organizer/contact and source/freshness.
4. Organizer user/organization account and minimum roles; create, edit, clone, cancel with a clear recurrence/occurrence split.
5. Internal admin for moderation, authorized CSV import, provenance/rights tracking and correction/report workflow.
6. Local bookmark and share without account; only lawful/consented analytics with correct deduplication.
7. Notice/report error, privacy copy/consent gating, minimum security safeguards.

## P1 after base works
Follow an organizer; opt-in email digest; ICS export; simple recurrence exceptions; source reconfirmation reminders; embeddable widget; organizer click-through reporting; explicit indoor/outdoor attributes.

## Explicit non-goals until validated
Native iOS/Android apps; AI chatbot; conversational discovery; paid consumer subscription; ticket checkout; public reviews/ratings; social network/feed; geo-fencing; complex recommender; nationwide generic expansion; scraping everything that is visible online.

## Product acceptance examples
- A parent can select a weekend and a manually entered locality, filter ages 3-5 and max cost, and quickly identify at least one *verified, practical* activity (if catalog has such supply).
- A result clearly differentiates "free" from "price unknown", "accessible" from "not verified", and "reservation required" from "booking link available".
- Canceling one date in a recurring event does not cancel the whole series. Cancelled/expired occurrences cannot appear as bookable.
- An organizer cannot edit a different organization's event or override license restrictions. An admin can resolve a report with an audit trail.
- A synthetic demo is visibly identified as DEMO. No placeholder event is silently presented as a public event.

## Commercial hypotheses - not requirements
Freemium organizer and future tiers ~EUR19/49 monthly; paid promotion / territory contracts are **untested assumptions**. Do not implement production billing or checkout for first slices. Technical instrumentation should allow later attribution without claiming purchases.

## Provenance
Source: uploaded *Business Plan - Piattaforma di eventi territoriali in Italia*, chapters 5, 9, 10, 11, 13-15, 25-27 and "90-Day Validation Plan". This brief preserves business-plan hypotheses rather than certifying them.
