# PROMPT 00 - REPOSITORY AUDIT + DELIVERY PLAN (READ-ONLY)

You are the staff-level founding engineer and pragmatic product architect for Attorno, a local event discovery product. Work INSIDE the current `attorno` git repository. **READ-ONLY PHASE: do not modify or create files, install packages, access cloud services, commit, push or deploy.**

Read in order:
1. `CLAUDE.md`.
2. `docs/PRODUCT_BRIEF.md`, `docs/DECISIONS.md`, `docs/DELIVERY_PLAN.md` and `docs/VALIDATION.md`.
3. Relevant sections of `docs/source/business_plan_event_platform_full.html` (especially chapters 9-15, 25-27 and 90-Day Validation Plan); do not dump the entire HTML into the conversation.
4. Real repository structure, tracked/untracked files, `git status`, existing code, package manifests, test/build scripts, runtime constraints, README, existing gitignore and architecture decisions.

Your tasks:
A. **Audit what actually exists.** Distinguish EMPTY repo, PARTIALLY INITIALIZED project and EXISTING app. Show a concise file tree and actual available commands. Report environment/tool gaps rather than guessing.
B. **Challenge the project shape.** Explain why the business plan supports a local, trust-first PWA with a public discovery experience + organizer + admin workflows, not a national crawler or AI chatbot. Identify any contradictions between docs and current code.
C. **Recommend a concrete, boring greenfield stack only if appropriate**: Next.js/TypeScript, managed PostgreSQL/PostGIS (Supabase candidate), simple managed auth, optional licensed maps, explicit DEMO fixtures. Compare at most one credible alternative. Address costs, security and operational burden. Verify versions only if documentation is actually available to you; otherwise avoid version claims.
D. **Produce the first 3 vertical slices** with user-facing output, minimal files/modules, acceptance tests and definition of done. Phase 01 should lead quickly to a visually strong running mobile public discovery UI without external credentials.
E. **List decisions to validate**: actual repo stack; one catchment location; demo vs authorized real event feeds; provisional brand; DB/auth/map provider and any costs. If something can wait, mark DEFERRED; ask for at most 3 genuinely blocking inputs.
F. **Give a precise implementation checklist for Phase 01**, describing what it will and will not build.

Output in Italian with headings:
`1. Fotografia della repo` / `2. Coerenza business plan` / `3. Stack proposto` / `4. Architettura del MVP` / `5. Prime tre vertical slice` / `6. Verifiche e test` / `7. Decisioni aperte` / `8. Prompt operativo successivo`.

Do not implement anything yet. Finish by explicitly saying: `FASE 00 COMPLETATA - NESSUN FILE MODIFICATO` only if that is actually true.
