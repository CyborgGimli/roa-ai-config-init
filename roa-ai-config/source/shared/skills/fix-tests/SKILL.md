---
name: fix-tests
description: Diagnose and fix failing ROA automation tests, then rerun the relevant scope until the automation passes or a justified external blocker is established.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash, Skill, Task
---

Fix the failing automation for:

```text
$ARGUMENTS
```

## Procedure

1. Run or inspect the failing test and capture the actual failure evidence.

2. Use `debug-test-automation` to establish the root cause before modifying code.

3. If the failure is an automation defect, implement the smallest justified correction.

4. Reuse existing project abstractions and conventions. Do not introduce unnecessary workarounds or unrelated refactoring.

5. Before creating new Java code, use the `ai-teacher` skill for relevant project-approved implementation patterns.

6. When exact `io.cyborgcode.roa.*` behavior affects the fix, use the `ai-compass` skill rather than guessing.

7. Do not fix a test by:

    * weakening assertions;
    * deleting meaningful coverage;
    * skipping or disabling tests;
    * changing correct expected behavior;
    * adding arbitrary waits;
    * hardcoding unstable values;
    * masking application, environment, data, or contract failures.

8. Compile after meaningful Java changes and resolve compilation failures caused by the fix.

9. Rerun the relevant test scope using `run-tests`.

10. Repeat diagnosis, correction, and rerun only while evidence supports an automation defect.

11. If the remaining failure belongs to the application, environment, data, contract, configuration, or another external dependency, stop and report it rather than modifying correct automation.

## Return

Provide:

* original failure;
* established root cause;
* files and symbols changed;
* correction applied;
* compilation result;
* tests rerun and result;
* final PASS, FAIL, or BLOCKED status;
* any remaining external issue or uncertainty.

Do not claim the issue is fixed until the relevant tests pass or a justified blocker has been established.
