---
name: debug-test-automation
description: Diagnose failing ROA automation by identifying the actual root cause and separating automation defects from application, environment, data, contract, configuration, and framework issues.
allowed-tools: Read, Glob, Grep, Bash, Skill, Task
---

Diagnose the failing automation for:

```text
$ARGUMENTS
```

## Procedure

1. Start from the failing test, compilation error, stack trace, assertion failure, or reported behavior.

2. Reproduce or inspect the failure when safe and appropriate. Use actual logs, Maven output, reports, stack traces, and runtime evidence rather than assumptions.

3. Trace the failure through the relevant:

    * test;
    * supporting automation code;
    * configuration;
    * test data and preconditions;
    * authentication or session state;
    * environment;
    * application behavior.

4. Compare the failing implementation with nearby passing tests and established project patterns.

5. Classify the root cause before recommending a fix. Distinguish between:

    * automation implementation defect;
    * incorrect assertion or expectation;
    * test data or precondition problem;
    * authentication or session problem;
    * environment or configuration failure;
    * API contract or application behavior change;
    * UI locator, timing, or synchronization issue;
    * stale or incorrect ROA framework usage;
    * genuine product defect.

6. When exact `io.cyborgcode.roa.*` behavior is relevant and cannot be verified from the repository, use the `ai-compass` skill rather than guessing.

7. Do not treat symptoms as root causes. Trace the failure far enough to justify the conclusion.

8. Do not make tests pass by weakening assertions, deleting coverage, skipping tests, increasing waits blindly, hardcoding unstable values, or masking genuine product failures.

9. Stop when the root cause is sufficiently established or a concrete external blocker prevents further diagnosis.

## Return

Provide:

* observed failure;
* evidence used;
* classified root cause;
* relevant files, symbols, configuration, data, or runtime behavior;
* smallest justified correction when the issue is in automation;
* validation required after correction;
* any external application, environment, contract, data, or framework issue;
* unresolved uncertainty or additional evidence still required.

Do not modify code.
