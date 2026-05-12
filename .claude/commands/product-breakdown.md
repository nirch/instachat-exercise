The product requirement: $ARGUMENTS

Break it down into a sequential list of small, independently testable features that a developer can implement one at a time. Each feature should build on the previous ones.

Don't force breaking down into features if it doesn't make sense — if the requirement is already small and focused, just return one feature. But if there are multiple steps or components, break it down into a clear sequence of features that can be implemented and tested independently.

Rules:
- Order matters — later features may depend on earlier ones
- Each feature should be completable in a single focused dev session
- Each feature must have a clear "done" state (independently testable)
- If a feature still feels large, split it further
- Short descriptions only — this is not a spec

Derive a short slug from the requirement (lowercase, hyphens, no spaces) and save the output to `.claude/work/<feature-slug>/breakdown.md`, creating the directory if needed.

Output format:

```markdown
# Features: <feature-slug>

<!-- source: original requirement or link -->

## Feature 1: <title>
<1-2 sentences: what gets built and how you know it's done>

## Feature 2: <title>
<1-2 sentences: what gets built and how you know it's done>
...
```

After saving, display the full list and ask the user:
- Does the breakdown look right?
- Are there features to add, remove, or reorder?

Wait for confirmation before the user proceeds to /product-spec.
