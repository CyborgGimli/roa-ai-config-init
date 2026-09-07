---
name: roa-db-task-profile
description: The Database "flavour" for the generic ROA workflows - which stack, rules, guidance, and agents apply, and the standard task sequence. Loaded by plan-task and implement-task.
user-invocable: false
allowed-tools: Read, Grep, Glob
---

This hidden skill injects Database specifics into the shared, stack-agnostic
workflow skills so those workflows are not duplicated per stack.

- **Stack**: Java, Maven, JUnit; ROA query abstractions over SQL.
- **Reference layers**: always-on repo rules in `.claude/rules/queries.md`, `.claude/rules/test-data.md`, `.claude/rules/testing.md` and
  `.claude/rules/roa-db.md`; deep reference in `${CLAUDE_PLUGIN_ROOT}/docs/`;
  on-demand actionable guidance via `roa-db-guidance`.
- **Which agents to use**: `adversarial-reviewer`, `security-reviewer`, `validator`.
- **Standard task sequence**:

1. Identify the invariant the change is supposed to enforce or exercise.
2. Extend the query abstraction; never inline SQL into the test.
3. Create rows uniquely per run and register their cleanup.
4. Compile, then run the single test before running the suite.

- **Framework contract**: when a ROA signature is unclear or code does not compile,
  load `roa-pandora-metadata` and read `target/pandora/metadata/` before guessing.
- **Done** means `roa-db-definition-of-done` is met, not merely that it compiles.
