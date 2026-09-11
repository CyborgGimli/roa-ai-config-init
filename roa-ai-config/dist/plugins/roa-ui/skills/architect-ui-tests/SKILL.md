---
name: architect-ui-tests
description: Designs a complete ROA UI automation solution for a requested task using verified application evidence, repository context, and established ROA architecture without modifying code.
allowed-tools: Read, Grep, Glob, Bash, Skill, Task
---

# Architect UI Tests

Design the ROA UI automation solution for:

`$ARGUMENTS`

## Procedure

1. Establish the required user behavior and expected outcome.

2. Investigate the existing repository before proposing changes. Reuse current:
    - UI services;
    - component types and implementations;
    - typed elements;
    - synchronization;
    - insertion models;
    - authentication;
    - tables;
    - interception;
    - Journeys and test data;
    - domain services;
    - cleanup;
    - related tests.

3. When the design depends on actual application details, delegate focused discovery to `ui-application-investigator`.

   Require verified evidence for relevant:
    - DOM structure;
    - locators;
    - component behavior;
    - dynamic state;
    - synchronization conditions;
    - forms;
    - tables;
    - browser/session behavior;
    - network traffic.

   If required application evidence cannot be obtained, treat that part of the design as blocked rather than guessing.

4. Delegate UI solution design to `ui-test-architect`, providing the requirement, repository findings, and verified application findings.

5. Design the smallest complete solution that preserves the behavior under test. Determine only the required:
    - files and symbols;
    - element definitions;
    - component abstractions;
    - synchronization;
    - test data;
    - lifecycle setup;
    - authentication;
    - insertion;
    - tables;
    - interception;
    - domain services;
    - cleanup;
    - tests and assertions.

6. Keep architectural responsibilities separated:
    - actual application / DevTools → application truth;
    - repository → existing project architecture and conventions;
    - ROA UI abstractions → browser interaction;
    - Pandora → exact ROA framework usage;
    - AI Teacher → project-approved Java implementation patterns.

7. If the design depends on uncertain `io.cyborgcode.roa.*` behavior, use `ai-compass`. Do not infer methods, annotations, options, or extension contracts from names.

8. Ensure supporting setup does not perform the UI behavior under test. Other Rings, authentication, Journeys, insertion, or interception may prepare or support the scenario only when appropriate.

9. Define meaningful assertions that prove the requested user-facing or business outcome.

10. Include a proportional validation plan covering the implementation and the behavior that must be demonstrated.

## Output

Return an implementation-ready plan containing:

- behavior to prove;
- verified application facts;
- existing abstractions to reuse or extend;
- files and symbols to modify or create;
- ordered implementation steps;
- element/component/synchronization design;
- lifecycle, data, authentication, storage, and cleanup design;
- test scenarios and meaningful assertions;
- required Pandora lookups;
- validation steps;
- risks, blockers, and unresolved facts.

Do not modify code.

Do not invent application behavior, locators, or ROA framework contracts.