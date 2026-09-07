---
name: roa-api-guidance
description: On-demand actionable guidance for writing API tests in ROA repositories - idioms, structure, and the traps that make suites flaky. Loaded when a API change is being written or reviewed.
user-invocable: false
allowed-tools: Read, Grep, Glob
---

Actionable API guidance, layered on top of:
- `${CLAUDE_PLUGIN_ROOT}/docs/architecture.md`
- the always-on repo rules in `.claude/rules/contracts.md`, `.claude/rules/assertions.md`, `.claude/rules/testing.md`

Pairs with the `implementation-engineer` and `adversarial-reviewer` agents.
Read the repo rules first; this skill covers how to apply them, not what they say.

1. Confirm the contract: path, method, request and response shape, error cases.
2. Extend the service wrapper first, then write the test against it.
3. Assert status and payload, including the error paths.
4. Compile, then run the single test before running the suite.

Prefer the pattern already used by the closest existing test. These notes are
reference, not law - never apply a pattern that contradicts working repo code.
