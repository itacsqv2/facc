# PROMPT 06 - VALIDATION SIGNALS, NOT VANITY METRICS

Read `CLAUDE.md`, `docs/VALIDATION.md` and the business-plan chapters 25-27. Inspect current data/UI/instrumentation. Your goal is to make the 90-day decision possible, not to add a general analytics warehouse.

Implement:
- Concrete definitions and testable calculations for query success (>=3 distinct practicable occurrences / qualified query), freshness/critical field accuracy, duplicates, imports and operator work time.
- Minimal dashboard distinguishing sample data from real activity, with a prominent label when cohorts or revenue data are unavailable.
- Opt-in/privacy-reviewed client tracking only when actual lawful basis/consent and provider decisions have been documented. Otherwise use safe local test fixtures and aggregate server ops metrics without silently shipping behavioral trackers.
- Typed event dictionary for `search`, `result_view`, `event_view`, `save`, `outbound_booking`, `report`; reserve confirmed partner orders/attendance without fabricating them.
- Cohort calculations for W4 **activated users** only when there is appropriate real, permissioned identification; keep same-person dedup, bots, staff and seasonality separated.
- Internal export of aggregates for manual 90-day business review; admin-only access where data is nonpublic.

Acceptance:
- Test cases define denominators, date boundaries, >=3 candidate eligibility, duplicated actions, late cancellation and missing data.
- No fabricated real MAU, retention, click-to-sale, confirmed participation, paid organizer or revenue metric.
- Consent/refusal path works as described. No optional trackers before user choice if consent is required.
- Dashboard is legible, accessible and explicit on metric quality/coverage.
- Run real automated checks and provide sample outputs labeled simulated.

Do not add paid advertising, notifications, predictive AI or external analytics vendor without approval. Stop.
