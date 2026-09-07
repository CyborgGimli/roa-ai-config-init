# ROA API Testing — Debugging

Reference for the generic `debug` skill. Diagnose before changing anything.

## Order of work

1. **Reproduce** — run the single failing test and capture the real error.
2. **Re-run** — a test that passes on re-run with no code change is flaky. Say so
   rather than "fixing" it.
3. **Localise** — test, component, locator, data, or environment?
4. **Read the log** — `logs/roa.log`, surfaced through `ROA_LOG_FILE`. The
   `app-log` monitor tails it automatically when the `debug` skill runs.
5. **State the cause with evidence** before proposing a fix.

## Wrong status, right shape (or vice versa)

**Cause** — the test asserts only one of them.
**Fix** — assert status *and* payload. A status-only assertion passes for the wrong
reasons more often than it catches anything.

## Brittle full-body equality

**Cause** — asserting the whole response by equality, so an unrelated additive field
breaks the test.
**Fix** — assert the fields the behaviour depends on.

## Non-deterministic fields

**Cause** — asserting on ids, timestamps, or collection ordering the API does not
guarantee.
**Fix** — normalise before comparing, or assert a property rather than a value.

## Authentication drift

**Cause** — a token fixture that expired, or a credential read from the wrong
environment.
**Fix** — check the environment variable actually resolved. Credentials come from
the environment; a hardcoded token is both a bug and a leak.

## Environment vs code

A connection refused, a 502, or a DNS failure is an **environment issue**. Report it
as such and say the change is unverified — do not retry until it passes.

## Raising log verbosity

The log path comes from `ai-config.yaml` (`logs.file`), which `/roa-base:setup`
writes to `ROA_LOG_FILE` in `.claude/settings.json`.

```bash
mvn -X test -Dtest=YourTest      # Maven debug output
mvn -e test -Dtest=YourTest      # stack traces
```

## Classify before you fix

Every failure gets one of: **code issue**, **test issue**, **environment issue**,
**flaky**, **unknown cause**. A flaky classification needs a differing re-run as
evidence — not a hunch.
