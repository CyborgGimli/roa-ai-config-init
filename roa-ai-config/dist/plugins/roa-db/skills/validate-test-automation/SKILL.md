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

2. Apply the `validation-policy` skill's evidence requirements throughout this check, and apply the active plugin's validation-profile skill (for example `ui-validation-profile`, `api-validation-profile`, or `roa-db-validation-profile`) for domain-specific verification. Check the plugin's own skill listing for the exact name — plugins name these differently.

3. Inspect the relevant implementation and verify that it follows existing project structure, ROA conventions, and established abstractions.

4. Confirm that the automation proves the intended behavior with meaningful assertions rather than superficial success indicators.

5. Verify the complete task-relevant lifecycle where applicable:

    * test data;
    * preconditions;
    * authentication;
    * storage;
    * execution;
    * assertions;
    * cleanup;
    * configuration.

6. Before planning, writing, changing, or reviewing any code that uses an `io.cyborgcode.roa.*` type, invoke the `ai-compass` skill and read the metadata for every ROA type involved — always, even when the repository already contains a similar example. Do not infer framework contracts from names or from other repository code.

7. Confirm that relevant Java changes compile.

8. Confirm that the appropriate test scope was actually executed. Run targeted tests when additional execution evidence is required.

9. Investigate failing validation evidence rather than assuming every failure is an automation defect. Distinguish:

    * automation defects;
    * application defects;
    * environment failures;
    * data or precondition problems;
    * contract changes;
    * configuration problems;
    * framework issues.

10. Do not approve work that achieves green results by:

    * skipping tests;
    * weakening assertions;
    * deleting meaningful coverage;
    * masking failures;
    * introducing brittle workarounds;
    * bypassing established ROA or project conventions.

11. Delegate independent verification to `validator` when a separate validation pass is useful for the scope or risk of the change.

12. Before returning a result, apply the `definition-of-done` skill to confirm the completion state is justified rather than assumed.

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
