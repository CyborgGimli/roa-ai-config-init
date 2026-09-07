---
name: validation-policy
description: The definition of adequate validation evidence for ROA work. Reference when deciding whether a change has been proven, not merely written.
user-invocable: false
allowed-tools: Read
---

A change is validated when all of these hold:

- `mvn clean compile` succeeds.
- The tests covering the change pass, named explicitly.
- The exact commands and their results are reported.
- Any failure is classified: code / test / environment / flaky / unknown.
- Anything skipped is stated, with the reason.

Not validation:
- "Should work" or "looks correct".
- A green run of tests unrelated to the change.
- A passing build with no test executed.
- Success reported from reading the diff rather than running it.
