# Decision register (ADRs - do not infer approval)

| ID | Decision | Current status | Default suggestion / needed evidence |
|---|---|---|---|
| D001 | Launch area | OPEN | Choose one local catchment; Bergamo/Bologna are candidate hypotheses, not fixed. |
| D002 | Initial audience | PROPOSED | Families + nearby culture; verify user interviews. |
| D003 | App form | PROPOSED | Public responsive PWA, SSR/SEO; native later. |
| D004 | Web framework | OPEN | Next.js TypeScript if empty repo; preserve existing viable technology. |
| D005 | Managed backend | OPEN | Postgres+PostGIS; candidate Supabase; verify account, costs, jurisdiction, credentials. |
| D006 | Authentication | OPEN | Managed organizer/admin auth; public consumer anonymous. |
| D007 | Map/geocoder | OPEN | Licensed commercial tiles and policy-compatible geocoding; mock map if keys unavailable. |
| D008 | Visual identity | OPEN | FACC working name, no assumed logo or existing brand guidelines. |
| D009 | Seed catalog | PROPOSED | Explicit synthetic DEMO fixtures first; real licensed event data later. |
| D010 | Billing/payments | DEFERRED | No ticket checkout; organizer pricing validation can use an external/manual paid test after approval. |
| D011 | Data source partners | OPEN | No rights, feeds, contracts or organizational claims are yet established. |
| D012 | Privacy/legal review | OPEN | Complete DPIA/CMP/ToS assessment as appropriate before public launch. |

Update entries from OPEN/PROPOSED to ACCEPTED with date, rationale, alternatives, trade-offs, owner and rollback note after decision. Never treat an assistant suggestion as owner approval.
