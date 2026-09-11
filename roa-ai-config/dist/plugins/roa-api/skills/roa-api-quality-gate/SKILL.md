---
name: roa-api-quality-gate
description: The reusable API verification gate - runs the applicable build and tests for this repository and reports explicit pass/fail evidence. Consumed by validate-code.
user-invocable: false
allowed-tools: Read, Grep, Glob, Bash
---

This hidden skill is the single API gate consumed by every ROA workflow.
It follows `validation-policy` for severity and evidence format.

- **Conditional check selection** - do not run every tool unconditionally. Decide from:
  - repo config (`pom.xml` plugins/profiles, `ai-config.yaml`, `.claude/rules/roa-api.md`),
  - the changed files (run only what the change can affect),
  - and CI conventions in the repo (mirror what CI enforces).
- **Candidate checks** (run only when applicable):
  - **Maven build + tests** - `mvn clean compile`, then `mvn test -Dtest=<TheTest>`.
    Prefer `./mvnw` when the repository provides a wrapper.
  - **Full suite** - `mvn test` before declaring the whole change good.
  - **Metadata** - `mvn pandora:navigation -U` when dependencies or framework version changed.
  Never skip or disable tests to make the gate pass.
- **Evidence output** (required): for each check, the exact command, its exit code,
  PASS/FAIL, the failures, and any check intentionally skipped and why.
- **Result**: an overall PASS / FAIL / INCONCLUSIVE with the remaining gaps.
