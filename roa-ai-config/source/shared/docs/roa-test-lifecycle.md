# ROA Test Lifecycle

ROA provides lifecycle mechanisms for preparing test state, generating data, authenticating users, executing reusable preconditions, observing application behavior, and cleaning up after a test.

These mechanisms operate around the test's **Quest** and should be used instead of duplicating setup and teardown logic inside test methods.

This document defines the framework-wide lifecycle model shared by ROA automation.

## Mental Model

A test may involve several lifecycle stages:

```text
Capabilities and hooks
        ↓
Preconditions / Journeys
        ↓
Test data preparation
        ↓
Authentication and setup
        ↓
Test body
        ↓
Validation
        ↓
Cleanup / Rippers
```

The exact lifecycle depends on the annotations, capabilities, and configuration used by the test.

Not every test needs every mechanism. Use only what the scenario requires.

## Lifecycle Mechanisms

Common ROA lifecycle concepts include:

* `@Craft`
* `@Journey`
* `@JourneyData`
* `@AuthenticateViaApi`
* `@AuthenticateViaUi`
* `@StaticTestData`
* `@InterceptRequests`
* `@Ripper`

Some of these mechanisms are capability-specific. Their API- or UI-specific behavior belongs in the corresponding plugin documentation.

## `@Craft`

`@Craft` is used when the test lifecycle should provide generated test data.

Generated data is typically backed by the project's `DataCreator` configuration.

Conceptually:

```text
@Craft
   ↓
ROA resolves requested test data
   ↓
DataCreator creates the model
   ↓
generated value becomes available to the test
```

Use the project's established data-creation conventions rather than recreating equivalent model construction inside individual tests.

For `DataCreator`, `Late<T>`, and generated-data behavior, see:

`roa-data-and-storage.md`

## Journeys

A Journey represents a reusable precondition or preparation flow executed as part of the test lifecycle.

Journeys are appropriate for meaningful setup that is reusable across scenarios, such as:

```text
create prerequisite entity
prepare application state
establish domain preconditions
navigate the system into a required state
```

Projects normally define named Journey implementations that map to reusable functions.

Tests should reuse those definitions instead of duplicating the same preparation sequence.

Journeys may use the Quest and its Rings to prepare the required state.

## Journey Ordering

When multiple Journeys depend on one another, their ordering should be explicit.

Conceptually:

```text
Journey 1
→ create parent state

        ↓

Journey 2
→ create dependent state

        ↓

Test
→ exercise behavior requiring both
```

Do not rely on accidental execution order when a real dependency exists.

## `@JourneyData`

`@JourneyData` provides input required by a Journey.

It separates:

```text
what precondition should execute
```

from:

```text
what data that precondition requires
```

Journey outputs may also be retained in Quest storage when later lifecycle stages or the test body need them.

For Journey outputs and `PRE_ARGUMENTS`, see:

`roa-data-and-storage.md`

## Authentication

ROA provides lifecycle support for establishing authenticated test state.

### `@AuthenticateViaApi`

Use `@AuthenticateViaApi` when authentication should be established through the API capability.

The exact authentication implementation is project-specific and should follow the project's established ROA configuration.

For detailed API authentication behavior, use the API plugin documentation.

### `@AuthenticateViaUi`

Use `@AuthenticateViaUi` when authentication should be established through the UI capability.

A project may reuse browser authentication state such as session information, cookies, or local storage according to its implementation.

For detailed UI authentication and session behavior, use the UI plugin documentation.

When login itself is not the behavior under test, prefer the project's established authentication mechanism over repeatedly reproducing an unnecessary login flow.

## `@StaticTestData`

`@StaticTestData` provides predefined data from the project's configured test-data sources.

Use it when the scenario intentionally depends on stable configured values.

Do not use shared static data when the test requires independently controlled or isolated state.

## `@InterceptRequests`

`@InterceptRequests` supports scenarios that need to observe matching network activity.

This is primarily relevant to UI automation.

Captured information may be stored and consumed later in the same Quest.

For request matching, captured responses, extraction, and storage behavior, use the UI network-interception documentation.

## `@Ripper`

A Ripper represents cleanup behavior executed after the test.

Projects typically map Ripper targets to reusable `DataCleaner` implementations.

Conceptually:

```text
test prepares or creates state
        ↓
test executes
        ↓
@Ripper
        ↓
DataCleaner
        ↓
cleanup
```

Cleanup should be:

* deliberate;
* reusable;
* safe when expected state is partially missing;
* resilient to earlier test failures where practical.

Cleanup implementations should be defensive and idempotent where appropriate.

## Lifecycle and Quest Storage

Lifecycle stages can exchange runtime information through the same Quest context.

For example:

```text
Journey
   ↓
creates data
   ↓
stores result
   ↓
test retrieves result
   ↓
Ring consumes state
   ↓
Ripper uses cleanup information
```

Use Quest-scoped storage when information genuinely needs to cross lifecycle or Ring boundaries.

Avoid uncontrolled global or static mutable state.

For detailed storage behavior, see:

`roa-data-and-storage.md`

## Lifecycle Across Rings

Lifecycle operations are not inherently restricted to the Ring used by the main test action.

A scenario may use different capabilities for different responsibilities:

```text
Journey
→ prepare prerequisite state through one Ring

Test
→ exercise behavior through another Ring

Validation
→ verify through the appropriate capability

Ripper
→ clean created state
```

Choose the capability according to the purpose of the operation.

## Preserve the Behavior Under Test

Lifecycle setup should prepare the scenario without replacing the behavior the test exists to verify.

For example:

```text
Requirement
→ verify entity creation through UI

Valid setup
→ API or Journey prepares prerequisite state
→ UI test performs entity creation

Invalid setup
→ API creates the entity
→ UI test only checks that it exists
```

The supporting capability may establish prerequisites, but the test body must still exercise the behavior under test.

The same principle applies regardless of which Ring owns the primary behavior.

## Reuse and Scope

Prefer reusable lifecycle abstractions when setup or cleanup behavior is genuinely shared.

Use Journeys for meaningful reusable preconditions and Rippers for reusable cleanup.

Do not introduce lifecycle abstractions merely to wrap trivial one-off behavior.

Before creating a new Journey, cleaner, authentication flow, or other lifecycle implementation, inspect the repository for an existing abstraction that already owns the responsibility.

## Cleanup and Test Isolation

Consider cleanup while designing test setup.

For state-changing tests, determine:

```text
What state does the test create or modify?
        ↓
Can another test observe it?
        ↓
Does it need to be removed or restored?
        ↓
Which existing Ripper / DataCleaner should own cleanup?
```

Cleanup should not depend unnecessarily on another test having executed first.

Keep ownership of created state clear, especially when tests may run in parallel.

## Core Principles

* Use ROA lifecycle mechanisms instead of duplicating setup and teardown logic inside test bodies.
* Use `@Craft` with the project's `DataCreator` model for generated test data where appropriate.
* Use Journeys for meaningful reusable preconditions.
* Use `@JourneyData` when a Journey requires explicit input.
* Define Journey ordering when preconditions depend on one another.
* Use the project's established authentication mechanisms.
* Use `@StaticTestData` only when predefined shared data is appropriate.
* Use interception only when the scenario requires observing network behavior.
* Use Rippers and `DataCleaner` implementations for reusable cleanup.
* Keep lifecycle state test-scoped through the Quest where appropriate.
* Keep setup separate from the behavior under test.
* Reuse existing project lifecycle abstractions before introducing new ones.
* Design cleanup together with test setup.
* Use Pandora rather than guessing exact ROA annotation, method, or option behavior.

## Further Reference

For Quest, Rings, `.drop()`, validation, and `.complete()`:

`roa-core-architecture.md`

For `DataCreator`, `Late<T>`, Quest storage, namespaces, and Journey outputs:

`roa-data-and-storage.md`

For custom services and Rings used by reusable lifecycle flows:

`roa-custom-services-and-rings.md`

For exact ROA lifecycle metadata and usage:

`pandora-overview.md`
