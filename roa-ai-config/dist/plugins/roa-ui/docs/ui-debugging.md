# ROA UI Testing — Debugging

Reference for the generic `debug` skill. Diagnose before changing anything.

## Order of work

1. **Reproduce** — run the single failing test and capture the real error.
2. **Re-run** — a test that passes on re-run with no code change is flaky. Say so
   rather than "fixing" it.
3. **Localise** — test, component, locator, data, or environment?
4. **Read the log** — `logs/roa.log`, surfaced through `ROA_LOG_FILE`. The
   `app-log` monitor tails it automatically when the `debug` skill runs.
5. **State the cause with evidence** before proposing a fix.

## Stale element references

**Cause** — the element was re-rendered between locating it and using it.
**Fix** — go through `SmartWebDriver.findSmartElement()`, which re-finds on
staleness. A raw `findElement()` handle is exactly what goes stale.

## Flaky waits

**Cause** — the wait condition does not match the state the test depends on. The
classic case passes because the page has not *started* re-rendering yet.
**Fix** — wait on the condition you actually need (value present, request settled,
element interactable), not on time passing. Never `Thread.sleep()`, and never widen
a timeout to make a race disappear.

## Selector fragility

**Cause** — a locator tied to layout, or inlined in a test.
**Fix** — move it into the Layer 2 element enum and prefer a stable test hook
(`data-test`, role, label) over structural CSS or XPath.

## Dynamic content

**Cause** — content rendered by JavaScript after load.
**Fix** — wait for the element to be visible or interactable rather than present.
Presence is satisfied by an empty placeholder.

## Test pollution

**Cause** — browser state (cookies, storage, session) or test data surviving into
the next test.
**Fix** — check the `@Ripper` cleanup actually runs on the failure path. Data
created before a throwing assertion is the usual leak.

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
