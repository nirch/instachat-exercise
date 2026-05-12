Parse $ARGUMENTS to determine the input mode:

- **Mode 1 — breakdown spec:** arguments are exactly two tokens where the second is a number (e.g. `live-chat 3`). The first token is the feature slug and the second is the feature number.
- **Mode 2 — inline spec:** argument is a single token (the derived kebab-case slug from `/product-spec` Mode 2, e.g. `typing-indicators`).

Steps for **Mode 1**:
1. Read `.claude/work/<feature-slug>/spec-<feature-number>.md` — this is your source of truth for what to build.
2. Read `.claude/work/<feature-slug>/breakdown.md` — for broader context on where this feature sits in the sequence.
3. Re-read the original requirement (path is in the spec header under **Source:**) — to resolve any ambiguity against the human requirement.

Steps for **Mode 2**:
1. Read `.claude/work/<feature-slug>/spec.md` — this is your source of truth for what to build.
2. The **Source:** field will be "inline description" — no additional file to re-read.

Before writing any code:
- If the spec has unresolved Open Questions, stop and ask the user to resolve them first.
- Enter plan mode (call EnterPlanMode). Write your implementation plan to `.claude/work/<feature-slug>/plan.md` (co-located with the spec, not the global `~/.claude/plans/` path). The plan should cover: files to create/modify, migrations needed, component breakdown, and a verification section. Wait for the user to approve before writing any code.

Implementation rules:
- Follow all conventions in CLAUDE.md.
- Do not refactor or touch code outside the scope of this feature.
- Do not add error handling, fallbacks, or abstractions beyond what the spec requires.
- Never interpolate user input into SQL — always use %s placeholders.
- Migrations are append-only — add a new numbered file, never edit existing ones.

After implementing:
- Run the relevant tests.
- Update the acceptance criteria checkboxes in the spec file to reflect what was completed.
- Report:
  - What was built (files created/modified)
  - Any deviations from the spec and why
  - Any acceptance criteria that could not be met
  - Suggested next step (e.g. "ready for /product-spec my-ticket 3")
