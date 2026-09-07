---
name: plan-task
description: Plan an ROA change before writing code - affected layers, ordered steps, validation, and risks. Use at the start of any non-trivial task.
allowed-tools: Read, Glob, Grep, Task, Skill
---

Produce a short, executable plan for the requested change.

1. Identify the affected layers: `types`, `elements`, `components`,
   `service`, `tests`, `data`. Say why each is needed.
2. Check what already exists before planning anything new - name the component
   or helper you found, or state that none exists.
3. Order the steps bottom-up: locators, then components, then tests.
4. State the validation commands that will prove it works.
5. List the real risks: flaky waits, shared test data, environment coupling,
   whether `mvn pandora:open -U` must be re-run.

Keep it short. A plan longer than the change it describes is a failure.
Hand off to `implement-task` once the plan is agreed.
