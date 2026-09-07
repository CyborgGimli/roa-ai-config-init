---
name: flaky-triage
description: Decide whether a test is genuinely flaky and what to do about it - re-run evidence, root-cause classification, and the quarantine rules. Use when a test failed once and passed on re-run, or when a suite has intermittent failures.
allowed-tools: Read, Glob, Grep, Bash
---

"Flaky" is a conclusion, not a first guess. It needs evidence, and it names a defect
in the test that still has to be fixed.

## Establishing flakiness

1. Re-run the single test unchanged: `mvn test -Dtest=TheTest#theMethod`.
2. Run it several times. One pass after one fail is not evidence — the same input
   producing different verdicts across repeated runs is.
3. Record how many runs passed and how many failed. That ratio goes in the report.

If it fails every time, it is not flaky. Go to `debug`.

## Classifying the cause

Name one. "Flaky" on its own is not a cause.

| Cause | What it looks like | The fix |
| --- | --- | --- |
| **Race** | passes when the machine is slow, fails when fast (or the reverse) | wait on the state change you depend on |
| **Shared data** | fails only when another test ran first, or in parallel | unique data per run; a `DataCleaner` that runs on the failure path |
| **Order dependence** | passes alone, fails in the suite | remove the dependency; do not serialise the class to hide it |
| **Eventual consistency** | the assertion is right but not yet true | `retryUntil` with the smallest window that works |
| **Environment** | fails only on CI, or only against one instance | fix the environment; say plainly that the test is not at fault |
| **Non-determinism in the assertion** | ids, timestamps, ordering, locale | normalise before asserting, or assert containment |

## What is not a fix

- Widening a timeout until it passes. That hides the race and makes every run slower.
- Wrapping the assertion in a retry when it should hold immediately.
- Adding `Thread.sleep`.
- Deleting the assertion that fails.
- `@Disabled` with no ticket and no owner.

## Quarantine

Only when the cause is known and the fix cannot land now:

1. Tag it out of the blocking suite — do not delete it.
2. Record the cause, the re-run ratio, and the owner in the same change.
3. Say in the report that coverage is currently reduced and what is unverified.

A quarantined test with no recorded cause becomes permanent. Treat the note as part
of the change, not paperwork.

## Reporting

State the re-run counts, the classified cause with the evidence for it, the fix
applied, and a fresh re-run showing it holds. If the product is at fault, say so and
stop — do not adjust the test to make a real defect disappear.
