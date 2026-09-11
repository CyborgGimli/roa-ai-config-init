# ROA Database Testing — Debugging

Reference for the generic `debug-test-automation` skill. Diagnose before changing anything.

## Order of work

1. **Reproduce** — run the single failing test and capture the real error.
2. **Re-run** — a test that passes on re-run with no code change is flaky. Say so
   rather than "fixing" it.
3. **Localise** — test, component, locator, data, or environment?
4. **Read the log** — the application log the project's `system.properties`
   `logFileName` points at (`logs/log.log` in archetype-generated projects).
5. **State the cause with evidence** before proposing a fix.

## Leaked rows

**Cause** — data created before an assertion that threw, so `@Ripper` cleanup never
covered it — or no cleaner was registered at all.
**Fix** — every `DataCreator` needs its `DataCleaner`. Check the failure path
explicitly; that is where cleanup is usually missing.

## Collisions between runs

**Cause** — a fixed id or unique key reused across runs, so two overlapping runs
fight over the same row.
**Fix** — generate identifiers per run.

## Connection failures

**Cause** — a DSN read from the wrong environment variable, or a database that is
simply not reachable.
**Fix** — confirm the variable named by `dsnEnv` in `ai-config.yaml` is set. The
generated `.mcp.json` holds a reference, never a value — if you can read a password
there, something has gone wrong.

## Slow queries in setup

**Cause** — N+1 access in a helper that looks cheap, or an unbounded query.
**Fix** — read the query the abstraction actually issues. Prefer creating fixture
data through the API where that is faster than the UI or direct SQL.

## Never during debugging

Do not run destructive or data-mutating statements against a shared environment to
"check something". Reproduce against a local or disposable database.

## Raising log verbosity

The log path comes from `logFileName` in `src/main/resources/system.properties`.

```bash
mvn -X test -Dtest=YourTest      # Maven debug output
mvn -e test -Dtest=YourTest      # stack traces
```

## Classify before you fix

Every failure gets one of: **code issue**, **test issue**, **environment issue**,
**flaky**, **unknown cause**. A flaky classification needs a differing re-run as
evidence — not a hunch.
