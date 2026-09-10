---
name: roa-api-guidance
description: On-demand actionable guidance for writing API tests in ROA repositories - idioms, structure, and the traps that make suites flaky. Loaded when an API change is being written or reviewed.
user-invocable: false
allowed-tools: Read, Grep, Glob
---

Actionable API guidance, layered on top of:
- `${CLAUDE_PLUGIN_ROOT}/docs/api-architecture.md`
- the always-on repo rules in `.claude/rules/contracts.md`, `.claude/rules/assertions.md`, `.claude/rules/testing.md`

Pairs with the `implementation-engineer` and `adversarial-reviewer` agents.
Read the repo rules first; this skill covers how to apply them, not what they say.

1. Confirm the contract: path, method, request and response shape, error cases.
2. Add the endpoint constant, then any missing constants and JSONPaths, then DTOs.
3. Write the test against `quest.use(RING_OF_API)` - never a raw HTTP client.
4. Assert status and payload, including the error paths.
5. Clean up what the test creates, via `@Ripper`.
6. Compile, then run the single test before running the suite.

Prefer the pattern already used by the closest existing test. These notes are
reference, not law - never apply a pattern that contradicts working repo code.
