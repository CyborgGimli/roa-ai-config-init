# ROA API Testing — Usage

Orientation for working in a repository configured with `roa-api`.

## Setup

```bash
/roa-base:setup roa-api
/reload-plugins --force
```

That writes `.claude/rules/`, `.claude/settings.json`, the `CLAUDE.md` managed
block, a starter `ai-config.yaml`, and `.mcp.json`. Fill in `ai-config.yaml` with
non-secret repository values and run setup again to generate `.mcp.json`.

## First steps in a new area

1. Confirm the contract first: path, method, request shape, response shape, and the
   documented error cases.
2. Add the endpoint constant to `AppEndpoints`; add any missing param/header keys to
   `api/constants/` and any newly asserted field to `ApiResponsesJsonPaths`.
3. Add request/response DTOs if the body is meaningful.
4. Write the test against `quest.use(RING_OF_API)`, never a raw HTTP client.
5. Cover the error paths, not only the happy path.
6. Clean up what the test creates, via `@Ripper`.
7. Compile, run the single test, then run the suite.

Where each class belongs: `api-project-structure.md`.

## The ring

ROA API Testing work happens inside `RING_OF_API`:

```java
quest.use(RING_OF_API)
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
| Prove it works | `validate-code` (runs `roa-api-quality-gate`) |
| Diagnose a failure | `debug` |
| Repair failing tests | `fix-tests` |
| Check completeness | `roa-api-definition-of-done` |

## Which agent to reach for

| Need | Agent |
| --- | --- |
| Map an unfamiliar area | `codebase-investigator` |
| Break the change before review does | `adversarial-reviewer` |
| ROA API Testing-specific review | see this plugin's specialist agent |
| Prove it passes | `validator` |

## Commands

```bash
mvn clean compile                      # builds
mvn test -Pe2e -Dtest=YourTestClass    # the change passes
mvn clean install                      # full quality checks
mvn pandora:open -U                    # regenerate framework metadata
```

See `quality-gates.md` for the evidence format these produce.
