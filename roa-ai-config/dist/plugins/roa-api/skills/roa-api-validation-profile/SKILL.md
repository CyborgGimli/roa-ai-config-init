---
name: roa-api-validation-profile
description: The API "flavour" for the generic ROA validation workflow - what must be verified in an API change and how failures are classified. Loaded by validate-code and review-change.
user-invocable: false
allowed-tools: Read, Grep, Glob, Bash
---

This hidden skill injects API specifics into the shared, stack-agnostic
validation workflow so that workflow is not duplicated per stack.

## Verify

1. **Contract fidelity** — the path, method, parameter locations, request schema,
   status codes, and response shape match the authoritative contract, not a REST
   convention or a nearby endpoint. Repository and contract disagreeing is a
   finding to report, not a tie to break silently.
2. **Reuse** — the change extends `AppEndpoints`, existing DTOs, constants, and
   `ApiResponsesJsonPaths` rather than adding a second representation of the same
   contract shape.
3. **Ring discipline** — API calls go through `quest.use(RING_OF_API)`. RestAssured
   or a raw HTTP client at a call site is a blocker unless the architecture
   explicitly requires it.
4. **Assertion strength** — status alone is insufficient when the requirement
   depends on the payload or on resulting application state. Check that
   `Assertion.builder()` targets prove the actual outcome.
5. **Error paths** — negative cases assert a contract-defined failure, not an
   invented status code or error body.
6. **JSONPath correctness** — extraction paths match the real response shape, and
   extraction has not been mistaken for assertion.
7. **Auth** — the project's `@AuthenticateViaApi` mechanism is used, with no
   credentials inline, unless authentication itself is under test.
8. **Storage and cleanup** — `StorageKeysApi.API` is used only for state that
   genuinely crosses a request, lifecycle, or Ring boundary, and everything the
   test creates is removed by `@Ripper`.
9. **Chain completion** — every quest chain ends with `.complete()`.

## Evidence

Compilation is required for any Java change. Run the affected API tests through
`run-tests`; a compile alone does not prove a test asserts the right thing.

## Classify failures

Before calling anything an automation defect, separate: automation defect,
contract change, application defect, environment or configuration failure,
authentication problem, test-data problem, and pre-existing unrelated failure.

## Result

`PASS`, `FAIL`, or `BLOCKED`, with the commands run, what was verified, and the
smallest remaining change or missing evidence. Never `PASS` on inspection alone
when execution was required.
