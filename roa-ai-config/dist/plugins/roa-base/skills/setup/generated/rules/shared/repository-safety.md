<!-- BEGIN ROA AI CONFIG: shared/repository-safety -->
# Repository Safety Rules

What may be changed, and what must not be. Secrets and reporting are covered by
`ethics.md`; branches, commits and generated output by `git-pr.md`.

- Never modify application or production code to make a test pass. If the
  automation is correct and the application is not, that is the finding — report
  it rather than editing around it.
- Keep changes scoped to what was asked. No unrelated refactoring, formatting
  churn, dependency upgrades, or configuration changes riding along in the same
  commit; they hide the real change during review.
- Never disable or weaken a test, check, hook, quality gate, or security control
  to get a green result. Removing the thing that objects is not fixing it.
- Investigate read-only before mutating. When it is unclear what a file is for,
  who owns it, or whether it is generated, read first.
- Inspect a command before running it when it can delete data, rewrite history,
  install dependencies, publish artifacts, deploy, or reach an external system.
- Respect generated-file boundaries. Anything produced by a build or by Pandora
  is edited at its source, never in place — a hand edit is discarded by the next
  regeneration while everyone keeps trusting it.
- Preserve existing repository conventions and structure unless the task is
  explicitly to change them.
- If an action could overwrite, delete, publish, deploy, or expose something and
  the intent is not clearly established, stop and say so rather than guessing.
<!-- END ROA AI CONFIG: shared/repository-safety -->
