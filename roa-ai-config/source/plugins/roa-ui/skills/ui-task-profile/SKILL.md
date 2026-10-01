---
name: ui-task-profile
description: Provides the mandatory ROA UI implementation profile for automation tasks.
user-invocable: false
allowed-tools: Read, Grep, Glob, Bash, Skill
---

# UI Task Profile

Apply this profile when implementing ROA UI automation. The binding rules are the ones in `.claude/rules/` — `roa-engineering.md`, `test-automation.md`, `validation.md`, `ui-architecture.md`, `ui-elements.md`, `ui-synchronization.md`, `ui-testing.md`. This profile adds the order of work.

## Procedure

1. State the user behavior the test proves and the outcome it asserts.

2. Gather application evidence through the MCP browser tools (`chrome-devtools`, `browser`, `selenium`), normally via the `roa-ui:ui-application-investigator` agent:
   - for every control the task touches: tag and type, a stable locator, where it keeps its state (property, class, or `aria-*` attribute), and its readiness condition;
   - for every asserted outcome: the element that renders it and its tag.

   A fact without that evidence is `UNVERIFIED`; do not implement against it.

3. Map each control to the repository. Reuse an element constant when it is the same control, and a component type and implementation only when they handle the same kind of control (`ui-elements.md`).

4. Load `ai-compass` for every `io.cyborgcode.roa.*` type involved and `ai-teacher` before creating a class.

5. Implement in layer order, skipping what already exists: component type → component implementation → UI service method → element constants (with their `Data` mirror where the enum has one) → insertion model → test.

6. Compile, run the test, and report as `validation.md` requires.

## Reference

For depth on one concern, read only the matching plugin doc: `${CLAUDE_PLUGIN_ROOT}/docs/ui-component-model.md` (component types and implementations), `ui-elements-and-synchronization.md`, `ui-data-insertion.md`, `ui-tables.md`, `ui-network-interception.md`, `ui-authentication-and-session.md`, `ui-test-design.md`, `ui-examples.md` (worked examples). Framework-wide concepts: `roa-core-architecture.md`, `roa-test-lifecycle.md`, `roa-data-and-storage.md`, `roa-custom-services-and-rings.md`.
