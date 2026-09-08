---
name: fix-tests
description: Repair failing ROA tests once the cause is known. Use after debug has identified the failure.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

Fix the cause you identified, not the symptom.

- A wrong assertion gets a correct assertion, not a relaxed one.
- A race gets a wait on the real condition, never a sleep. Where the delay is
  genuine eventual consistency, that is `retryUntil` with the smallest window
  the behaviour needs.
- A data collision gets isolated test data, not a retry.
- A genuinely changed requirement gets an updated test - say that the
  requirement changed.

If a test is failing because the product is broken, say so and stop. Do not
adjust the test to make a real defect disappear.

Re-run and report evidence when finished.
