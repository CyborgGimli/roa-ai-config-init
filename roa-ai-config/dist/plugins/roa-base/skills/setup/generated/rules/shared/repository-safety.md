<!-- BEGIN ROA AI CONFIG: shared/repository-safety -->

# Repository Safety Rules

- Do not expose, print, copy, commit, or hardcode secrets, credentials, tokens, private keys, or other sensitive values.
- Do not perform destructive Git, filesystem, database, or environment operations unless they are explicitly required and safe for the task.
- Do not rewrite history, force-push, reset unrelated work, delete branches, or discard changes that were not created as part of the current task.
- Do not modify application or production code merely to make automation pass unless the task explicitly requires that change and the evidence justifies it.
- Keep changes scoped to the requested work; avoid unrelated refactoring, formatting churn, dependency upgrades, or configuration changes.
- Preserve existing repository conventions, generated-file boundaries, and build structure unless the task requires changing them.
- Do not disable tests, checks, hooks, quality gates, or security controls to make validation succeed.
- Inspect commands before running them when they can mutate repository state, install dependencies, publish artifacts, deploy, or affect external systems.
- Prefer read-only investigation before mutation when the current state or ownership of files is unclear.
- If a requested action could overwrite, delete, publish, deploy, or expose sensitive material and the safe intent is not established, stop and report the risk instead of guessing.

<!-- END ROA AI CONFIG: shared/repository-safety -->
