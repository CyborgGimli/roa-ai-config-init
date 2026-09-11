# UI Application Discovery

ROA UI automation must be grounded in the actual application.

Use browser and DevTools inspection to verify DOM structure, stable locators, component behavior, synchronization needs, network activity, and session state before implementing UI automation that depends on them.

Do not guess UI details.

## Mental Model

```text
actual application
      ↓
browser / DevTools inspection
      ↓
verified DOM and runtime behavior
      ↓
ROA UI modeling
      ↓
test implementation
```

The application defines what exists in the browser.

ROA defines how that verified behavior is represented and automated.

## What to Discover

Inspect only the application details required by the task.

Relevant discovery may include:

* DOM structure;
* element attributes;
* stable locator candidates;
* component type and behavior;
* visibility and enabled state;
* dynamic rendering;
* navigation behavior;
* synchronization conditions;
* form structure;
* table structure;
* authentication/session state;
* network requests and responses.

Do not inspect the entire application when focused discovery is sufficient.

## DOM Inspection

Use the actual rendered DOM rather than assumptions from:

* screenshots;
* labels;
* visual position;
* CSS appearance;
* naming conventions;
* previous versions of the page.

Verify the element that the user actually interacts with.

A visually obvious control may be implemented through nested or framework-generated DOM that affects locator and component design.

## Locator Discovery

Choose locators from verified application structure.

Prefer stable application identifiers or attributes where available.

Avoid relying on:

* fragile DOM depth;
* generated CSS classes;
* positional selectors;
* dynamic identifiers;
* text that changes frequently;
* selectors inferred without inspection.

The best locator is the simplest stable locator that uniquely identifies the intended element in the actual application.

## Existing Element Definitions

Before introducing a new locator or element definition:

1. inspect the repository for an existing element representing the same control;
2. verify that it still matches the current application;
3. reuse or update it when appropriate;
4. create a new definition only when necessary.

Do not duplicate element definitions because another test reaches the same control through a different path.

## Component Behavior

Determine what kind of control the application actually exposes.

Examples may include:

* button;
* input;
* select;
* link;
* checkbox;
* radio control;
* date picker;
* modal;
* table;
* custom framework widget.

The visual appearance alone is not enough to establish component behavior.

Inspect how the element behaves and which DOM structure or attributes support that behavior.

For ROA component modeling, see:

`ui-component-model.md`

## Synchronization Discovery

Observe what must become true before an interaction is safe.

Relevant conditions may include:

* element appears;
* element becomes visible;
* element becomes enabled;
* previous element disappears;
* navigation completes;
* loading indicator disappears;
* application state changes;
* network-driven content becomes available.

Do not replace discovery with arbitrary sleep durations.

Use the observed application condition to inform the appropriate ROA synchronization strategy.

For synchronization guidance, see:

`ui-elements-and-synchronization.md`

## Dynamic Elements

When elements are rendered dynamically, verify:

* when they appear;
* what causes them to appear;
* whether their locator remains stable;
* whether their parent or container is replaced;
* whether state transitions require synchronization.

Do not assume an element is always present because it exists after the page has fully settled.

## Forms and Data Entry

When the task involves form automation, inspect:

* field structure;
* labels and identifiers;
* component types;
* required fields;
* dynamic fields;
* ordering dependencies;
* validation behavior;
* submit behavior.

This information may affect element definitions, insertion mappings, and synchronization.

For model-driven insertion, see:

`ui-data-insertion.md`

## Tables

When the task involves tabular UI, inspect:

* table container;
* headers;
* row structure;
* cell structure;
* pagination;
* sorting;
* filtering;
* dynamic loading;
* row actions;
* framework-specific table behavior.

Do not model a table as unrelated individual elements when the application and project architecture support a typed table abstraction.

For table guidance, see:

`ui-tables.md`

## Authentication and Session State

When authentication or session reuse affects the task, inspect the relevant browser state.

This may include:

* cookies;
* local storage;
* session storage;
* redirects;
* authenticated routes;
* login state transitions.

Use this evidence to understand how the application behaves.

Do not expose or copy sensitive authentication material unnecessarily.

For ROA authentication design, see:

`ui-authentication-and-session.md`

## Network Discovery

DevTools network inspection may be required when the test depends on browser requests or responses.

Verify where relevant:

* request URL;
* HTTP method;
* trigger action;
* response timing;
* response content;
* relationship between the request and visible UI behavior.

This is especially important when implementing request interception.

For interception guidance, see:

`ui-network-interception.md`

## Repository and Application

Use both sources for different questions:

```text
Existing repository
→ how this project currently models the UI

Actual application / DevTools
→ what the UI currently is and how it behaves
```

If an existing locator or abstraction no longer matches the application, report the mismatch rather than assuming the repository is still correct.

If the application exposes a structure not yet represented by the project, use the verified discovery as input to the architecture design.

## Discovery and Pandora

Application discovery and Pandora solve different problems.

```text
Application / DevTools
→ DOM, locators, runtime behavior, network activity

Pandora
→ exact ROA UI framework types, methods, options, and usages
```

Do not use Pandora to infer application DOM structure.

Do not use DOM inspection to invent unsupported ROA framework APIs.

## UI Application Investigator

For tasks requiring focused browser or DevTools investigation, use the UI application investigator.

Its responsibility is to return verified application facts without designing or implementing the automation solution.

The architect and implementation workflow should consume those findings rather than rediscovering the same UI context.

## Core Principles

* Ground UI automation in the actual rendered application.
* Inspect only the application areas relevant to the task.
* Never guess selectors, component behavior, or synchronization conditions.
* Prefer stable locators supported by verified DOM evidence.
* Reuse existing project element definitions when they still match the application.
* Observe actual runtime conditions before designing synchronization.
* Inspect authentication/session state only when relevant and keep sensitive values protected.
* Use network inspection when browser traffic materially affects the scenario.
* Report application/repository mismatches rather than hiding them.
* Keep application discovery separate from ROA framework discovery.

## Further Reference

For the overall ROA UI architecture:

`ui-architecture.md`

For component types and implementations:

`ui-component-model.md`

For typed elements and synchronization:

`ui-elements-and-synchronization.md`

For model-driven data insertion:

`ui-data-insertion.md`

For authentication and session handling:

`ui-authentication-and-session.md`

For tables:

`ui-tables.md`

For network interception:

`ui-network-interception.md`

For UI scenario design:

`ui-test-design.md`