---
name: ui-task-profile
description: Provides the mandatory ROA UI implementation profile for automation tasks.
user-invocable: false
allowed-tools: Read, Grep, Glob, Bash, Skill
---

# UI Task Profile

Apply this profile when implementing ROA UI automation.

## Requirements

1. Start from the required user behavior and preserve that behavior throughout implementation.

2. Inspect the repository and reuse established project abstractions before creating anything new.

3. Use the ROA UI Ring and established `AppUiService` / project UI abstractions for browser interaction.

4. Do not introduce direct Selenium/WebDriver interaction when the existing ROA architecture already provides the required capability.

5. Never guess application-specific facts.

   DOM structure, locators, component behavior, synchronization conditions, tables, network traffic, and browser/session behavior must come from actual application/DevTools evidence gathered through the project MCP tools (`chrome-devtools`, `browser`, `selenium`), normally by the `roa-ui:ui-application-investigator` agent. A fact without that evidence is `UNVERIFIED`; do not implement against it.

6. Use typed element definitions rather than raw selectors in tests.

7. Keep responsibilities separated:
    - element definition → application-specific locator/configuration;
    - component type → component classification;
    - component implementation → reusable interaction behavior;
    - test/domain flow → scenario behavior;
    - lifecycle mechanisms → setup, authentication, data, and cleanup.

8. Reuse existing component types and implementations before creating new ones.

9. Synchronize against observable application state using established ROA mechanisms.

   Do not use arbitrary sleeps or inflate waits merely to make a test pass.

10. Use model-driven insertion only when structured reusable data entry benefits from it. Do not force trivial interactions into insertion abstractions.

11. Use established authentication/session support when authentication is infrastructure.

    If authentication is the behavior under test, exercise it directly.

12. Use typed table abstractions for meaningful tabular interaction and avoid brittle positional assumptions unless ordering itself is under test.

13. Use network interception only when it materially supports the scenario.

    Intercepted backend evidence must not replace required UI validation.

14. Use controlled test data and established Quest lifecycle, storage, Journey, `Late<T>`, and cleanup mechanisms where applicable.

15. Supporting API or DB operations may prepare prerequisites or independently verify state, but must not replace the UI action under test.

16. Assertions must prove meaningful user-facing or business behavior.

    Successful interaction, element presence, or absence of exceptions is not sufficient when stronger evidence is required.

    Assert the outcome the requirement names and no more. Validate text in the element that renders it (`validate().validateTextInField(<tag>, text)`), not in `body`; do not add a typed element only to assert a one-off message.

17. Keep the test shape: name the method `<subject>_<action>_<expectedOutcome>` (never `testScenario_N`, even beside numbered siblings); annotate with `@Test`, one matching suite marker, and a one-phrase `@Description`; keep single-use literals as local variables and derive expectations from inputs; promote to the shared test-data class only what several tests use. Name a new element constant the way the sibling constants for the same page or id prefix are named, and add the nested `Data` string mirror only when the enum already has one and the constant will be referenced from an annotation.

18. Keep tests isolated and independently executable where practical. Avoid shared mutable browser state, stale sessions, uncontrolled data, and accidental test-order dependencies.

19. Before planning or creating any new Java code, invoke the `ai-teacher` skill and apply the relevant project-approved lessons — always, even when a similar class already exists in the repository. If `target/pandora/ai-teacher/` is missing, follow the skill’s generation-and-fallback steps. Apply only the lessons that are relevant.

20. Before planning, writing, or changing any code that uses an `io.cyborgcode.roa.*` type, invoke the `ai-compass` skill and read the metadata for every ROA type involved — always, even when the repository already contains a similar example. If `target/pandora/metadata/` is missing, regenerate it as the skill describes before continuing. Never guess ROA APIs.

    Do not invent methods, annotations, options, constructors, or extension contracts.

21. If required repository, application, or framework evidence is insufficient, report the uncertainty or blocker instead of fabricating a solution.

## Reference

For depth on one concern, read only the matching plugin doc: `${CLAUDE_PLUGIN_ROOT}/docs/ui-component-model.md` (component types and implementations), `ui-elements-and-synchronization.md`, `ui-data-insertion.md`, `ui-tables.md`, `ui-network-interception.md`, `ui-authentication-and-session.md`, `ui-test-design.md`, `ui-examples.md`. Framework-wide concepts: `roa-core-architecture.md`, `roa-test-lifecycle.md`, `roa-data-and-storage.md`, `roa-custom-services-and-rings.md`.

## Implementation Standard

Prefer the smallest cohesive change that:

- follows existing project architecture;
- reuses established abstractions;
- accurately represents the current application;
- preserves test intent;
- remains deterministic;
- provides meaningful validation;
- avoids unrelated refactoring.