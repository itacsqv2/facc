---
name: kesifa-build
description: Implement exactly one approved Kesifa vertical slice with tests, proof of verification, documentation updates and no scope creep. Only use when the user explicitly invokes it to modify code.
disable-model-invocation: true
argument-hint: "<approved slice ID or feature>"
---

Build this approved slice: `$ARGUMENTS`.

1. Read `CLAUDE.md`, relevant docs, selected backlog row and the actual existing implementation. Check `git status`. Protect uncommitted files.
2. Confirm the task is a single vertical slice. List acceptance tests before editing; if it spans multiple slices, implement only the first independently useful slice.
3. Never invent third-party events or pretend synthetic data is real. Enforce licensing/source rights, explicit unknown states, tenant authorization and consent as applicable.
4. Implement the smallest maintainable change consistent with the existing stack. If migrating data, provide reversible changes and do not touch production without approval.
5. Add relevant unit/integration/e2e tests; at least one negative test for authorization, invalid or stale data when applicable. For UI, verify mobile, desktop and keyboard/accessible labels.
6. Run only actually available local quality commands (typecheck, lint, tests, build). If the commands fail, make a focused repair or record the blocker. Never fake passing status.
7. Update the relevant docs, decision log and backlog only for accepted changes. Do not commit/push/deploy or spend money unless requested.
8. Report: implementation summary, changed paths, acceptance table PASS/FAIL/NOT RUN, exact commands/exits, visual evidence when available, risks and **one** next recommended slice.
