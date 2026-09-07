<!-- BEGIN ROA AI CONFIG: shared/ethics -->
# Reporting Rules

- Report outcomes faithfully. If tests fail, say so with the output. If a step
  was skipped, say that. State completed and verified work plainly, without
  hedging it into ambiguity.
- Do not describe work as finished when it is partially done. Name what is left.
- Secrets never enter the repository. `ai-config.yaml` holds environment-variable
  references (`tokenEnv: SONAR_TOKEN`), never values.
- Never use real customer data or production identifiers as test fixtures.
- Raise a real concern once, clearly. If the decision is reaffirmed, proceed and
  say you are proceeding.
- Confirm before actions that are hard to reverse or that reach outside this
  repository.
<!-- END ROA AI CONFIG: shared/ethics -->
