---
name: validate-test-automation
description: Independently verify that an ROA automation change is complete, correct, executable, aligned with the task, and supported by sufficient validation evidence.
allowed-tools: Read, Glob, Grep, Bash, Skill, Agent
---

Validate the completed automation work for:

```text
$ARGUMENTS
```

The implementer does not validate its own work. Delegate the independent check with the `Agent` tool using the exact `subagent_type` given.

## Procedure

1. Collect the task requirements, the changed files (`git diff` against the base), the investigation and architecture findings with their evidence, and prior execution evidence.

2. Confirm the relevant Java changes compile and that the targeted tests were actually executed — the Surefire summary must show `Tests run:` greater than zero for that scope. If either is missing, produce it with the project's Maven build and the `${plugin_name}:run-tests` skill.

3. Launch `subagent_type: ${plugin_name}:validator` with everything from steps 1 and 2. The validator applies the `${plugin_name}:validation-policy` and `${plugin_name}:${domain_validation_profile}` skills, reads `ai-compass` metadata for every ROA type involved, and checks application or contract facts against ${domain_evidence_source}.

4. Do not accept a `PASS` that rests on an `UNVERIFIED` application, contract, or framework fact, on skipped or zero executed tests, on weakened assertions, or on bypassed ROA or project conventions.

5. Apply the `${plugin_name}:definition-of-done` skill to the validator's result before returning it.

## Return

Provide:

* `PASS`, `FAIL`, or `BLOCKED`;
* requirements and behaviors verified;
* compilation evidence;
* tests executed, the executed-test count, and results;
* missing, weak, or incorrect validation;
* ROA or project-convention violations;
* relevant state, cleanup, determinism, or maintainability concerns;
* external application, environment, contract, data, configuration, or framework issues;
* smallest remaining changes or evidence required for completion.

Do not approve the work without sufficient evidence.
