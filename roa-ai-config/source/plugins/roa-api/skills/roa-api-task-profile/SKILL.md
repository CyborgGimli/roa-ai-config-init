---
name: roa-api-task-profile
description: The API "flavour" for the generic ROA workflows - which stack, rules, guidance, and agents apply, and the standard task sequence. Loaded by plan-task and implement-task.
user-invocable: false
allowed-tools: Read, Grep, Glob
---

This hidden skill injects API specifics into the shared, stack-agnostic
workflow skills so those workflows are not duplicated per stack.

- **Stack**: Java, Maven, JUnit; ROA fluent service layer over REST.
- **Reference layers**: always-on repo rules in `.claude/rules/contracts.md`, `.claude/rules/assertions.md`, `.claude/rules/testing.md` and
  `.claude/rules/roa-api.md`; deep reference in `${CLAUDE_PLUGIN_ROOT}/docs/`;
  on-demand actionable guidance via `roa-api-guidance`.
- **Which agents to use**: `adversarial-reviewer`, `implementation-engineer`, `validator`.
- **Standard task sequence**:

1. Confirm the contract: path, method, request and response shape, error cases.
2. Extend the service wrapper first, then write the test against it.
3. Assert status and payload, including the error paths.
4. Compile, then run the single test before running the suite.

- **Framework contract**: when a ROA signature is unclear or code does not compile,
  load `roa-pandora-metadata` and read `target/pandora/metadata/` before guessing.
- **Done** means `roa-api-definition-of-done` is met, not merely that it compiles.
