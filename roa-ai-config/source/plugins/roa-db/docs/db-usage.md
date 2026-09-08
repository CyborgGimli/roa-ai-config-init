# ROA Database Testing — Usage

Orientation for working in a repository configured with `roa-db`.

## Setup

```bash
/roa-base:setup roa-db
/reload-plugins --force
```

That writes `.claude/rules/`, `.claude/settings.json`, the `CLAUDE.md` managed
block, a starter `ai-config.yaml`, and `.mcp.json`. Fill in `ai-config.yaml` with
non-secret repository values and run setup again to generate `.mcp.json`.

## First steps in a new area

1. Identify the invariant the change exercises or enforces.
2. Extend the query abstraction; never inline SQL into a test.
3. Create rows uniquely per run and register their cleanup in the same change.
4. Assert against the result set, not the row count alone.
5. Compile, run the single test, then run the suite.

## The ring

ROA Database Testing work happens inside `RING_OF_DB`:

```java
quest.use(RING_OF_DB)
     // fluent chain
     .drop()
     .complete();
```

`.complete()` is mandatory. `.drop()` returns to the Quest so another ring can be
entered — cross-ring tests are normal (drive the UI, then verify in the database).

## Which skill to reach for

| Task | Skill |
| --- | --- |
| Plan a change | `plan-task` |
| Write the change | `implement-task` |
| Prove it works | `validate-code` (runs `roa-db-quality-gate`) |
| Diagnose a failure | `debug` |
| Repair failing tests | `fix-tests` |
| Check completeness | `roa-db-definition-of-done` |

## Which agent to reach for

| Need | Agent |
| --- | --- |
| Map an unfamiliar area | `codebase-investigator` |
| Break the change before review does | `adversarial-reviewer` |
| ROA Database Testing-specific review | see this plugin's specialist agent |
| Prove it passes | `validator` |

## Commands

```bash
mvn clean compile                      # builds
mvn test -Pe2e -Dtest=YourTestClass    # the change passes
mvn clean install                      # full quality checks
mvn pandora:navigation -U              # regenerate framework metadata
```

See `quality-gates.md` for the evidence format these produce.
