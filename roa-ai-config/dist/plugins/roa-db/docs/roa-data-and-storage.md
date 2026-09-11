# ROA Data and Storage

ROA provides a test-scoped data model for generating input, carrying runtime state through a Quest, sharing information between lifecycle stages and Rings, and keeping test dependencies explicit.

This document defines the framework-wide concepts for test data, `DataCreator`, `Late<T>`, Quest storage, storage namespaces, and runtime data flow.

## Mental Model

A test may work with several forms of data:

```text
Configured / static data
        +
Generated test data
        ↓
Lifecycle / Journeys
        ↓
Quest Storage
        ↓
Test body
        ↓
Ring actions and responses
        ↓
Additional runtime state
        ↓
Validation / Cleanup
```

The **Quest** provides the common test execution context.

Storage allows parts of the same test execution to exchange state without relying on uncontrolled global variables or unnecessary coupling.

## Test-Scoped Storage

ROA storage belongs to the current test execution context.

It can be used by:

* test code;
* Journeys and other lifecycle mechanisms;
* API operations;
* UI operations;
* database operations;
* authentication;
* interception;
* cleanup;
* custom services and Rings.

The purpose is to share runtime state within one Quest while keeping unrelated tests isolated.

Treat Quest storage as test-scoped runtime state, not application-wide or permanent storage.

## Storage Namespaces

ROA separates stored data into namespaces for different areas of the framework.

Known namespaces include:

```text
StorageKeysUi.UI
StorageKeysApi.API
StorageKeysDb.DB
StorageKeysTest.PRE_ARGUMENTS
```

Use the namespace that matches the kind of state being stored.

Do not treat storage as an unstructured global key/value collection.

## `PRE_ARGUMENTS`

`StorageKeysTest.PRE_ARGUMENTS` is used for information produced by preconditions and consumed by later stages of the test.

Conceptually:

```text
@Journey
   ↓
precondition creates or discovers data
   ↓
result is stored under PRE_ARGUMENTS
   ↓
test retrieves the result
   ↓
test continues with prepared state
```

When a project already provides helpers for accessing Journey outputs, reuse those helpers rather than scattering direct storage access through test classes.

## Project Storage Keys

Projects may define their own storage keys for domain-specific runtime state.

Prefer typed keys, commonly enums, over repeated string literals.

Examples may include:

```text
created entity
entity identifier
authentication state
captured response
runtime-generated value
cleanup target
```

Follow the existing project's key and retrieval conventions.

Before adding a new storage key, verify that an appropriate one does not already exist.

## Store Only Meaningful Shared State

Quest storage should contain information that genuinely needs to cross a lifecycle, service, or Ring boundary.

Good candidates include:

* Journey output required by the test;
* response data required later;
* identifiers needed for cleanup;
* state produced by one Ring and consumed by another;
* values that cannot be known until runtime.

Do not put every local variable into Quest storage.

If a value is used only inside one method or one operation, ordinary local state is usually clearer.

## Data Creation

ROA supports generated test data through `DataCreator`.

A project defines the data types it can create and maps them to the functions responsible for building those values.

Conceptually:

```text
requested test-data type
        ↓
DataCreator
        ↓
matching creator
        ↓
generated model
        ↓
test lifecycle
```

This centralizes reusable test-data construction and avoids duplicating equivalent model creation logic across tests.

## `@Craft`

`@Craft` connects generated data to the test lifecycle.

Conceptually:

```text
@Craft
   ↓
ROA resolves requested data
   ↓
DataCreator creates it
   ↓
generated value is provided to the test
```

Keep reusable model-construction rules inside the project's established data-creation layer.

For the lifecycle role of `@Craft`, see:

`roa-test-lifecycle.md`

## Static Test Data

ROA also supports predefined data through `@StaticTestData`.

Conceptually:

```text
configured test-data source
        ↓
@StaticTestData
        ↓
test receives predefined value
```

Use static data when the scenario intentionally depends on stable project- or environment-configured values.

Avoid shared static entities for state-changing scenarios when they would create test coupling, pollution, or parallel-execution risk.

## Runtime-Dependent Data

Some data cannot be fully known when the test model is first created.

Examples include values that depend on:

* an entity created by a Journey;
* an API response;
* information captured from the UI;
* another runtime-generated value.

ROA supports deferred runtime values through `Late<T>`.

## `Late<T>`

`Late<T>` represents data whose value is resolved later in the test lifecycle.

Conceptually:

```text
create model
   ↓
one value depends on runtime state
   ↓
Late<T>
   ↓
required state becomes available
   ↓
value resolves
   ↓
model is used
```

Use `Late<T>` only when the dependency is genuinely runtime-dependent.

Do not introduce deferred values when the required value is already known at model-creation time.

## Data Flow Through the Lifecycle

Lifecycle mechanisms participate in the same Quest and can exchange state when necessary.

A typical flow may look like:

```text
@Craft
→ creates input model

@Journey
→ prepares prerequisite state

Journey output
→ stored in Quest

Authentication
→ establishes required state

Test
→ retrieves prepared/runtime data

Ring operation
→ produces additional state

Validation
→ consumes relevant data

@Ripper
→ retrieves cleanup information
```

The important principle is that these stages participate in one coordinated test execution rather than behaving as disconnected scripts.

## Data Flow Between Rings

Because Rings operate through the same Quest, runtime state can support cross-Ring scenarios.

For example:

```text
API Ring
   ↓
creates or retrieves entity
   ↓
identifier stored in Quest
   ↓
.drop()
   ↓
UI Ring
   ↓
uses the same entity
```

Or:

```text
UI action
   ↓
captures runtime value
   ↓
Quest Storage
   ↓
another Ring
   ↓
independent verification
```

Use cross-Ring state only when it supports the actual scenario.

Do not introduce additional Rings merely because another capability provides a shortcut.

## Ring-Specific Runtime Data

Individual Rings may store runtime information in their own namespaces.

Examples include:

* API response data in API storage;
* UI-captured runtime data;
* database query results;
* interception output.

The exact storage APIs and access patterns belong to the corresponding Ring documentation and Pandora metadata.

Do not guess Ring-specific storage methods or response-access behavior.

## Data and Cleanup

State created by a test should be designed together with its cleanup requirements.

Conceptually:

```text
create state
      ↓
retain cleanup-relevant identifier
      ↓
test executes
      ↓
@Ripper
      ↓
retrieve retained state
      ↓
DataCleaner removes or restores it
```

Do not rediscover information during cleanup when the test already had the required identifier or state and could retain it safely in the Quest context.

For Rippers and cleanup behavior, see:

`roa-test-lifecycle.md`

## Test Isolation

Data and storage design directly affect reliability.

Avoid:

* mutable static state shared between tests;
* one test depending on data created by another unrelated test;
* shared entities modified unpredictably;
* storage keys that overwrite unrelated values;
* cleanup that assumes another test has already executed.

Prefer:

* test-scoped state;
* independently generated data;
* deterministic preconditions;
* clear ownership of created entities;
* cleanup tied to the scenario that created the state.

This is especially important when tests may execute in parallel.

## Sequential Tests

`BaseQuestSequential` intentionally allows a Quest to be shared across a test class lifecycle.

When sequential behavior is used, shared state should be deliberate and part of the scenario design.

Do not use sequential execution merely to compensate for missing independent setup.

For the distinction between `BaseQuest` and `BaseQuestSequential`, see:

`roa-core-architecture.md`

## Core Principles

* Treat Quest storage as test-scoped runtime state.
* Use the appropriate storage namespace.
* Prefer typed project storage keys over repeated string literals.
* Reuse existing storage helpers and project conventions.
* Store only information that genuinely needs to cross boundaries.
* Use `DataCreator` for reusable generated test-data construction.
* Use `@Craft` when generated data should be provided through the lifecycle.
* Use `@StaticTestData` for deliberately predefined values.
* Use `Late<T>` only for genuinely runtime-dependent data.
* Preserve Journey outputs when later stages need them.
* Keep cleanup-relevant state available to the cleanup lifecycle.
* Avoid uncontrolled mutable static state and unintended cross-test coupling.
* Design data ownership and cleanup with parallel execution in mind.
* Use Pandora rather than guessing exact ROA storage or data APIs.

## Further Reference

For Quest, Rings, `.drop()`, validation, and `.complete()`:

`roa-core-architecture.md`

For `@Craft`, Journeys, authentication, interception, and Rippers:

`roa-test-lifecycle.md`

For custom services and Rings that consume or produce shared runtime state:

`roa-custom-services-and-rings.md`

For exact ROA storage types, methods, creation strategies, available options, and usages:

`pandora-overview.md`