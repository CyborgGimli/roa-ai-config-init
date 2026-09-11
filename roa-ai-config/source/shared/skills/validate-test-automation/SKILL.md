---
name: validate-test-automation
description: Independently verify that an ROA automation change is complete, correct, executable, aligned with the task, and supported by sufficient validation evidence.
allowed-tools: Read, Glob, Grep, Bash, Skill, Task
---

Validate the completed automation work for:

```text
$ARGUMENTS
```

## Procedure

1. Start from the task requirements, implemented changes, available investigation or architecture findings, and prior execution evidence.

2. Inspect the relevant implementation and verify that it follows existing project structure, ROA conventions, and established abstractions.

3. Confirm that the automation proves the intended behavior with meaningful assertions rather than superficial success indicators.

4. Verify the complete task-relevant lifecycle where applicable:

    * test data;
    * preconditions;
    * authentication;
    * storage;
    * execution;
    * assertions;
    * cleanup;
    * configuration.

5. When exact `io.cyborgcode.roa.*` behavior affects validation and cannot be established from the repository, use the `ai-compass` skill rather than assuming the implementation is correct.

6. Confirm that relevant Java changes compile.

7. Confirm that the appropriate test scope was actually executed. Run targeted tests when additional execution evidence is required.

8. Investigate failing validation evidence rather than assuming every failure is an automation defect. Distinguish:

    * automation defects;
    * application defects;
    * environment failures;
    * data or precondition problems;
    * contract changes;
    * configuration problems;
    * framework issues.

9. Do not approve work that achieves green results by:

    * skipping tests;
    * weakening assertions;
    * deleting meaningful coverage;
    * masking failures;
    * introducing brittle workarounds;
    * bypassing established ROA or project conventions.

10. Delegate independent verification to `validator` when a separate validation pass is useful for the scope or risk of the change.

## Return

Provide:

* PASS, FAIL, or BLOCKED;
* requirements and behaviors verified;
* compilation evidence;
* tests executed and results;
* missing, weak, or incorrect validation;
* ROA or project-convention violations;
* relevant state, cleanup, determinism, or maintainability concerns;
* external application, environment, contract, data, configuration, or framework issues;
* smallest remaining changes or evidence required for completion.

Do not approve the work without sufficient evidence.
