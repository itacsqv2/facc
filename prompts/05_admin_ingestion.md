# PROMPT 05 - MODERATION + AUTHORIZED CSV IMPORT

Read `CLAUDE.md`, `docs/DOMAIN_MODEL.md`, `docs/ARCHITECTURE.md`, `docs/PRODUCT_BRIEF.md`; use `/facc-data-quality` principles. Inspect existing code/data and keep the slice bounded.

Implement only:
- Restricted admin review dashboard for event/report moderation, corrections and explicit resolution reasoning, with audit record.
- Source registry with owner, permission/license evidence reference, valid date range, rights by field/media and attribution. It must be possible to block or unpublish noncompliant records.
- CSV upload / paste import **into staging/preview**, never direct publication: parse/limit size, validate mandatory fields and safe URLs, timezone normalization, dedup candidates, license applicability and explicit per-record decision.
- Idempotent import by source identifier/hash, conflict detection, reasoned accepted/held/rejected counts and import run logs. Human moderator approves publication. Organizer-confirmed values win over older imports.
- Error report workflow visible to admin: pending -> triaged -> corrected/rejected with reason; surfacing of critical near-term cancellation errors.

Acceptance:
- The same CSV twice does not duplicate accepted records; conflicting older data does not erase human corrections.
- File from a source with missing/expired rights cannot publish unreviewed descriptions/images.
- Org A cannot access admin tools; admin mutation requires server-side role.
- A cancellation/revision is reflected on consumer UI and logged.
- Malicious CSV formula/injection, URLs, huge payloads and malformed dates have safe handling (tests or documented defense).
- Human minutes per accepted event and rejected/held counts can be derived.

No uncontrolled crawler or AI rewriting of copyrighted descriptions. Run tests/typecheck/build and stop.
