---
name: validate-code
description: Prove an ROA change works - run the build and the relevant tests, then report pass/fail with evidence and a failure classification.
allowed-tools: Read, Glob, Grep, Bash, Task, Skill
---

Run the checks and report exactly what happened.

First load this plugin's validation profile — `roa-api-validation-profile`,
`roa-ui-validation-profile`, or `roa-db-validation-profile` — for what must be
verified in this stack and how its failures are classified. `validation-policy`
defines how much evidence is enough for a change of this size.

1. Compile: `mvn clean compile`, or the repository's wrapper.
2. Run the relevant tests through `run-tests`, which picks the narrowest
   sufficient scope and reports the raw result.
3. Regenerate metadata with `mvn pandora:navigation -U` only when dependencies or
   the framework version changed.
4. Check the change against the validation profile's list, not only against
   whether the build went green.
5. Delegate an independent pass to the `validator` agent when the change is
   substantial or you implemented it yourself.

Report the exact command, its result, and only the relevant error output.
Classify every failure: **code issue**, **test issue**, **environment issue**,
**flaky**, or **unknown cause**. A flaky call needs a differing re-run as proof —
use `flaky-triage` rather than asserting it.

Never report success without having run something, and never report `PASS` when
the profile's checks were not actually verified.
