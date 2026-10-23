# FACC incremental technical delivery plan

Work in self-contained, verifiable **vertical slices**. Perform *Phase 00 first*, and stop for architecture/UX confirmation before proceeding. Later prompts are stored in `prompts/` and may be adapted to the repository audit.

| Phase | Prompt | User-visible result | Gate for next phase |
|---|---|---|---|
| 00 | `00_audit_and_plan.md` | Actual repo inventory, architecture decision, 3-slice work plan; **no code modifications** | Owner confirms framework, source of events and minimal design direction. |
| 01 | `01_foundation_and_design_system.md` | Running responsive consumer homepage with truthful **DEMO** event fixtures, public layout, automated checks | Mobile/desktop screenshot or visual inspection; build/checks succeed. |
| 02 | `02_database_and_catalog.md` | Postgres/PostGIS schema, seeds and audited query for published occurrences; demo source separated from real | Migration/test, distance/status/DST cases pass. |
| 03 | `03_consumer_discovery.md` | Functional today/weekend search, filters, detail, save/share, optional map or graceful fallback | No-login end-to-end flow test and accessible states. |
| 04 | `04_organizer.md` | Organizer auth, membership and event create/edit/duplicate/cancel | Cross-tenant access denied, 2+ date occurrence tests. |
| 05 | `05_admin_ingestion.md` | Admin queue, authorized CSV import preview, license/provenance checks, reports | Idempotency, safe links, license restrictions, audit trail pass. |
| 06 | `06_analytics_and_quality.md` | Minimal legally gated instrumentation, data quality dashboard, validation cohort exports | Query success and critical-field metrics defined, no inflated attribution. |
| 07 | `07_pwa_hardening.md` | App shell/PWA, security and accessibility checks, staging readiness checklist | Privacy/legal/operational blockers disclosed, no production launch automatically. |

## Routine every slice
1. `/facc-plan <bounded problem>` if requirements/implementation are uncertain.
2. Review acceptance criteria, actual paths and migration impact.
3. `/facc-build <approved slice>` implements and tests.
4. `/facc-review <slice>` inspects objectively with evidence.
5. Record decision in `docs/DECISIONS.md` and backlog state.

## Execution constraints
- No all-at-once implementation. Do not add payment/LLM/social features because they are exciting.
- Default public fixture catalog should include 12-20 synthetic local activities across different dates, categories and price states; banner marks them DEMO.
- Each prompt must support existing code and stop if destructive changes would be required.
- Avoid blind install or remote provisioning when user authorization is absent.
- If a cloud account/provider key is missing, supply a safe local/test fallback, document the integration point, and do not fabricate results.
