---
name: roa-ui-validation-profile
description: The UI "flavour" for the generic ROA validation workflow - what must be verified in a UI change and how failures are classified. Loaded by validate-code and review-change.
user-invocable: false
allowed-tools: Read, Grep, Glob, Bash
---

This hidden skill injects UI specifics into the shared, stack-agnostic
validation workflow so that workflow is not duplicated per stack.

## Verify

1. **Three layers intact** — component type, element definition, component
   implementation. Locators live in element enums, reusable interaction lives in
   the `@ImplementationOfType` class, and neither has leaked into the test.
2. **Reuse** — an existing component type or implementation was extended where one
   already covers the control. A new component type per new element is a finding.
3. **Locator quality** — locators come from the rendered application, not from a
   guess. Generated class names, deep DOM chains, positional selectors, and
   index-based lookups are brittle and should be flagged.
4. **Synchronisation** — waits target an observable application condition through
   the ROA synchronisation mechanisms. Any `Thread.sleep`, arbitrary wait, or
   inflated timeout added to make a test pass is a blocker. Readiness and
   assertion must stay distinct: waiting for an element is not proof of the
   outcome.
5. **Driver discipline** — interaction goes through `AppUiService` and
   `findSmartElement()`. Raw `WebDriver`/`findElement()` in a test is a blocker
   unless the architecture explicitly requires it.
6. **Assertion strength** — the test proves a visible or business outcome. A
   successful click, a present element, an opened page, or the absence of an
   exception is not sufficient when the requirement is stronger.
7. **Setup did not replace the behaviour** — authentication, Journeys, API or DB
   preparation, insertion, and interception may establish prerequisites, but must
   not perform the UI action the test exists to verify.
8. **Tables** — row selection is by business data, not row index, unless ordering
   itself is under test.
9. **Isolation** — no shared mutable browser state, no stale session dependency,
   no reliance on data another test created, and cleanup registered for whatever
   this test creates. Chains end with `.complete()`.

## Evidence

Compilation is required for any Java change. Run the affected UI tests through
`run-tests`. A UI test that has never executed is not validated, because locator
and timing defects do not appear at compile time.

## Classify failures

Before calling anything an automation defect, separate: automation defect,
locator drift, synchronisation defect, application defect, test-data problem,
authentication or session problem, environment or browser-version failure, and
genuine flakiness. Use `flaky-triage` rather than guessing when a test passes on
re-run.

## Result

`PASS`, `FAIL`, or `BLOCKED`, with the commands run, what was verified, and the
smallest remaining change or missing evidence. Never `PASS` on inspection alone.
