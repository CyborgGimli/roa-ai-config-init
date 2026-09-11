---
name: definition-of-done
description: Determine whether an ROA automation task has sufficient implementation and validation evidence to be considered complete.
user-invocable: false
allowed-tools: Read, Glob, Grep, Bash, Skill, Task
---

Evaluate whether the current automation task is genuinely complete.

## Criteria

A task is done only when all applicable conditions are satisfied:

1. The requested behavior and acceptance criteria are implemented.

2. The implementation follows the existing repository structure, ROA architecture, and established project abstractions.

3. Required lifecycle concerns are handled where applicable:
   - test data;
   - preconditions;
   - authentication;
   - storage;
   - execution;
   - assertions;
   - cleanup;
   - configuration.

4. Assertions meaningfully prove the intended behavior.

5. Relevant Java changes compile successfully.

6. The appropriate test scope has been executed successfully when runtime execution is required to prove the change.

7. Failures have not been hidden through skipped tests, weakened assertions, deleted coverage, suppressed errors, or brittle workarounds.

8. Any remaining application, environment, data, contract, configuration, or framework issue is explicitly identified and does not invalidate the claimed automation result.

9. No known blocker, unresolved correctness issue, or required validation remains.

## Result

Return exactly one completion state:

```text
DONE
→ all applicable completion criteria are satisfied

NOT_DONE
→ implementation or required validation is incomplete or incorrect

BLOCKED
→ completion cannot currently be established because of a verified external blocker
```

Include the smallest set of missing actions or evidence when the result is `NOT_DONE` or `BLOCKED`.

Do not declare `DONE` based only on code inspection when compilation or test execution is required to prove the task.
