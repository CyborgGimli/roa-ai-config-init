---
name: implement-test-automation
description: Implement an ROA test-automation task end to end using the existing project architecture, verified ROA framework guidance, project-approved Java patterns, and appropriate validation.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash, Skill, Task
---

Implement the requested automation work:

```text
$ARGUMENTS
```

## Procedure

1. Establish the requested behavior, scope, acceptance criteria, and constraints.

2. Inspect the relevant repository context. Use `codebase-investigator` when existing structure, conventions, reusable abstractions, or implementation details are not already clear.

3. Determine the required API or UI architecture before implementation. Use the active plugin guidance and specialist architect where the task requires architectural decisions.

4. Produce or confirm a concrete implementation plan before making substantial changes. Keep the plan proportional to the task and reuse existing project abstractions wherever possible.

5. Implement the smallest complete change through `implementation-engineer`.

6. Before creating new Java code, use the `ai-teacher` skill to inspect relevant project-approved implementation patterns.

7. When exact `io.cyborgcode.roa.*` behavior, construction, methods, annotations, or available options matter, use the `ai-compass` skill rather than guessing.

8. Preserve the complete task-relevant automation lifecycle where applicable:

    * test data;
    * preconditions;
    * authentication;
    * storage;
    * execution;
    * assertions;
    * cleanup;
    * configuration.

9. After meaningful Java implementation changes, compile the affected project. Prefer the Maven wrapper when available and fix compilation failures caused by the change before proceeding.

10. Run the relevant tests required to prove the implemented behavior using the `run-tests` skill.

11. If relevant tests fail, establish the root cause. Use `fix-tests` when the failure is an automation defect. Do not weaken expectations or mask application, environment, data, or contract failures.

12. Validate the completed change using `validate-test-automation`. Do not claim completion without sufficient implementation and execution evidence.

13. For substantial or risk-sensitive changes, use `review-test-automation` before final acceptance.

## Return

Provide:

* what was implemented;
* files and important symbols created or modified;
* existing abstractions and project patterns reused;
* any justified deviation from the plan;
* compilation performed and result;
* tests executed and result;
* validation outcome;
* remaining blockers or uncertainties;
* external application, environment, data, contract, or framework issues discovered.

Do not claim completion until the requested automation is implemented and the required validation evidence is available, or an explicit blocker has been reported.
