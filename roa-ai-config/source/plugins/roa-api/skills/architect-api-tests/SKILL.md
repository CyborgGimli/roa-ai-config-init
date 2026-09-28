---
name: architect-api-tests
description: Design an ROA API automation solution from verified requirements, repository context, authoritative Swagger/OpenAPI contract information, and established ROA architecture without implementing code.
allowed-tools: Read, Glob, Grep, Bash, Skill, Agent
---

Design the requested ROA API automation for:

```text
$ARGUMENTS
```

You orchestrate the design; delegate with the `Agent` tool using the exact `subagent_type` given. Subagents cannot delegate further, so the evidence the architect needs must be collected here first and passed to it.

## Procedure

1. Establish the behavior to automate, scope, acceptance criteria, and known constraints.

2. Ground the design in the actual repository. Unless it is already established in this conversation, launch `subagent_type: ${plugin_name}:codebase-investigator` for the relevant endpoints, models, services, tests, authentication, lifecycle, data, storage, cleanup, and configuration. Treat the tree as the source of truth for what exists; a `CLAUDE.md` statement about which packages, enums, or tests are present or missing may predate earlier tasks.

3. Establish the authoritative application contract for the affected operations: launch `subagent_type: ${plugin_name}:api-contract-investigator`, which reads it through the `swagger` MCP server. Existing endpoint enums, models, and tests are leads to verify, not evidence. If it returns `BLOCKED` or leaves a required fact `UNVERIFIED`, that part of the design is blocked. Do not guess.

4. Launch `subagent_type: ${plugin_name}:api-test-architect` with the requirement, the codebase findings, and the verified contract facts with their evidence. It determines the smallest complete design, including only what the task requires:

    * typed endpoints;
    * request or response models;
    * constants or JSONPaths;
    * authentication integration;
    * test data and preconditions;
    * storage;
    * reusable domain services;
    * cleanup;
    * test scenarios and assertions.

5. Check the design preserves architectural responsibilities:

    * Swagger/OpenAPI defines the application contract;
    * the API Ring owns API interaction;
    * project services own meaningful reusable domain behavior;
    * lifecycle mechanisms own setup and cleanup;
    * tests own the behavior and assertions being verified;
    * supporting setup never performs the API behavior the test exists to prove.

6. For every `io.cyborgcode.roa.*` type the design relies on, invoke the `ai-compass` skill and read its metadata — always, even when the repository already shows a similar usage. Do not infer methods, annotations, options, or extension contracts from names.

7. Reference material for specific concerns lives in the plugin docs; read only the file the design needs: `${CLAUDE_PLUGIN_ROOT}/docs/api-contract-discovery.md`, `api-architecture.md`, `api-endpoints-and-modeling.md`, `api-authentication-and-requests.md`, `api-test-design.md`, `api-examples.md`.

## Return

Return a design (the planner orders it into implementation steps):

* behavior the automation must prove;
* verified contract facts the design depends on, each with its evidence;
* existing project abstractions to reuse;
* required endpoints, models, constants, JSONPaths, services, or other API structures;
* authentication, lifecycle, test-data, storage, and cleanup design;
* intended test scenarios and meaningful assertions;
* files or symbols likely to be created or modified;
* validation requirements;
* `UNVERIFIED` facts, risks, blockers, inconsistencies, or unresolved decisions;
* when the design introduces a new top-level package or module, a note that `/roa-base:update` refreshes repository memory once it lands.

Do not implement code. Do not invent application contract details or ROA framework behavior.
