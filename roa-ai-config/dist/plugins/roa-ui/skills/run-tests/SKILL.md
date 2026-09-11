---
name: run-tests
description: Run the relevant ROA automation tests required to verify a change and report the execution result without modifying test expectations or implementation.
allowed-tools: Read, Glob, Grep, Bash
---

Run the relevant tests for:

```text
$ARGUMENTS
```

## Procedure

1. Identify the narrowest relevant test scope that provides sufficient evidence for the requested behavior or implemented change.

2. Inspect the project build structure and existing Maven conventions before choosing the command.

3. Prefer the project's Maven wrapper when available.

4. Run the targeted test or test set using the project's established Maven configuration, profiles, and required parameters.

5. Do not skip tests or use options such as:

   ```text
   -DskipTests
   -Dmaven.test.skip=true
   ```

6. Capture the actual execution result, including:

    * command executed;
    * tests run;
    * passed, failed, or errored tests;
    * relevant failure output;
    * build result.

7. If execution fails because of compilation, configuration, environment, authentication, data, application behavior, or another external dependency, report that distinction rather than treating every failure as a test defect.

8. Do not modify code, weaken assertions, change expected behavior, or introduce workarounds merely to obtain a passing result.

9. If failures require diagnosis or correction, return the evidence to the caller so the appropriate debugging or fix workflow can continue.

## Return

Provide:

* command executed;
* test scope;
* PASS, FAIL, or BLOCKED result;
* relevant execution evidence;
* failing tests and failure summaries, if any;
* any environment, configuration, data, application, or external blocker identified.

Do not claim tests passed unless they were actually executed successfully.
