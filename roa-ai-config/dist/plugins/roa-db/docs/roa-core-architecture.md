# ROA Core Architecture

Ring of Automation (ROA) is a test-automation framework built around a shared execution context called a **Quest** and a set of pluggable automation capabilities called **Rings**.

This document defines the core ROA mental model. Lifecycle, data/storage, extension, API, and UI behavior are documented separately.

## Mental Model

```text
Test
  ↓
Quest
  ↓
quest.use(RING)
  ↓
Ring-specific service
  ↓
actions and validations
  ↓
.drop()
  ↓
Quest / another Ring
  ↓
.complete()
```

The **Quest** coordinates the test.

**Rings** expose specialized automation capabilities.

A test can move between Rings while remaining inside the same Quest and sharing the same test execution context.

## Quest

`Quest` is the central execution context of an ROA test.

It coordinates framework-level concerns such as:

* Ring access;
* test-scoped state;
* validation;
* transitions between capabilities;
* final test completion.

Tests should work through their Quest rather than constructing independent framework services when ROA already provides the required capability.

The Quest allows multiple ROA capabilities and lifecycle mechanisms to participate in one coherent test execution.

## Base Quest Types

ROA provides base test types that manage the Quest lifecycle.

### `BaseQuest`

Use `BaseQuest` when each test method should have its own Quest.

This is the normal model for independent tests where execution state should not be shared between test methods.

### `BaseQuestSequential`

Use `BaseQuestSequential` when a test class intentionally requires a Quest shared across the class lifecycle.

Sequential shared state should be a deliberate part of the test design.

Prefer independent tests unless the scenario genuinely requires sequential execution.

## Rings

A Ring represents an automation capability available through the Quest.

ROA provides Rings for capabilities such as:

* UI automation;
* API automation;
* database interaction;
* custom or domain-specific automation.

Projects may also register their own Ring implementations or custom Rings.

A project Ring registry maps Ring identifiers to the service implementations that provide those capabilities.

## Using a Ring

A Ring is entered through the Quest:

```java
quest.use(RING_OF_API)
```

or:

```java
quest.use(RING_OF_UI)
```

The selected Ring exposes the fluent operations belonging to that capability.

Use the appropriate Ring abstraction rather than introducing independent low-level clients, drivers, or equivalent infrastructure when ROA already provides the required capability.

## Fluent Composition

ROA allows a test to move between capabilities without losing its Quest context.

A Ring flow can return to the Quest through:

```java
.drop()
```

Conceptually:

```text
Quest
  ↓
API Ring
  ↓
API actions
  ↓
.drop()
  ↓
Quest
  ↓
UI / DB / Custom Ring
  ↓
additional actions or validation
```

Each Ring remains responsible for its own capability while the Quest provides the shared execution context.

Use multiple Rings only when the scenario benefits from multiple capabilities.

## Validation

ROA supports validation within the Quest and Ring execution flow.

Validation may use framework mechanisms such as:

```java
.validate(...)
```

ROA supports both soft and hard validation patterns.

Soft validation allows multiple assertion failures to be collected before the Quest is finalized.

Hard validation can stop execution when the asserted condition fails.

Use the validation style appropriate to the scenario and follow the conventions already established by the project.

## Test Completion

A Quest-based test is finalized through:

```java
.complete()
```

Completion is part of the ROA execution model.

It finalizes the Quest and allows accumulated validation results to be resolved.

A normal ROA flow therefore ends explicitly:

```text
prepare test context
        ↓
use one or more Rings
        ↓
perform actions and validations
        ↓
.complete()
```

Do not omit completion from a Quest-based test unless the framework usage being implemented explicitly establishes another valid pattern.

## Test-Scoped State

The Quest provides the context through which runtime state can be shared across the current test execution.

That state may be used by:

* test code;
* Journeys and other lifecycle mechanisms;
* Ring operations;
* authentication;
* request interception;
* cleanup;
* custom services.

Test-scoped state should use the established ROA storage model rather than uncontrolled global or static mutable state.

For storage namespaces, generated data, runtime values, and data flow between lifecycle stages or Rings, see:

`roa-data-and-storage.md`

## Test Lifecycle

ROA provides lifecycle mechanisms for preparing, executing, and cleaning up automation scenarios.

Framework-wide lifecycle concepts include:

* generated test data;
* Journeys and reusable preconditions;
* authentication;
* static test data;
* request interception;
* cleanup through Rippers.

These mechanisms operate around the same Quest and should support the behavior under test rather than replace it.

For lifecycle ordering and the responsibilities of these mechanisms, see:

`roa-test-lifecycle.md`

## Custom Services and Rings

ROA can be extended with project-specific services and capabilities.

Custom services can encapsulate meaningful reusable domain automation flows.

Custom Rings can expose genuinely new capabilities through the same Quest model when the project requires them.

Extensions should build on the ROA architecture rather than bypass it.

For custom services, Ring registration, custom Rings, and cross-Ring composition, see:

`roa-custom-services-and-rings.md`

## Knowledge Sources

Use the appropriate source for the question being answered:

```text
ROA documentation
→ framework concepts and architecture

Pandora
→ exact ROA framework metadata and usage

AI Teacher
→ curated project-approved Java implementation patterns

Existing repository
→ current project structure, abstractions, and conventions
```

Do not guess exact ROA methods, constructors, annotations, options, or extension contracts when they materially affect implementation.

Use Pandora when exact framework usage must be established.

## Core Principles

* Treat the Quest as the central execution context of an ROA test.
* Access automation capabilities through Rings.
* Reuse existing project Rings, services, and abstractions before creating new ones.
* Keep capability-specific behavior inside the appropriate Ring or service.
* Use `.drop()` when returning from a Ring to the Quest for further composition.
* Finalize Quest-based tests with `.complete()`.
* Keep test-scoped state inside the established ROA storage model.
* Use lifecycle mechanisms for reusable setup, data, authentication, interception, and cleanup.
* Introduce custom services or Rings only when they represent a meaningful reusable abstraction or capability.
* Use Pandora instead of guessing exact ROA framework behavior.

## Further Reference

For lifecycle annotations, Journeys, authentication, generated data, interception, and Rippers:

`roa-test-lifecycle.md`

For Quest storage, namespaces, `DataCreator`, `Late<T>`, and runtime data flow:

`roa-data-and-storage.md`

For custom services, custom Rings, Ring registration, and domain-level extension patterns:

`roa-custom-services-and-rings.md`

For exact ROA framework metadata and usage:

`pandora-overview.md`

For curated project-approved Java implementation patterns:

`ai-teacher-overview.md`

