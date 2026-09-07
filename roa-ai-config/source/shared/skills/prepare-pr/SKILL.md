---
name: prepare-pr
description: Assemble a pull request for an ROA change - branch check, quality gate, and a PR description with validation evidence.
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash
---

1. Confirm you are on a branch, not the default branch.
2. Confirm the quality gate passes: `mvn clean compile` and the relevant tests.
3. Review the diff for stray debug output, secrets, and unrelated changes.
4. Confirm no generated artifacts (`dist/`, `.claude-plugin/marketplace.json`)
   were hand-edited.
5. Write the description: what changed, why, and how it was verified.

Do not push or open the PR unless asked. Present the description for review.
