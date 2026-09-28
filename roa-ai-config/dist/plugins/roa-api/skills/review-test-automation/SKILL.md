---
name: review-test-automation
description: Perform an independent adversarial review of completed ROA automation to identify weak assertions, brittle design, hidden dependencies, architectural misuse, and false-positive risk.
allowed-tools: Read, Glob, Grep, Bash, Skill, Agent
---

Review the completed automation work for:

```text
$ARGUMENTS
```

You orchestrate two independent reviews and merge them. Delegate with the `Agent` tool using the exact `subagent_type` given; launch both reviewers in the same turn so neither sees the other's conclusions.

## Procedure

1. Collect the task requirements, the changed files (`git diff` against the base), and the available validation evidence. Pass all of it to both reviewers.

2. Launch `subagent_type: roa-api:adversarial-test-reviewer` for false positives, weak assertions, hidden coupling, cleanup, determinism, parallel safety, and setup that replaces the behavior under test.

3. Launch `subagent_type: roa-api:api-contract-reviewer` for API-specific correctness: architecture, reuse of project abstractions, and fidelity to the Swagger/OpenAPI contract, read through the `swagger` MCP server.

4. Merge the findings. Drop any finding that has no `file_path:line` or no supporting evidence; deduplicate findings both reviewers raised; keep the more severe classification when they disagree.

5. Keep the review proportional to the task. Raise only concerns supported by the implementation, repository context, or runtime evidence.

## Return

Provide:

* overall verdict: `PASS`, `FAIL`, or `BLOCKED`;
* blocking findings, each with `file_path:line`, the evidence, and the concrete correction;
* non-blocking recommendations, kept separate;
* false-positive or weak-assertion risks;
* hidden state, cleanup, determinism, parallelism, or data risks;
* ROA or project-architecture misuse;
* anything neither reviewer could verify.

Do not invent problems merely to be critical. Do not modify code.
