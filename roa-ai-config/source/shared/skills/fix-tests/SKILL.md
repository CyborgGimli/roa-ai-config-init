---
name: fix-tests
description: Diagnose and fix failing ROA automation tests, then rerun the relevant scope until the automation passes or a justified external blocker is established.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash, Skill, Agent
---

Fix the failing automation for:

```text
$ARGUMENTS
```

## Procedure

1. Establish the root cause with the `${plugin_name}:debug-test-automation` skill before modifying code. Do not edit on a hypothesis.

2. If the root cause is not an automation defect, stop and report it. Correct automation must not be changed to match an application, environment, data, contract, or configuration failure.

3. For an automation defect, implement the smallest justified correction. Reuse existing project abstractions and conventions; no unrelated refactoring or workarounds.

4. Before planning or creating any new Java code, invoke the `ai-teacher` skill and apply the relevant project-approved lessons — always, even when a similar class already exists in the repository. If `target/pandora/ai-teacher/` is missing, follow the skill's generation-and-fallback steps.

5. Before planning, writing, or changing any code that uses an `io.cyborgcode.roa.*` type, invoke the `ai-compass` skill and read the metadata for every ROA type involved — always, even when the repository already contains a similar example. If `target/pandora/metadata/` is missing, regenerate it as the skill describes before continuing. Never guess ROA APIs.

6. Do not fix a test by:

    * weakening assertions;
    * deleting meaningful coverage;
    * skipping or disabling tests (`@Disabled`, `skipTests`, `failIfNoSpecifiedTests=false`, or equivalent);
    * changing correct expected behavior;
    * adding arbitrary waits;
    * hardcoding unstable values;
    * masking application, environment, data, or contract failures.

7. Compile after meaningful Java changes and resolve compilation failures caused by the fix.

8. Rerun the relevant test scope with the `${plugin_name}:run-tests` skill. Zero executed tests is not a pass.

9. Repeat diagnosis, correction, and rerun only while evidence supports an automation defect.

## Return

Provide:

* original failure;
* established root cause and its evidence;
* files and symbols changed;
* correction applied;
* compilation result;
* tests rerun, the executed-test count, and result;
* final `PASS`, `FAIL`, or `BLOCKED` status;
* any remaining external issue or uncertainty.

Do not claim the issue is fixed until the relevant tests pass or a justified blocker has been established.
