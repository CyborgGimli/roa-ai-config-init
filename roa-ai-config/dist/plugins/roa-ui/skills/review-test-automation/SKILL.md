---
name: review-test-automation
description: Perform an independent adversarial review of completed ROA automation to identify weak assertions, brittle design, hidden dependencies, architectural misuse, and false-positive risk.
allowed-tools: Read, Glob, Grep, Bash, Skill, Task
---

Review the completed automation work for:

```text
$ARGUMENTS
```

## Procedure

1. Start from the task requirements, implementation, changed files, and available validation evidence.

2. Review the automation independently rather than assuming the implementation is correct.

3. Look for false positives:

    * assertions that do not prove the intended behavior;
    * superficial success checks;
    * missing important outcomes;
    * tests that could pass while the requirement is actually broken.

4. Look for hidden coupling and instability:

    * test-order dependencies;
    * shared mutable state;
    * unsafe parallel execution;
    * incomplete cleanup;
    * brittle test data;
    * environment assumptions;
    * timing-sensitive behavior;
    * duplicated or inconsistent setup.

5. Challenge the architecture. Verify that existing ROA and project abstractions are used appropriately and that the implementation does not introduce unnecessary wrappers, duplicate infrastructure, or lower-level workarounds.

6. Verify that supporting setup, mocks, generated data, or alternate Rings do not accidentally replace the behavior the test is intended to prove.

7. When exact `io.cyborgcode.roa.*` behavior is relevant to a concern and cannot be established from the repository, use the `ai-compass` skill rather than guessing.

8. Delegate an independent adversarial pass to `adversarial-test-reviewer` when useful for the scope or risk of the change.

9. Keep the review proportional to the task. Raise only concerns supported by implementation, repository context, or runtime evidence.

## Return

Provide:

* overall review assessment;
* false-positive or weak-assertion risks;
* hidden state, cleanup, determinism, parallelism, or data risks;
* brittle or unnecessarily complex implementation choices;
* ROA or project-architecture misuse;
* important missing scenarios or validations;
* blocking issues versus recommendations;
* prioritized corrections, if any.

Do not invent problems merely to be critical.
