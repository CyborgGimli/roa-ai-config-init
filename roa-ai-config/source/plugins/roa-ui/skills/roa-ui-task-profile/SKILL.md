---
name: roa-ui-task-profile
description: The UI "flavour" for the generic ROA workflows - which stack, rules, guidance, and agents apply, and the standard task sequence. Loaded by plan-task and implement-task.
user-invocable: false
allowed-tools: Read, Grep, Glob
---

This hidden skill injects UI specifics into the shared, stack-agnostic
workflow skills so those workflows are not duplicated per stack.

- **Stack**: Java, Maven, JUnit, Selenium via ROA `SmartWebDriver`; three-layer components.
- **Reference layers**: always-on repo rules in `.claude/rules/three-layer.md`, `.claude/rules/locators.md`, `.claude/rules/waits.md`, `.claude/rules/testing.md` and
  `.claude/rules/roa-ui.md`; deep reference in `${CLAUDE_PLUGIN_ROOT}/docs/`;
  on-demand actionable guidance via `roa-ui-guidance`.
- **Which agents to use**: `adversarial-reviewer`, `implementation-engineer`, `validator`.
- **Standard task sequence**:

1. Identify the surface under test and the components that already cover it.
2. Add or extend element locators, then the component action, then the test.
3. Create data through a `DataCreator`; register the matching `DataCleaner`.
4. Compile, then run the single test before running the suite.

- **Framework contract**: when a ROA signature is unclear or code does not compile,
  load `roa-pandora-metadata` and read `target/pandora/metadata/` before guessing.
- **Done** means `roa-ui-definition-of-done` is met, not merely that it compiles.
