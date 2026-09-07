# Shared Skills

Everything in this folder ships into **every** domain plugin (roa-ui, roa-api,
roa-db). Anything that applies to only one module belongs in that plugin's own
`skills/` folder instead.

## Workflow

| Skill | Purpose |
| --- | --- |
| `plan-task` | plan a change before writing code |
| `implement-task` | write the change against the agreed plan |
| `validate-code` | run the gates and report evidence |
| `create-documentation` | update docs the change made stale |

## Diagnosis and repair

| Skill | Purpose |
| --- | --- |
| `debug` | isolate and classify a failure before changing anything |
| `flaky-triage` | prove flakiness, name the cause, apply the quarantine rules |
| `fix-tests` | repair failing tests once the cause is known |
| `fix-issue` | work a reported bug end to end |

## Policy (hidden, referenced by other skills and agents)

| Skill | Purpose |
| --- | --- |
| `java-standards` | Java authoring rules for ROA code |
| `definition-of-done` | the completion checklist |
| `validation-policy` | what counts as adequate evidence |
| `git-pr-lifecycle-policy` | branch, commit and PR rules |
| `roa-pandora-metadata` | how to read the generated framework contract |

## Pull requests

`prepare-pr`, `repair-pr` — both explicit-invocation only.

## Per-plugin specialists

- roa-base: `/roa-base:setup`, `/roa-base:update`
- roa-ui: `/roa-ui:roa-ui-architect`
- roa-api: `/roa-api:roa-api-architect`
- roa-db: `/roa-db:roa-db-architect`

A plugin-specific skill of the same name overrides the shared one.
