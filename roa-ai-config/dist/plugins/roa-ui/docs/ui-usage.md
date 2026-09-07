# ROA UI Testing — Usage

Orientation for working in a repository configured with `roa-ui`.

## Setup

```bash
/roa-base:setup roa-ui
/reload-plugins --force
```

That writes `.claude/rules/`, `.claude/settings.json`, the `CLAUDE.md` managed
block, a starter `ai-config.yaml`, and `.mcp.json`. Fill in `ai-config.yaml` with
non-secret repository values and run setup again to generate `.mcp.json`.

## First steps in a new area

1. Look for an existing component before adding one. `codebase-investigator` will
   tell you what already covers the surface.
2. Add the locator to the Layer 2 element enum (`ui/elements/`).
3. Add or extend the Layer 3 implementation (`ui/components/`) if the interaction
   is genuinely new.
4. Write the test against the component, never against a raw locator.
5. Compile, run the single test, then run the suite.

## The ring

ROA UI Testing work happens inside `RING_OF_UI`:

```java
quest.use(RING_OF_UI)
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
| Prove it works | `validate-code` (runs `roa-ui-quality-gate`) |
| Diagnose a failure | `debug` |
| Repair failing tests | `fix-tests` |
| Check completeness | `roa-ui-definition-of-done` |

## Which agent to reach for

| Need | Agent |
| --- | --- |
| Map an unfamiliar area | `codebase-investigator` |
| Break the change before review does | `adversarial-reviewer` |
| ROA UI Testing-specific review | see this plugin's specialist agent |
| Prove it passes | `validator` |

## Commands

```bash
mvn clean compile                      # builds
mvn test -Pe2e -Dtest=YourTestClass    # the change passes
mvn clean install                      # full quality checks
mvn pandora:open -U                    # regenerate framework metadata
```

See `quality-gates.md` for the evidence format these produce.
