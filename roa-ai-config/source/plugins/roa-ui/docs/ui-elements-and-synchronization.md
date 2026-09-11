# UI Elements and Synchronization

ROA UI automation should represent application controls through typed element definitions and use explicit synchronization based on actual application behavior.

This document defines UI-specific guidance for element definitions, locators, synchronization, and interaction readiness.

## Mental Model

```text
actual application element
        ↓
verified locator
        ↓
typed element definition
        ↓
component type
        ↓
before / after synchronization
        ↓
ROA UI interaction
```

The element definition describes where the control exists in the application and how it should participate in the ROA UI model.

Synchronization ensures that interaction happens only when the required application state is ready.

## Typed Element Definitions

Application controls should be represented through the project's established typed element abstraction.

A typed element definition may include:

* locator information;
* component type;
* synchronization metadata;
* other supported ROA element configuration.

Tests should reference typed elements rather than embedding raw selectors directly in test methods.

Conceptually:

```text
LOGIN_BUTTON
→ locator
→ button component type
→ synchronization behavior
```

Reuse existing element definitions before creating new ones.

## Locator Source of Truth

Locators must come from the actual rendered application.

Use browser/DevTools inspection to verify:

* the target element;
* relevant attributes;
* DOM structure;
* uniqueness;
* stability;
* dynamic behavior.

Do not guess locators from screenshots, labels, visual position, or naming conventions.

For discovery guidance, see:

`ui-application-discovery.md`

## Locator Quality

Prefer the simplest stable locator that uniquely identifies the intended element.

Avoid fragile selectors based on:

* deeply nested DOM structure;
* generated CSS classes;
* positional indexes;
* unstable dynamic identifiers;
* incidental styling;
* transient text;
* assumptions about page structure.

If an existing locator is brittle or no longer matches the application, investigate and correct the representation rather than layering additional workarounds on top of it.

## Reuse Existing Elements

Before creating a new element definition:

1. search the repository for the same application control;
2. verify the existing locator against the current application;
3. inspect its associated component type and synchronization;
4. reuse or update it where appropriate;
5. create a new element only when no valid abstraction already exists.

Do not create duplicate definitions for the same control merely because another test reaches it through a different scenario.

## Component Type

Each element should use the component type that matches its actual application behavior and project architecture.

Do not select a component type based only on appearance.

Verify the underlying control and reuse an existing project component type when it already provides the required behavior.

For component modeling, see:

`ui-component-model.md`

## Synchronization

UI synchronization should represent a real condition that must become true before or after an interaction.

Examples may include:

* element becomes present;
* element becomes visible;
* element becomes enabled;
* loading state disappears;
* navigation completes;
* content is rendered;
* another element disappears;
* application state changes.

Do not treat synchronization as a fixed delay problem.

## Before Synchronization

Some elements require a condition before interaction.

Conceptually:

```text
wait for required state
        ↓
interact with element
```

Use the project's supported ROA element synchronization mechanism when the condition belongs to that element interaction.

Do not repeat the same pre-interaction wait manually across tests when it can be modeled once in the appropriate abstraction.

## After Synchronization

An interaction may also require waiting for a resulting application state.

Conceptually:

```text
interact with element
        ↓
wait for resulting state
        ↓
continue scenario
```

Examples might include:

* modal opens;
* page navigation completes;
* loading indicator disappears;
* dependent content appears.

Model the condition that actually represents completion of the action.

## Avoid Arbitrary Sleeps

Do not use fixed sleeps as a substitute for understanding application readiness.

Avoid patterns such as:

```java
Thread.sleep(...);
```

or equivalent arbitrary delays when a deterministic application condition can be observed.

Fixed waits:

* slow down tests;
* hide synchronization defects;
* remain flaky across environments;
* do not prove that the application is ready.

Use explicit framework synchronization based on actual state instead.

## Avoid Broad Waits

Do not solve a local synchronization problem with an unnecessarily broad global timeout or generic wait.

The synchronization should be as specific as practical to the condition required by the scenario.

Conceptually:

```text
bad
→ wait a long time and hope the page is ready

better
→ wait until the required control or application state is ready
```

## Dynamic Elements

For dynamically rendered elements, inspect:

* when the element enters the DOM;
* whether the same DOM node is updated or replaced;
* which state indicates readiness;
* whether locator attributes remain stable;
* what action triggers rendering.

Use this evidence to determine both locator and synchronization design.

Do not assume that an element discovered after the page settles is available immediately during test execution.

## Interaction and Synchronization Responsibility

Keep synchronization at the most appropriate reusable level.

Conceptually:

```text
element-specific readiness
→ element synchronization

component-specific behavior
→ component implementation

scenario-specific state transition
→ test or domain flow
```

Do not hide unrelated business-flow waits inside generic component implementations.

Do not duplicate element-specific readiness logic throughout tests.

## Validation Is Not Synchronization

A wait condition and a test assertion serve different purposes.

```text
Synchronization
→ establish that interaction can safely continue

Validation
→ prove that the application behaved correctly
```

Do not treat a synchronization condition as sufficient business validation.

For example, waiting for a success message to appear may establish readiness for the next step, but the test may still need an explicit assertion if that message is part of the required outcome.

## Elements and Data Insertion

Elements used by model-driven insertion must still follow the normal typed element and synchronization rules.

The insertion layer should reuse verified element definitions rather than define separate locators for the same controls.

For insertion guidance, see:

`ui-data-insertion.md`

## Elements and Tables

Table abstractions may internally depend on typed locators or element definitions.

Do not duplicate table cells, headers, or row controls as unrelated elements when the established table model already owns them.

For table guidance, see:

`ui-tables.md`

## Repository, Application, and Pandora

Use each source for its own responsibility:

```text
Actual application / DevTools
→ real DOM, locator candidates, runtime readiness

Existing repository
→ current element definitions, component types, and synchronization conventions

Pandora
→ exact ROA element and synchronization metadata, methods, options, and usages
```

Do not use Pandora to infer application selectors.

Do not use DOM inspection to invent unsupported ROA synchronization APIs.

## AI Teacher

When new Java element enums, synchronization helpers, or related implementation classes must be created, use the `ai-teacher` skill before generating code.

AI Teacher provides project-approved Java patterns.

Pandora remains the source for exact ROA framework contracts.

## Core Principles

* Represent application controls through typed element definitions.
* Ground every locator in actual application inspection.
* Reuse existing element definitions before creating new ones.
* Prefer stable, unique locators over brittle structural selectors.
* Associate elements with the correct component type.
* Model synchronization around observable application conditions.
* Prefer reusable before/after synchronization over duplicated waits.
* Do not use arbitrary sleeps to hide timing problems.
* Keep synchronization separate from business validation.
* Keep synchronization responsibility at the appropriate abstraction level.
* Use AI Teacher before generating new Java implementation code.
* Use Pandora rather than guessing exact ROA element or synchronization behavior.

## Further Reference

For the overall ROA UI architecture:

`ui-architecture.md`

For application and DOM discovery:

`ui-application-discovery.md`

For component types and implementations:

`ui-component-model.md`

For model-driven insertion:

`ui-data-insertion.md`

For table interaction:

`ui-tables.md`

For UI scenario design and assertions:

`ui-test-design.md`
