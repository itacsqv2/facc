# Attorno / Claude Code - starter kit

This ZIP is **not a finished application**. It is a project-control kit: a persistent `CLAUDE.md`, reusable Claude Code skills, product/technical decisions and seven prompts for incremental construction.

## Installation into the existing `attorno` repository
1. Clone or open the existing `attorno` repository locally in VS Code or a terminal. **Do not create a second repository**.
2. Check `git status` and back up/merge any file that already exists under the same name. The kit does not contain app source code or `.env` files.
3. Extract the ZIP contents **directly at the repository root** (not inside an extra `attorno_claude_kit/` folder). The root should contain `CLAUDE.md`, `.claude/`, `docs/`, `prompts/`.
4. Run `git status` again to inspect added files. Do not commit yet if you want to review the project direction first.
5. Run `claude` in the repo root (or open a Claude Code session targeting that folder).
6. Copy the entire content of `prompts/00_audit_and_plan.md` into Claude Code, with **plan mode** enabled. This prompt is intentionally read-only.
7. Review the response and the ADRs. When you approve the direction, send the content of `prompts/01_foundation_and_design_system.md` to implement the first visible slice.

## Files you will use
- `CLAUDE.md`: permanent project principles and safety constraints.
- `.claude/skills/attorno-plan/`: `/attorno-plan` for bounded planning.
- `.claude/skills/attorno-build/`: `/attorno-build` for one vertical slice with checks.
- `.claude/skills/attorno-review/`: `/attorno-review` for independent acceptance review.
- `.claude/skills/attorno-ux/`: UX constraints invoked as relevant.
- `.claude/skills/attorno-data-quality/`: ingestion, rights and provenance rules.
- `.claude/skills/attorno-security-privacy/`: isolation, privacy and threat review.
- `docs/`: product requirements, architectural choices, domain model, UX, metrics, backlog and gates.
- `prompts/`: ordered, copy/paste-ready prompts (`00` to `07`).
- `docs/source/`: business plan HTML (unaltered source supplied by the project owner).

## Principles
- Keep `CLAUDE.md` short; Claude Code reads it each session. Skills load on demand.
- Do not paste the entire business plan into every message. Claude can read specific sections from `docs/source/` when necessary.
- **Phase 00 must not write code**. The default proposed stack is a starting point, not an approved architecture.
- Do not let a single broad prompt generate the whole app. Each following prompt includes executable acceptance criteria.
- Frontend should demonstrate immediate utility with explicit DEMO fixture data before connecting real production data.
- The one-territory business-validation goal is more important than nationwide inventory size.

## Project status after installing this kit
Only the instructions/plans have been created; no repository audit has happened, no packages have been installed, no tests have run, and nothing has been deployed.

## Suggested working commands (after confirming the actual stack)
`git status` / `claude` / `npm run dev` / `npm run test` / `npm run build`

The `npm` commands are illustrative only; Phase 00 selects the actual package manager based on repository contents.
