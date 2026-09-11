# ROA UI Architecture

ROA UI automation is built on the shared Quest/Ring model and uses the UI Ring to interact with the application through typed project abstractions.

This document defines the architectural role of UI automation. Application discovery, component modeling, elements, synchronization, insertion, authentication, tables, interception, and test design are documented separately.

## Mental Model

```text
Test
  ↓
Quest
  ↓
quest.use(RING_OF_UI)
  ↓
AppUiService
  ↓
typed UI services / components / elements
  ↓
application interaction
  ↓
validation
  ↓
.drop()
  ↓
Quest / another Ring
  ↓
.complete()
```

The Quest remains the shared execution context.

The UI Ring owns browser-facing automation behavior.

Project UI abstractions should sit on top of that capability rather than bypass it.

## UI Capability

UI tests should access application interaction through the established ROA UI capability.

Conceptually:

```java
quest.use(RING_OF_UI)
```

The UI Ring exposes the application's configured UI services through the project UI abstraction.

Exact methods and supported operations must come from the current repository and Pandora metadata rather than assumptions.

## `AppUiService`

`AppUiService` acts as the project-facing UI facade over the available ROA UI services.

It provides access to capabilities such as:

* browser interaction;
* buttons;
* inputs;
* links;
* selects;
* alerts;
* tables;
* interception;
* data insertion;
* validation.

The exact services available to a project should be established from the repository and Pandora.

Tests should use the configured UI abstraction rather than instantiate low-level drivers or framework services directly.

## Component-Oriented UI Model

ROA UI automation separates:

```text
component type
→ what kind of UI component this is

component implementation
→ how that component behaves

element definition
→ where the component exists in the application
```

This allows the same logical component behavior to be reused across many application elements.

For the detailed component model, see:

`ui-component-model.md`

## Typed Elements

Application elements should be represented through typed element definitions rather than raw selectors inside tests.

An element definition may carry:

* locator information;
* component type;
* synchronization behavior;
* other supported ROA metadata.

Conceptually:

```text
application element
        ↓
typed element definition
        ↓
component type
        ↓
ROA UI interaction
```

Tests should express intent through these abstractions instead of duplicating locator and interaction logic.

For elements and synchronization, see:

`ui-elements-and-synchronization.md`

## Application Discovery

UI architecture must be grounded in the actual application.

Use browser/DevTools inspection when implementation depends on:

* DOM structure;
* stable locators;
* component behavior;
* visibility or enablement;
* network requests;
* authentication/session state;
* application-specific UI behavior.

Do not guess selectors or component structure from screenshots, names, or assumptions.

For discovery guidance, see:

`ui-application-discovery.md`

## Synchronization

Synchronization is part of UI architecture, not an afterthought.

Interactions should use established ROA synchronization mechanisms associated with elements or components where appropriate.

Avoid:

* arbitrary sleeps;
* duplicated polling;
* broad waits that hide timing problems;
* local workarounds that bypass established synchronization behavior.

For synchronization patterns, see:

`ui-elements-and-synchronization.md`

## Data Insertion

ROA UI automation can map model data to typed UI elements for reusable form population.

Conceptually:

```text
test data model
        ↓
insertion metadata
        ↓
typed UI elements
        ↓
UI insertion service
        ↓
application form
```

Use insertion when the scenario benefits from reusable model-driven data entry.

Do not force insertion abstractions onto trivial interactions where direct typed UI operations are clearer.

For detailed behavior, see:

`ui-data-insertion.md`

## Authentication and Session

UI authentication should use the project's established ROA authentication mechanism.

When login itself is not under test, the project may reuse authenticated browser state such as:

* cookies;
* local storage;
* session information;
* other supported browser state.

Do not repeatedly automate login when the project already provides a valid authentication lifecycle mechanism.

When login is the behavior under test, exercise it directly.

For details, see:

`ui-authentication-and-session.md`

## Tables

ROA UI automation supports typed table interaction through the project's table abstractions.

Use table-specific modeling when the scenario requires structured interaction with tabular content.

Do not treat a complex table as a collection of unrelated raw locators if the project already provides a reusable table abstraction.

For table-specific guidance, see:

`ui-tables.md`

## Network Interception

UI tests may observe application network behavior through the established interception capability.

Conceptually:

```text
UI action
   ↓
browser network request
   ↓
interception
   ↓
captured response
   ↓
storage / extraction / validation
```

Interception should support the scenario rather than replace visible UI behavior.

For detailed interception guidance, see:

`ui-network-interception.md`

## Domain Services

Projects may build reusable domain-oriented services on top of the UI Ring.

Conceptually:

```text
Test
  ↓
domain UI service
  ↓
AppUiService
  ↓
typed components and elements
```

Use domain services when they represent meaningful reusable behavior.

Do not create wrapper services merely to rename single UI interactions.

For shared extension guidance, see:

`roa-custom-services-and-rings.md`

## Cross-Ring Use

The UI Ring may participate in scenarios involving other capabilities.

For example:

```text
API
→ prepare prerequisite state

UI
→ exercise behavior under test
```

or:

```text
UI
→ perform user action

API / DB
→ independently verify resulting state
```

Supporting Rings must not replace the UI behavior the scenario exists to verify.

## Knowledge Sources

Use each source for its responsibility:

```text
Actual application / DevTools
→ DOM, locators, component behavior, network activity, session state

Existing repository
→ current UI abstractions, elements, services, tests, and conventions

ROA UI documentation
→ UI architecture and design guidance

Pandora
→ exact ROA UI framework metadata and usage

AI Teacher
→ curated project-approved Java implementation patterns
```

Do not use repository assumptions to invent application DOM structure.

Do not use DevTools observations to infer unsupported ROA framework methods.

## Core Principles

* Access UI automation through the established ROA UI Ring.
* Use `AppUiService` and project UI abstractions rather than direct low-level driver code.
* Represent application elements through typed definitions rather than raw selectors in tests.
* Ground locators and component behavior in actual application inspection.
* Keep component type, implementation, and element responsibilities separate.
* Use established synchronization mechanisms instead of arbitrary waits.
* Reuse insertion, table, authentication, interception, and domain abstractions when they fit the scenario.
* Preserve the behavior under test when using supporting Rings or setup.
* Reuse existing project UI abstractions before creating new ones.
* Use Pandora rather than guessing exact ROA UI framework behavior.

## Further Reference

For application and DOM discovery:

`ui-application-discovery.md`

For component types and implementations:

`ui-component-model.md`

For typed elements and synchronization:

`ui-elements-and-synchronization.md`

For model-driven UI insertion:

`ui-data-insertion.md`

For authentication and browser session handling:

`ui-authentication-and-session.md`

For table interaction:

`ui-tables.md`

For network interception:

`ui-network-interception.md`

For UI scenario design and validation:

`ui-test-design.md`

For focused implementation examples:

`ui-examples.md`

For the shared Quest and Ring model:

`roa-core-architecture.md`
