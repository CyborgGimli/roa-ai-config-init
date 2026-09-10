---
name: review-change
description: Independent adversarial review of a completed ROA change - false positives, brittle design, hidden coupling, and architectural misuse. Use before accepting substantial or risk-sensitive automation work.
allowed-tools: Read, Glob, Grep, Bash, Task, Skill
---

Review the completed work for:

```text
$ARGUMENTS
```

Review the change on its own merits. Do not assume the implementation is correct
because it was just written, and do not re-derive the plan — the question is
whether what exists now is trustworthy.

## Procedure

1. Establish what behaviour the change was supposed to prove, then read the diff
   and the tests it touches.

2. Hunt for false positives first — they are the failure mode that costs the most
   later:
   - assertions that would still pass if the feature were broken;
   - a status code or element-exists check standing in for a business outcome;
   - a test that verifies its own setup rather than the application;
   - important outcomes left unasserted.

3. Look for hidden coupling and non-determinism:
   - test-order dependencies and shared mutable state;
   - data left behind, or cleanup that assumes a prior test ran;
   - unsafe parallel execution;
   - timing-sensitive waits and arbitrary sleeps;
   - environment or account assumptions that hold only on one machine.

4. Check the architecture against the module's rules. Load the active plugin's
   `roa-<module>-guidance` skill for what "correct" means here. Flag lower-level
   bypasses — raw Selenium, RestAssured in a test, string-interpolated SQL —
   where an established ROA abstraction already covers the need.

5. Confirm supporting setup did not replace the behaviour under test. A UI test
   whose entity is created over the API, then only checked in the UI, no longer
   tests creation.

6. Verify framework usage you cannot confirm from the repository with the
   `ai-compass` skill rather than asserting it from the method name.

7. Delegate a second independent pass to the `adversarial-reviewer` agent when
   the change is large or high-risk, and to the module's own reviewer agent
   (`roa-api-contract-reviewer`, `roa-ui-flakiness-reviewer`,
   `roa-db-data-reviewer`) when the change is in that module.

8. Keep the review proportional. Raise what the diff supports; do not invent
   problems to look thorough, and do not demand unrelated refactoring.

## Report

Order findings by severity — Blocker, High, Medium, Low — and for each give the
file path, what is wrong, and the concrete fix. Separate what must change before
this is accepted from what is merely advice.

If nothing material is wrong, say so plainly and state what you reviewed.

Do not edit code.
