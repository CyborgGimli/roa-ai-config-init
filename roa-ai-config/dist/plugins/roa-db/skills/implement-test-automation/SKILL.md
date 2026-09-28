---
name: implement-test-automation
description: Implement an ROA test-automation task end to end using the existing project architecture, verified ROA framework guidance, project-approved Java patterns, and appropriate validation.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash, Skill, Agent
---

Implement the requested automation work:

```text
$ARGUMENTS
```

You orchestrate; the named agents and skills do the specialist work. Delegate with the `Agent` tool using the exact `subagent_type` given, and pass each agent the task plus every finding gathered so far together with its evidence. Subagents cannot delegate further.

## Procedure

1. Establish the requested behavior, scope, acceptance criteria, and constraints.

2. Unless an approved plan already exists in this conversation, produce one with the `roa-db:plan-test-automation` skill. It runs codebase investigation, the `roa-db:roa-db-architect` architecture skill (which gathers evidence from the database schema and the project `DbQuery` definitions), and the planner. Keep the plan proportional: a one-method change needs a short plan, not a skipped one.

3. Do not start implementing while any fact the plan depends on is `UNVERIFIED` or `BLOCKED`. Report it instead.

4. Launch `subagent_type: roa-db:implementation-engineer` with the approved plan and its evidence. It applies `ai-teacher`, `ai-compass`, and the `roa-db:roa-db-task-profile` skill, implements the smallest complete change, and compiles.

5. Any Java change you make yourself follows the same rules: invoke the `ai-teacher` skill before creating new Java code, and invoke the `ai-compass` skill and read the metadata for every `io.cyborgcode.roa.*` type involved — always, even when the repository already contains a similar example. If `target/pandora/metadata/` is missing, regenerate it as the skill describes before continuing. Never guess ROA APIs.

6. Run the relevant tests with the `roa-db:run-tests` skill. A run in which zero tests executed is not evidence.

7. If relevant tests fail, use the `roa-db:fix-tests` skill. Do not weaken expectations or mask application, environment, data, or contract failures.

8. Validate the completed change with the `roa-db:validate-test-automation` skill. Do not claim completion without its `PASS`.

9. For substantial or risk-sensitive changes, run the `roa-db:review-test-automation` skill before final acceptance.

## Return

Provide:

* what was implemented;
* files and important symbols created or modified;
* existing abstractions and project patterns reused;
* any justified deviation from the plan;
* compilation performed and result;
* tests executed, the executed-test count, and result;
* validation verdict: `PASS`, `FAIL`, or `BLOCKED`;
* remaining blockers, uncertainties, or `UNVERIFIED` facts;
* external application, environment, data, contract, or framework issues discovered.

Do not claim completion until the requested automation is implemented and the required validation evidence is available, or an explicit blocker has been reported.
