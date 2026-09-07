---
name: debug
description: Diagnose a failing or flaky ROA test - isolate the cause and classify it before changing anything.
allowed-tools: Read, Glob, Grep, Bash
---

Diagnose before you change anything.

1. Reproduce it. Run the single failing test and capture the real error.
2. Re-run it. A test that passes on re-run without a code change is flaky -
   say so rather than "fixing" it.
3. Localize: is the failure in the test, the component, the locator, the data,
   or the environment?
4. Read the log at `logs/roa.log` (surfaced via `ROA_LOG_FILE`).
5. State the cause with evidence before proposing a fix.

Never fix a flaky test by adding a sleep. That hides the race; it does not
remove it. Find the condition that should be waited on.
