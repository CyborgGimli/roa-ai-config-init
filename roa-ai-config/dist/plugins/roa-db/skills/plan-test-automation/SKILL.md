---
name: plan-test-automation
description: Plan an ROA test-automation change using the actual repository, relevant architecture guidance, and verified framework information without modifying code.
allowed-tools: Read, Glob, Grep, Bash, Skill, Agent
---

Plan the requested automation work:

```text
$ARGUMENTS
```

You orchestrate; the named agents and skills do the specialist work. Delegate with the `Agent` tool using the exact `subagent_type` given, and pass each agent the task plus every finding gathered so far together with its evidence. Subagents cannot delegate further, so any investigation a later step depends on must happen here first.

## Procedure

1. Establish the requested behavior, scope, acceptance criteria, and known constraints.

2. Ground the plan in the actual repository. Unless the relevant implementation, conventions, and reusable abstractions are already established in this conversation, launch `subagent_type: roa-db:codebase-investigator`.

3. Establish the domain architecture by invoking the `roa-db:roa-db-architect` skill and applying the `roa-db:roa-db-task-profile` skill. The architecture skill gathers DB evidence from the database schema and the project `DbQuery` definitions; do not design DB structure yourself.

4. If the architecture result marks any fact it depends on as `UNVERIFIED` or `BLOCKED`, stop and report it. Do not plan around an invented fact.

5. For every `io.cyborgcode.roa.*` type the plan will use, invoke the `ai-compass` skill and read its metadata — always, even when the repository already contains a similar usage. If `target/pandora/metadata/` is missing, regenerate it as the skill describes before continuing.

6. Launch `subagent_type: roa-db:test-automation-planner` with the requirement, the codebase findings, and the architecture design. The planner owns step ordering, file-level scope, and the validation plan; the architect owns the design. Do not re-derive either yourself.

7. Check that the returned plan covers the task-relevant lifecycle (test data, preconditions, authentication, storage, execution, assertions, cleanup, configuration) and a proportional validation plan without unnecessary full-suite runs.

## Return

Provide:

* intended automation outcome;
* existing abstractions and conventions to reuse;
* ordered implementation steps with the files or symbols affected;
* lifecycle, data, authentication, storage, cleanup, or configuration work;
* tests or scenarios to add or update;
* validation plan;
* the evidence behind every application, contract, or framework fact, and anything still `UNVERIFIED`;
* risks, blockers, unresolved decisions, and completion criteria.

Do not modify code.
