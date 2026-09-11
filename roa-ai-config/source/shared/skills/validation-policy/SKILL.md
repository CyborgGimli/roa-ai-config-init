---
name: validation-policy
description: Define the minimum validation evidence required for ROA automation changes and prevent unsupported completion claims.
user-invocable: false
allowed-tools: Read, Glob, Grep, Bash, Skill, Task
---

Apply the appropriate validation level to the current automation change.

## Policy

1. Validation must be proportional to the scope and risk of the change.

2. For Java changes, compilation is required before completion can be claimed.

3. Prefer the project's Maven wrapper when available.

4. Use the narrowest command that provides sufficient evidence.

5. Relevant tests must be executed when runtime behavior is required to prove the change.

6. Compilation alone is not sufficient evidence that a test behaves correctly.

7. A full suite or full build is not required when targeted validation provides sufficient evidence, unless:
   - the task explicitly requires it;
   - the change has broad impact;
   - shared framework behavior was modified;
   - targeted validation cannot establish confidence.

8. Never use validation options that skip or suppress required tests, including:

   ```text
   -DskipTests
   -Dmaven.test.skip=true
   ```

9. Validation failures must be investigated and classified before changing automation.

   Distinguish:

    * automation defect;
    * application defect;
    * environment failure;
    * test-data or precondition issue;
    * contract change;
    * configuration problem;
    * framework problem;
    * unrelated or pre-existing failure.

10. Do not obtain a green result by weakening assertions, deleting coverage, disabling tests, masking failures, or introducing unsupported workarounds.

11. Validation evidence must reflect what was actually executed.

12. If required validation cannot be completed, report the task as incomplete or blocked rather than assuming success.

## Evidence

When reporting validation, include:

* command executed;
* validation scope;
* compilation result;
* tests executed;
* test result;
* relevant failures or blockers;
* any validation that remains outstanding.

Do not claim PASS or completion without evidence that satisfies this policy.
