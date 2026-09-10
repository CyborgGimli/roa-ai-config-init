---
name: run-tests
description: Execute the narrowest ROA test scope that proves a change and report the result verbatim. Use when tests need to actually run, rather than be reasoned about.
allowed-tools: Read, Glob, Grep, Bash
---

Run the tests for:

```text
$ARGUMENTS
```

This skill executes and reports. It does not diagnose failures (`debug`), fix
them (`fix-tests`), or judge whether the change is complete (`validate-code`).

## Procedure

1. Pick the narrowest scope that still proves the requested behaviour. A new test
   class means that class, not the module; a change to a shared component means
   the tests that exercise it. Reserve a full-suite run for a change to shared
   framework behaviour, or when the task asked for one.

2. Read the repository's build setup before choosing a command — the Maven
   profile, the surefire/failsafe split, and any required system properties. Do
   not assume a plain `mvn test` is how this project runs its tests.

3. Prefer the repository's Maven wrapper when it exists: `./mvnw` on Unix,
   `.\mvnw.cmd` on Windows. Fall back to `mvn` only when there is no wrapper.

4. Never pass `-DskipTests`, `-Dmaven.test.skip`, or `-DskipITs`. The Maven guard
   hook blocks these, and a build that skipped its tests is not evidence.

5. Run the command and capture what actually happened: the command line, the
   tests that ran, counts of passed/failed/skipped, the relevant failure output,
   and the build result.

6. When the run fails before any test executes — compilation, missing
   configuration, an unreachable environment, expired credentials — say so
   explicitly. That is a different result from a test that ran and failed, and
   conflating the two sends the next step down the wrong path.

7. Do not edit code, weaken an assertion, or adjust an expectation to obtain a
   green result. If the run fails, hand the evidence back unchanged.

## Report

- The exact command executed.
- The scope that ran.
- `PASS`, `FAIL`, or `BLOCKED`.
- Failing test names with the salient part of each failure — enough to diagnose,
  not the whole log.
- Any environment, configuration, data, or application problem that prevented
  execution.

Never report `PASS` for tests that did not run.
