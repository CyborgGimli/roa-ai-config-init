---
name: plan-test-automation
description: Plan an ROA test-automation change using the actual repository, relevant architecture guidance, and verified framework information without modifying code.
allowed-tools: Read, Glob, Grep, Bash, Skill, Task
---

Plan the requested automation work:

```text
$ARGUMENTS
```

## Procedure

1. Establish the requested behavior, scope, acceptance criteria, and known constraints.

2. Ground the plan in the actual repository. Delegate focused investigation to `codebase-investigator` when the relevant implementation, conventions, or reusable abstractions are not already clear.

3. Reuse existing project structures before proposing new ones. Identify relevant tests, services, Rings, lifecycle mechanisms, data models, authentication, storage, cleanup, configuration, and domain abstractions only where they affect the task.

4. For API- or UI-specific work, use the appropriate architecture findings and plugin task profile. Do not invent domain architecture that should be established by the relevant specialist.

5. When exact `io.cyborgcode.roa.*` behavior materially affects the plan and is not established by the repository, use the `ai-compass` skill rather than guessing.

6. Define the smallest complete implementation in dependency order. For each step, identify the files or symbols to create, modify, or reuse and the purpose of the change.

7. Include the complete task-relevant automation lifecycle where applicable:

    * test data;
    * preconditions;
    * authentication;
    * storage;
    * execution;
    * assertions;
    * cleanup;
    * configuration.

8. Define validation together with implementation. Include the compilation and relevant test execution required to prove the change, without prescribing unnecessary full-suite validation.

## Return

Provide:

* intended automation outcome;
* existing abstractions and conventions to reuse;
* ordered implementation steps;
* files or symbols affected;
* lifecycle, data, authentication, storage, cleanup, or configuration work;
* tests or scenarios to add or update;
* validation plan;
* risks, blockers, and unresolved decisions;
* completion criteria.

Do not modify code.