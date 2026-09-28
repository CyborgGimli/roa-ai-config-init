---
name: architect-ui-tests
description: Designs a complete ROA UI automation solution for a requested task using verified application evidence, repository context, and established ROA architecture without modifying code.
allowed-tools: Read, Grep, Glob, Bash, Skill, Agent
---

# Architect UI Tests

Design the ROA UI automation solution for:

`$ARGUMENTS`

You orchestrate the design; delegate with the `Agent` tool using the exact `subagent_type` given. Subagents cannot delegate further, so the evidence the architect needs must be collected here first and passed to it.

## Procedure

1. Establish the required user behavior and expected outcome.

2. Establish the existing repository context. Unless it is already established in this conversation, launch `subagent_type: roa-ui:codebase-investigator` to find the UI services, component types and implementations, typed elements, synchronization, insertion models, authentication, tables, interception, Journeys and test data, domain services, cleanup, and related tests to reuse. Treat the tree as the source of truth for what exists; a `CLAUDE.md` statement about which packages, enums, or tests are present or missing may predate earlier tasks.

3. Whenever the design depends on the live application — DOM structure, locators, component behavior, dynamic state, synchronization conditions, forms, tables, browser/session behavior, or network traffic — launch `subagent_type: roa-ui:ui-application-investigator`. It inspects the running application through the `chrome-devtools`, `browser`, or `selenium` MCP tools. Repository element definitions, `app-knowledge` files, and earlier conversations are leads to verify, not evidence.

   If the investigator returns `BLOCKED` or leaves a required fact `UNVERIFIED`, that part of the design is blocked. Do not guess.

4. Launch `subagent_type: roa-ui:ui-test-architect` with the requirement, the codebase findings, and the investigator's verified findings with their evidence. It designs the smallest complete solution that preserves the behavior under test. Do not design in parallel with it.

5. Check the design against these responsibilities before returning it:
    - actual application / MCP DevTools evidence → application truth;
    - repository → existing project architecture and conventions;
    - ROA UI abstractions → browser interaction;
    - Pandora (`ai-compass`) → exact ROA framework usage;
    - AI Teacher (`ai-teacher`) → project-approved Java implementation patterns;
    - supporting setup (other Rings, authentication, Journeys, insertion, interception) never performs the UI behavior under test.

6. For every `io.cyborgcode.roa.*` type the design relies on, invoke `ai-compass` and read its metadata — always, even when the repository already shows a similar usage. Do not infer methods, annotations, options, or extension contracts from names.

7. Reference material for specific concerns lives in the plugin docs; read only the file the design needs: `${CLAUDE_PLUGIN_ROOT}/docs/ui-application-discovery.md`, `ui-component-model.md`, `ui-elements-and-synchronization.md`, `ui-data-insertion.md`, `ui-tables.md`, `ui-network-interception.md`, `ui-authentication-and-session.md`, `ui-test-design.md`, `ui-examples.md`.

## Output

Return a design (the planner orders it into implementation steps):

- behavior to prove;
- verified application facts, each with its MCP evidence;
- existing abstractions to reuse or extend;
- files and symbols to modify or create, and anything a sibling pattern would tempt you to add that is deliberately left out;
- element/component/synchronization design;
- lifecycle, data, authentication, storage, and cleanup design;
- test scenarios and meaningful assertions;
- required Pandora lookups;
- validation required to demonstrate the behavior;
- `UNVERIFIED` facts, risks, blockers, and unresolved decisions;
- when the design introduces a new top-level package or module, a note that `/roa-base:update` refreshes repository memory once it lands.

Do not modify code.

Do not invent application behavior, locators, or ROA framework contracts.
