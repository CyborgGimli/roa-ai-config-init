# UI Component Model

ROA UI automation separates reusable interaction behavior from application-specific element locations.

The component model defines **what kind of UI control an element represents**, **how that kind of control behaves**, and **where a particular application element is located**.

## Mental Model

```text
Component Type
→ identifies the kind or implementation family of a UI control

Component Implementation
→ defines how that component is interacted with

Element Definition
→ identifies a concrete application element
  and associates it with a component type
```

Conceptually:

```text
application element
        ↓
typed element definition
        ↓
component type
        ↓
registered component implementation
        ↓
ROA UI interaction
```

This separation allows interaction behavior to be reused across many application elements.

## Component Types

A component type represents a specific kind or implementation family of UI component.

For example, an application may contain visually similar controls implemented by different UI technologies or component libraries.

Conceptually:

```text
Button
├── implementation type A
└── implementation type B
```

The component type lets ROA select the appropriate interaction behavior without requiring tests to understand those implementation details.

Use existing project component types before introducing new ones.

## Component Implementations

A component implementation defines how ROA interacts with a particular component type.

It may encapsulate behavior such as:

* clicking;
* entering or retrieving values;
* selecting options;
* determining state;
* component-specific synchronization;
* other supported interactions.

Project implementations may be associated with component types through ROA metadata such as:

```java
@ImplementationOfType
```

The exact interfaces, annotation attributes, methods, and registration behavior must be verified from the repository and Pandora metadata.

Do not invent component implementation contracts.

## Element Definitions

An element definition represents a concrete control in the application.

It typically combines:

```text
locator
+
component type
+
optional synchronization behavior
```

Conceptually:

```text
LOGIN_BUTTON
→ verified application locator
→ appropriate button component type
→ synchronization requirements
```

Tests should reference typed element definitions rather than duplicating locators or component-selection logic.

For detailed element and synchronization guidance, see:

`ui-elements-and-synchronization.md`

## Why the Separation Matters

Without the component model, individual tests or elements may duplicate technical interaction logic.

For example:

```text
element A
→ custom click behavior

element B
→ same custom click behavior

element C
→ same custom click behavior
```

With a reusable component implementation:

```text
component implementation
        ↓
element A
element B
element C
```

Changes to interaction behavior can then be made in the appropriate component abstraction rather than repeated across tests.

## Reuse Existing Component Types

Before creating a new component type or implementation:

1. inspect the project's existing component types;
2. inspect implementations already associated with similar controls;
3. verify the actual application component through DevTools;
4. determine whether an existing implementation already supports the required behavior;
5. introduce a new component abstraction only when the application genuinely requires different interaction behavior.

Do not create a new component type merely because a new element has been added.

## Application Discovery

Component modeling must be grounded in the actual application.

Inspect the rendered control to determine:

* DOM structure;
* underlying component technology;
* interaction behavior;
* relevant states;
* synchronization needs;
* whether an existing component implementation fits.

Do not choose a component type solely from the control's visual appearance.

For discovery guidance, see:

`ui-application-discovery.md`

## Component Responsibility

Keep reusable component behavior inside the component implementation.

Keep application-specific information inside element definitions.

Conceptually:

```text
Component implementation
→ reusable interaction behavior

Element definition
→ application-specific location and configuration

Test
→ business scenario
```

Do not move raw application locators into reusable component implementations.

Do not duplicate low-level component interaction logic inside tests.

## Synchronization

Some component behavior may require synchronization before or after interaction.

ROA element definitions may support synchronization metadata associated with the element.

Use the established synchronization model rather than embedding arbitrary waits inside component implementations or tests.

Component-specific synchronization should represent actual application behavior and remain reusable where appropriate.

For detailed guidance, see:

`ui-elements-and-synchronization.md`

## Specialized Components

Some application controls may require richer behavior than basic buttons, inputs, or links.

Examples may include:

* custom selects;
* date pickers;
* complex widgets;
* framework-specific controls;
* composite interactive components.

Before creating a specialized component implementation, verify that:

* the existing ROA capability does not already support it;
* the project does not already contain an appropriate implementation;
* the actual application behavior requires specialized interaction.

Avoid unnecessary component proliferation.

## Component Model and Services

UI services operate on typed element definitions and their associated component behavior.

Conceptually:

```text
AppUiService
        ↓
button / input / select / other UI service
        ↓
typed element
        ↓
component type
        ↓
component implementation
        ↓
browser interaction
```

Tests should stay at the appropriate service and element abstraction level rather than interacting directly with the underlying driver.

## Project-Owned Implementations and Pandora

Component implementations are an important ROA extension point.

Pandora may expose project-discovered component options through the options field (`aiCompassOptions`; `availableOptions` on older Pandora releases).

Use Pandora when exact information is required about:

* supported component interfaces;
* implementation annotations;
* creation strategy;
* available project implementations;
* methods and parameters;
* supported component types.

If the options field indicates that project implementations are relevant, follow the Pandora metadata rather than inventing an unsupported implementation.

## AI Teacher

When a new Java component type or implementation must be created, use the `ai-teacher` skill before generating code.

AI Teacher provides project-approved implementation patterns.

Pandora remains responsible for exact ROA framework contracts.

## Core Principles

* Separate component type, component implementation, and element definition responsibilities.
* Reuse existing project component types and implementations before creating new ones.
* Ground component selection in actual application behavior.
* Keep reusable interaction logic inside component implementations.
* Keep application-specific locators inside typed element definitions.
* Do not duplicate low-level interaction logic in tests.
* Do not create a new component abstraction merely because a new element exists.
* Use established synchronization mechanisms rather than arbitrary waits.
* Use AI Teacher before generating new Java component implementation code.
* Use Pandora rather than guessing exact ROA component contracts or available implementations.

## Further Reference

For the overall ROA UI architecture:

`ui-architecture.md`

For actual application and DOM discovery:

`ui-application-discovery.md`

For typed elements and synchronization:

`ui-elements-and-synchronization.md`

For model-driven data insertion:

`ui-data-insertion.md`

For table-specific UI abstractions:

`ui-tables.md`
