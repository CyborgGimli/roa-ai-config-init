---
name: roa-db-guidance
description: On-demand actionable guidance for writing Database tests in ROA repositories - idioms, structure, and the traps that make suites flaky. Loaded when a Database change is being written or reviewed.
user-invocable: false
allowed-tools: Read, Grep, Glob
---

Actionable Database guidance, layered on top of:
- `${CLAUDE_PLUGIN_ROOT}/docs/db-architecture.md`
- the always-on repo rules in `.claude/rules/queries.md`, `.claude/rules/test-data.md`, `.claude/rules/testing.md`

Pairs with the `implementation-engineer` and `adversarial-reviewer` agents.
Read the repo rules first; this skill covers how to apply them, not what they say.

1. Identify the invariant the change is supposed to enforce or exercise.
2. Extend the query abstraction; never inline SQL into the test.
3. Create rows uniquely per run and register their cleanup.
4. Compile, then run the single test before running the suite.

Prefer the pattern already used by the closest existing test. These notes are
reference, not law - never apply a pattern that contradicts working repo code.
