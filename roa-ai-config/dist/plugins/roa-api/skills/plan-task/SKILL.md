---
name: plan-task
description: Plan an ROA change before writing code - affected layers, ordered steps, validation, and risks. Use at the start of any non-trivial task.
allowed-tools: Read, Glob, Grep, Task, Skill
---

Produce a short, executable plan for the requested change.

First load this plugin's task profile — `roa-api-task-profile`,
`roa-ui-task-profile`, or `roa-db-task-profile` — for the stack, the rules that
apply, and the standard task sequence. Everything below is stack-agnostic; the
profile supplies the specifics.

1. Identify the affected pieces and say why each is needed - the module's own
   definitions (UI `types`/`elements`/`components`, API endpoints and DTOs, DB
   queries and types), plus `service`, `data`, and `tests`.
2. Check what already exists before planning anything new - name the element,
   endpoint, query or helper you found, or state that none exists. Delegate to
   the `codebase-investigator` agent when that is not quick to establish.
3. Order the steps bottom-up: definitions first, then the test that uses them.
4. State the validation commands that will prove it works, and the narrowest test
   scope that would be sufficient.
5. List the real risks: flaky waits, shared test data, environment coupling,
   whether `mvn pandora:navigation -U` must be re-run.

When a ROA signature the plan depends on is unclear, load `ai-compass` rather
than planning against a guessed API.

Keep it short. A plan longer than the change it describes is a failure.
Hand off to `implement-task` once the plan is agreed.
