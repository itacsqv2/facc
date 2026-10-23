# Measurement and 90-day validation

Product delivery is not business validation. These thresholds are **hypotheses from the supplied business plan**, not known traction.

## Investment gates from business plan
| Dimension | Indicative GO gate for further MVP investment |
|---|---|
| Supply | >=80 contactable organizers and >=50 relevant occurrences per week within one local catchment. |
| Query liquidity | >=80% qualified test queries return >=3 **practicable** distinct occurrences. |
| Critical data accuracy | >=95% fields verified correctly in audited sample. |
| W4 retention | >=25% after 4 weeks **among >=300 activated consumer users**, cohorts tracked separately. |
| Organizer willingness to pay | >=20 real paying organizers at tested prices by day 90; declarations of interest do not count. |
| Data operations | <3 human minutes per accepted event, improving toward 1.5. |
| Territorial buyers | 2 with budget/procedure and concrete pilot evidence where B2G is considered. |
| Economics | Loaded organizer CAC <=EUR400 and prospective payback <=12 months, if sufficiently measured. |

Conditional GO requires legal supply, quality, retention and payment conditions together; averages do not compensate for missing rights or poor quality. A dashboard cannot manufacture evidence.

## Three governing investment metrics
1. **Useful repeat choices**: local unique users with meaningful decisions (saved relevant event / valid booking outbound / verified attendance) on two distinct weeks over 4 weeks. Keep intent separate from verified attendance.
2. **Reliable local liquidity**: share of qualified, time-and-location-specific searches yielding at least three current, compatible occurrences after relevance, travel radius and quality checks.
3. **Monthly contribution by catchment**: attributable revenue minus local service, acquisition and support costs. Central fixed cost separate. This metric is not yet measurable in pre-revenue prototypes; mark unavailable.

## First-party event dictionary candidate
- `search` {catchment_id, coarse_date_window, filter_flags, result_count, test_cohort?}; never raw GPS history.
- `result_view` {occurrence_id, position, query_token}; deduplicate impressions as a separate metric.
- `event_view` {occurrence_id, source_channel, quality_state}.
- `save` {occurrence_id, action: add/remove}; allow local-only anonymous version before server tracking.
- `outbound_booking` {occurrence_id, destination_partner, click_id}; click != sale.
- `report` {occurrence_id, issue_type}; protect reporter privacy.
- Reserved for future: `organizer_follow`, `partner_order_confirmed`, `attendance_confirmed`. Do not simulate these as authentic conversions.
- Data-quality ops: `event_created`, `event_verified`, `occurrence_cancelled`, `import_accepted`, `import_rejected`, `minutes_human_review` in protected server admin metrics.

## Privacy conditions
Instrument privacy by design. Consider a minimum server-side aggregate measurement approach while privacy/legal classification is reviewed. Do not deploy optional behavioral analytics until the applicable legal basis and consent configuration have been assessed. Exclude bots/internal testing, avoid recording sensitive event interest, add retention/deletion rules.

## Query success definition
A "practicable" result must pass: in chosen date window; realistically reachable; meets stated category/age/budget; booking/open status sufficiently verified; not cancelled/ended/duplicated. Denominator = explicitly sampled representative qualified searches; publish outcome per cohort and catchment. Unknown is not success by default.

## Execution sequence
Days 1-15: interviews and source audits -> days 16-30: legal catalog and landing -> 31-45: organizer activation and price experiments -> 46-60: W4 cohorts, limited acquisition and boost tests -> 61-75: updates, renewals and territory proposals -> 76-90: decision. Pilot budget hypothesis: EUR30,000 over 90 days; no spending or external campaign authorization is implied.
