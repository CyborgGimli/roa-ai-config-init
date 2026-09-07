---
name: validate-code
description: Prove an ROA change works - run the build and the relevant tests, then report pass/fail with evidence and a failure classification.
allowed-tools: Read, Glob, Grep, Bash
---

Run the checks and report exactly what happened.

```bash
mvn clean compile
mvn test -Dtest=<TheTest>
mvn pandora:open -U     # only when dependencies or framework version changed
```

Report the exact command, its result, and only the relevant error output.
Classify every failure: **code issue**, **test issue**, **environment issue**,
**flaky**, or **unknown cause**. A flaky call needs a differing re-run as proof.

Never report success without having run something.
