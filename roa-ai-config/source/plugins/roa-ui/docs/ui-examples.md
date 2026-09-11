# UI Examples

This document provides focused examples of how ROA UI automation should be structured.

The examples illustrate architecture and test intent. Exact `io.cyborgcode.roa.*` methods, annotations, options, and supported UI contracts must be verified from the current repository and Pandora metadata before implementation.

## Basic UI Flow

A typical UI test follows this structure:

```text
Quest
  ↓
UI Ring
  ↓
AppUiService
  ↓
typed element / component interaction
  ↓
validation
  ↓
.drop()
  ↓
.complete()
```

Conceptually:

```java
quest.use(RING_OF_UI)
    // interact through AppUiService
    // use typed elements
    // validate meaningful behavior
    .drop()
    .complete();
```

Do not replace ROA UI abstractions with direct driver interaction merely to reproduce this structure.

## Typed Element

Prefer a project element definition over a raw selector in the test.

```java
// Preferred concept
BUTTONS.click(LOGIN_BUTTON);

// Avoid
driver.findElement(By.cssSelector("...")).click();
```

The exact service method and element type must come from the repository and Pandora.

The locator must come from actual application inspection.

## Component Type

A typed element should reference the component type that matches the actual application control.

Conceptually:

```text
LOGIN_BUTTON
→ verified locator
→ project button component type
→ registered component implementation
```

Do not choose a component type based only on visual appearance.

Use DevTools to understand the real control and reuse existing project component types when appropriate.

## Component Implementation

When the application uses a component requiring custom reusable behavior:

```text
component type
        ↓
project component implementation
        ↓
reused by multiple typed elements
```

Do not duplicate the same low-level interaction behavior across several tests or elements.

Use Pandora for the exact ROA extension contract and AI Teacher before generating new Java implementation code.

## Element Synchronization

An element may require synchronization before interaction.

Conceptually:

```text
wait until control is ready
        ↓
interact
```

or after interaction:

```text
interact
        ↓
wait until resulting application state is ready
        ↓
continue
```

Use the project's established ROA synchronization mechanism.

Do not replace deterministic synchronization with:

```java
Thread.sleep(...);
```

when an observable application condition exists.

## Login as Supporting Infrastructure

When login itself is not under test:

```text
@AuthenticateViaUi
        ↓
authenticated browser state
        ↓
test exercises target business behavior
```

Use the project's actual authentication configuration and Pandora metadata.

Do not invent annotation attributes or session-caching behavior.

## Login as the Behavior Under Test

When login is the requirement:

```text
open login page
        ↓
enter credentials
        ↓
submit
        ↓
validate authenticated result
```

Do not use pre-established authenticated session state when doing so would bypass the behavior being tested.

## Generated Form Data

A UI test may receive generated model data through `@Craft`.

Conceptually:

```text
@Craft
   ↓
DataCreator
   ↓
form model
   ↓
UI scenario
```

Use the project's actual `DataCreator` configuration.

Do not invent Craft values or data mappings.

## Data Insertion

For a structured form:

```text
form model
    ↓
@InsertionElement mappings
    ↓
typed UI elements
    ↓
insertion service
    ↓
form populated
```

Conceptually:

```java
// exact API must be verified
ui.insertion()
    .insertData(model);
```

Insertion performs data entry.

It does not validate that the application accepted or processed the data correctly.

## Runtime-Dependent Form Data

A field may depend on state produced earlier in the Quest.

Conceptually:

```text
Journey
→ creates prerequisite entity
→ identifier becomes available

form model
→ contains Late<T>

UI insertion
→ resolves runtime value
→ populates form
```

Use `Late<T>` only where the value genuinely depends on runtime state.

## Positive UI Scenario

A meaningful positive test might follow:

```text
Requirement
→ user can create customer

Setup
→ prepare prerequisite organization

UI
→ open customer form
→ enter valid data
→ submit

Validation
→ expected confirmation appears
→ created customer data is visible
```

The specific assertions should prove the requested behavior rather than merely confirm that the click succeeded.

## Negative Form Scenario

A focused negative test might follow:

```text
Requirement
→ email is mandatory

UI
→ populate otherwise valid form
→ leave email empty
→ submit

Validation
→ required-field error appears
→ submission does not complete
```

Keep the invalid condition deliberate and focused.

## Table Lookup

For a structured table:

```text
customer table
        ↓
find row by customer identifier
        ↓
read or validate target field
```

Prefer stable business data over row position.

Avoid:

```text
row 3
→ assume this is the customer
```

when sorting, filtering, pagination, or new data can change the order.

## Table Row Action

When a row contains actions:

```text
find intended customer row
        ↓
locate action associated with that row
        ↓
perform action
```

Do not locate a generic edit/delete button without proving that it belongs to the intended row.

## Table Validation

Conceptually:

```text
UI action
→ creates entity

table
→ find entity row

assertion
→ expected business value is displayed
```

Finding the row is part of interaction.

The assertion proves the expected state.

## Network Interception

When a UI action produces a runtime value needed later:

```text
configure interception
        ↓
perform UI action
        ↓
browser request occurs
        ↓
response captured
        ↓
extract identifier
        ↓
use identifier for cleanup
```

The interception target and response structure must come from actual DevTools inspection.

The exact ROA interception API must come from Pandora.

## Interception Supporting UI Validation

Valid:

```text
UI action
→ submit form

UI
→ success state is validated

interception
→ capture created entity id for cleanup
```

Invalid when the requirement is user-visible behavior:

```text
UI action
→ submit form

interception
→ response is asserted

UI result
→ never validated
```

The second scenario proves backend traffic, not necessarily the required UI behavior.

## Journey Setup

A reusable UI precondition may use another Ring.

```text
@Journey
→ API creates prerequisite account

Test
→ UI performs behavior under test

@Ripper
→ cleanup
```

Supporting setup must not perform the UI action the test itself exists to verify.

## Cross-Ring Verification

A UI action may be independently verified through another capability.

```text
UI
→ create entity

.drop()

DB
→ verify persisted state
```

or:

```text
UI
→ update entity

.drop()

API
→ verify resulting backend state
```

Use cross-Ring verification only when it materially improves confidence.

## Domain UI Service

When several tests repeatedly perform the same meaningful UI-domain flow:

```text
Test
  ↓
CustomerUiService
  ↓
AppUiService
  ↓
typed elements and components
```

The service should represent reusable domain behavior rather than merely rename individual clicks.

## Locator Change Example

If an existing UI test begins failing:

```text
repository element
→ locator A

actual application
→ locator A no longer identifies target control
```

Do not immediately add broader waits or fallback selectors.

First determine:

```text
application changed
→ update element definition if appropriate

existing locator still valid
→ investigate synchronization or another root cause
```

Use actual DOM evidence.

## Synchronization Failure Example

If a test intermittently fails because a control is unavailable:

```text
failure
→ element not ready

DevTools / runtime observation
→ loading state must disappear first

solution
→ model that readiness condition through established synchronization
```

Do not fix it by increasing arbitrary sleep duration.

## Framework Uncertainty Example

If implementation requires an unfamiliar ROA UI type:

```text
Need
→ configure element synchronization

Repository
→ no relevant example

Pandora
→ inspect exact element/synchronization metadata
```

Do not invent a fluent method or annotation attribute because its name seems likely.

## Project Pattern Example

If a new component implementation, element enum, or UI service must be created:

```text
Need
→ new Java implementation

Existing repository
→ inspect directly relevant code

AI Teacher
→ inspect relevant curated lessons

Pandora
→ verify exact ROA types and extension contracts
```

Use each source for its own responsibility.

## Example Principles

* Treat examples as structural guidance, not substitutes for application inspection or Pandora.
* Use the actual application/DevTools for DOM, locator, network, synchronization, and session truth.
* Use the repository for existing project abstractions and conventions.
* Use Pandora for exact ROA UI framework usage.
* Use AI Teacher before generating new Java implementation code.
* Prefer typed elements, components, and services over raw driver interaction.
* Keep synchronization deterministic and separate from assertion.
* Preserve the UI behavior under test when using setup or supporting Rings.
* Use interception only as supporting evidence when the requirement is user-facing.
* Never copy an example mechanically when the current application or project differs.
