Parse $ARGUMENTS to determine the input mode:

- **Mode 1 — breakdown lookup:** arguments are exactly two tokens where the second token is a number (e.g. `live-chat 3`). The first token is the feature slug and the second is the feature number.
- **Mode 2 — inline description:** arguments are free-form text that describes the feature (not a slug + number pair). Use the text directly as the feature context.

Steps for **Mode 1**:
1. Read `.claude/work/<feature-slug>/breakdown.md` — extract the original requirement from the `<!-- source: ... -->` comment, and find the description for the specified feature number.
2. Re-read the original requirement to have full context of the human requirement.
3. Write the spec to `.claude/work/<feature-slug>/spec-<feature-number>.md`.

Steps for **Mode 2**:
1. Use the provided text as both the feature description and the full context — no file reading required.
2. Derive a kebab-case slug from the feature description (e.g. `typing-indicators`).
3. Write the spec to `.claude/work/<derived-slug>/spec.md`.

---

Spec format:

```markdown
# Spec: <feature title>

> **Source:** <breakdown.md path OR "inline description">

## Problem Statement
What user problem does this solve? Why does it matter?

## User Stories
- As a [role], I want to [action] so that [outcome]
- (Include at least one edge case story)

## Acceptance Criteria
- [ ] Criterion 1 (testable, specific)
- [ ] Criterion 2
- [ ] ...

## UI/UX Notes
- Key screens / states: [list them]
- Empty states, loading states, error states: [describe each]
- Responsive behavior: [mobile / tablet / desktop differences]
- Accessibility: [focus management, ARIA roles, keyboard nav]

## Out of Scope
- [Explicitly list what this feature does NOT include]

## Open Questions
- [Anything that needs a decision before implementation starts]
```

Omit sections that are not applicable (e.g. UI/UX Notes for a purely backend feature).

After saving, display the full spec and ask the user:
- Does this spec look right?
- Are there sections to clarify, add, or remove?
- Are there open questions that need answering before implementation?

Wait for confirmation before the user proceeds to /dev.
