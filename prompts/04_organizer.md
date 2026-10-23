# PROMPT 04 - ORGANIZER ACCOUNT AND EVENT LIFECYCLE

Build an organizer vertical slice, not a generic CMS. Read `CLAUDE.md`, `docs/DOMAIN_MODEL.md`, `docs/UX.md`, `docs/ARCHITECTURE.md` and inspect actual authentication/DB/route code. Use the approved managed auth; never invent client-side authorization.

Deliver:
- Organizer sign-in/account, organization profile, membership roles and minimal ownership checks. An authorized person may be in multiple organizations; no shared accounts.
- Form flow: title + venue -> occurrences -> practical/price/age/booking/source rights -> preview -> save/publish pending applicable review. Show useful validation errors.
- Edit, duplicate, cancel one occurrence, and reconfirm existing events with revision/audit information. When duplicating, force explicit new dates.
- The organizer must explicitly warrant rights over submitted text/media and confirm event accuracy; file uploads only with validated types, sizes, access and storage rules.
- Secure server-side mutations. Clear draft/review/published/needs_confirmation/cancelled states.

Acceptance:
- A normal organizer can independently publish a second event with fewer actions than the first; track duration locally in a test if feasible.
- Member of org A cannot read/edit/write org B data by guessing IDs. Anonymous user cannot call mutation endpoints.
- Existing consumer pages reflect a revised/cancelled occurrence correctly.
- A duplicate is a new event or occurrence with new dates, not duplicate natural IDs.
- Validation, accessibility, audit and authorization negative tests pass. If no approved auth provider/account exists, do not silently bypass security: implement local test mode and clearly label it not production ready.

Do not add subscription/payments or email marketing. Verify with actual commands and stop.
