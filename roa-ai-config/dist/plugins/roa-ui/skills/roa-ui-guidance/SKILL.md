---
name: roa-ui-guidance
description: On-demand actionable guidance for writing UI tests in ROA repositories - idioms, structure, and the traps that make suites flaky. Loaded when a UI change is being written or reviewed.
user-invocable: false
allowed-tools: Read, Grep, Glob
---

Actionable UI guidance, layered on top of:
- `${CLAUDE_PLUGIN_ROOT}/docs/architecture.md`
- the always-on repo rules in `.claude/rules/three-layer.md`, `.claude/rules/locators.md`, `.claude/rules/waits.md`, `.claude/rules/testing.md`

Pairs with the `implementation-engineer` and `adversarial-reviewer` agents.
Read the repo rules first; this skill covers how to apply them, not what they say.

1. Identify the surface under test and the components that already cover it.
2. Add or extend element locators, then the component action, then the test.
3. Create data through a `DataCreator`; register the matching `DataCleaner`.
4. Compile, then run the single test before running the suite.

Prefer the pattern already used by the closest existing test. These notes are
reference, not law - never apply a pattern that contradicts working repo code.
