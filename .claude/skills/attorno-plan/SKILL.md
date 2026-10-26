---
name: attorno-plan
description: Read-only planning of one Attorno product or engineering slice, grounded in the local discovery business plan and actual repository structure. Use when the user explicitly wants a technical plan and acceptance tests before code.
disable-model-invocation: true
argument-hint: "<bounded feature or decision>"
---

Plan this bounded request: `$ARGUMENTS`.

1. Read root `CLAUDE.md`, `docs/PRODUCT_BRIEF.md`, `docs/DECISIONS.md`, `docs/DELIVERY_PLAN.md`, and only the relevant domain docs/source sections.
2. Inspect actual repository structure, relevant code, package scripts and git status. Do not modify files, install packages, change cloud resources, or start implementation.
3. Separate **verified facts**, **assumptions** and **open decisions**; flag any missing license or production secrets without requesting them in chat.
4. State the user job, in/out of scope, and a single narrow vertical slice with the minimum data/UI/backend integration.
5. Define 3-8 observable acceptance criteria and test cases, including negative and accessibility/security cases when appropriate.
6. Compare at most 2 credible implementation options, emphasizing speed, reversibility, costs and alignment with the modular-monolith architecture.
7. Output in Italian with headings: `Stato reale della repo`, `Obiettivo`, `Scelte`, `File da toccare`, `Criteri di accettazione`, `Test`, `Rischi`, `Decisioni richieste`.
8. STOP. Do not start coding; ask for implementation approval only if the decision is blocking. The owner may invoke `/attorno-build` after review.
