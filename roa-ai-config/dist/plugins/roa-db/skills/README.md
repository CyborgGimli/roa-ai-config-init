# Shared Skills

Everything in this folder ships into **every** domain plugin (roa-ui, roa-api,
roa-db). Anything that applies to only one module belongs in that plugin's own
`skills/` folder instead.

The shared workflows are deliberately stack-agnostic. Each one loads the active
plugin's hidden *profile* skill for the specifics, so the workflow itself is not
duplicated three times.

## Workflow

| Skill | Purpose |
| --- | --- |
| `plan-task` | plan a change before writing code |
| `implement-task` | write the change against the agreed plan |
| `run-tests` | execute the narrowest sufficient scope and report the raw result |
| `validate-code` | run the gates and report evidence |
| `review-change` | independent adversarial review before acceptance |
| `create-documentation` | update docs the change made stale |

The normal path through them:

```text
plan-task -> implement-task -> run-tests -> validate-code -> review-change
                                   |
                              (on failure)
                                   v
                            debug -> fix-tests
```

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

## Generated project knowledge (hidden, loaded before writing ROA code)

| Skill | Purpose |
| --- | --- |
| `ai-compass` | the generated framework contract — signatures, options, worked usages |
| `ai-teacher` | the curated lesson catalog — this team's approved patterns |

`ai-compass` answers *what the framework can do*; `ai-teacher` answers *what good
looks like here*. On a signature disagreement `ai-compass` wins, because it is
generated from the framework on the classpath. Both are produced by Pandora Maven
goals (`pandora:navigation` and `pandora:teach`) into `target/pandora/`.

`ai-compass` is the only Pandora metadata skill. Its two predecessors were
removed rather than left to compete with it: two skills describing the same
metadata means the wrong one gets loaded half the time.

## Pull requests

`prepare-pr`, `repair-pr` — both explicit-invocation only.

## Per-plugin skills

Each domain plugin ships an architect plus four hidden skills the shared
workflows load by name:

| Plugin | Architect | Profiles and gates |
| --- | --- | --- |
| roa-api | `/roa-api:roa-api-architect` | `roa-api-task-profile`, `roa-api-validation-profile`, `roa-api-quality-gate`, `roa-api-definition-of-done`, `roa-api-guidance`, `roa-api-examples` |
| roa-ui | `/roa-ui:roa-ui-architect` | `roa-ui-task-profile`, `roa-ui-validation-profile`, `roa-ui-quality-gate`, `roa-ui-definition-of-done`, `roa-ui-guidance`, `roa-ui-examples` |
| roa-db | `/roa-db:roa-db-architect` | `roa-db-task-profile`, `roa-db-validation-profile`, `roa-db-quality-gate`, `roa-db-definition-of-done`, `roa-db-guidance`, `roa-db-examples` |

Setup and update live in the bootstrap plugin: `/roa-base:setup`,
`/roa-base:update`.

A plugin-specific skill of the same name overrides the shared one.
