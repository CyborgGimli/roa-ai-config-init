# UI Test Design

ROA UI tests should prove meaningful user-facing behavior through focused scenarios, verified application interactions, deliberate test data, and assertions grounded in the actual application.

This document defines UI-specific guidance for scenario design, assertions, setup, interaction boundaries, isolation, and failure interpretation.

## Scenario Mental Model

```text
requirement
   ↓
application discovery
   ↓
preconditions / test data
   ↓
UI interaction
   ↓
observable application result
   ↓
meaningful assertions
```

A UI test should make clear:

* what user behavior is being exercised;
* what state and data are required;
* which application interactions matter;
* what visible or resulting evidence proves the behavior.

## Test the User Behavior

Design tests around the requested behavior rather than around individual UI framework calls.

Avoid tests whose purpose is effectively:

```text
click control
→ check something happened
```

Prefer:

```text
perform user workflow
→ observe meaningful application outcome
→ assert the required behavior
```

The UI interaction is the mechanism.

The requirement determines what must be proven.

## Ground Tests in the Actual Application

Before implementing UI behavior that depends on selectors, component structure, synchronization, table behavior, session state, or network activity, verify the actual application through browser/DevTools inspection.

Do not guess:

* locators;
* DOM structure;
* component types;
* timing conditions;
* dynamic behavior;
* network requests;
* session behavior.

For discovery guidance, see:

`ui-application-discovery.md`

## Positive Scenarios

A positive UI scenario should perform valid user behavior and verify the meaningful successful outcome.

Depending on the requirement, evidence may include:

* expected page or view;
* visible application state;
* displayed business data;
* enabled or disabled controls;
* success or confirmation state;
* created or updated information;
* resulting state verified through another Ring where justified.

Do not treat successful clicking or navigation alone as proof when the requirement depends on a business outcome.

## Negative Scenarios

Negative UI scenarios should deliberately create the invalid condition being verified.

Examples may include:

* invalid form input;
* missing required data;
* unauthorized access;
* invalid authentication;
* unsupported user action;
* application validation errors;
* unavailable or disabled behavior.

Keep the invalid condition focused where practical.

Do not combine unrelated failures unless the requirement specifically depends on that combination.

## Assertions

Assertions should prove user-visible or business-relevant behavior.

Useful assertion targets may include:

* text;
* component state;
* visibility;
* enabled or disabled state;
* navigation result;
* table content;
* form validation;
* confirmation or error state;
* resulting application data.

Interaction and assertion are separate responsibilities.

```text
interaction
→ performs the user action

assertion
→ proves the expected result
```

Do not treat successful interaction as validation.

## Assertion Strength

Choose assertions strong enough that the test would fail when the requirement is broken.

Avoid validation that only proves:

* an element exists;
* a page loaded;
* a click completed;
* no exception was thrown;
* a generic message appeared when specific behavior matters.

Prefer the smallest set of assertions that materially proves the scenario.

Do not assert every visible element merely because it is available.

## Elements and Components

Use the project's typed UI elements and component abstractions.

Tests should not contain raw selectors or duplicate low-level interaction behavior when established ROA abstractions already represent the control.

For component modeling, see:

`ui-component-model.md`

For elements and synchronization, see:

`ui-elements-and-synchronization.md`

## Synchronization

Tests must synchronize against observable application conditions.

Do not use arbitrary sleeps to make tests appear stable.

Examples of meaningful readiness conditions may include:

* target element becomes visible;
* control becomes enabled;
* loading state disappears;
* navigation completes;
* dependent content appears;
* application state changes.

Synchronization establishes readiness.

It does not replace assertion.

## Setup and Preconditions

UI tests may require prerequisite state.

Prefer established mechanisms such as:

* Journeys;
* generated data;
* API setup where appropriate;
* authentication lifecycle;
* reusable domain services;
* static data where genuinely suitable.

Setup should create only what the scenario requires.

Do not bury important preconditions in unrelated helper code.

## Preserve the Behavior Under Test

Supporting setup must not perform the same UI behavior the test exists to verify.

For example:

```text
Requirement
→ verify customer creation through UI

Valid setup
→ API creates prerequisite organization
→ UI test creates customer

Invalid setup
→ API creates customer
→ UI test only verifies that customer exists
```

Setup establishes prerequisites.

The test performs the behavior under test.

## Test Data

Use controlled data appropriate to the scenario.

Prefer established project mechanisms such as:

* `DataCreator`;
* `@Craft`;
* static configured data where appropriate;
* `Late<T>`;
* Journey-produced state.

Avoid:

* unexplained hardcoded values;
* accidental dependence on pre-existing state;
* shared mutable entities across unrelated tests.

For shared data guidance, see:

`roa-data-and-storage.md`

## Data Insertion

Use model-driven insertion when structured form population is repeated and the abstraction improves clarity.

Do not force simple interactions into insertion merely to reduce the number of explicit UI calls.

Insertion performs data entry.

The test must still perform and validate the business action.

For insertion guidance, see:

`ui-data-insertion.md`

## Authentication

Use the project's established UI authentication lifecycle when authentication is supporting infrastructure.

When login, logout, session expiration, or access control is the behavior under test, exercise that behavior directly.

Do not allow cached or restored session state to bypass the scenario being verified.

For authentication guidance, see:

`ui-authentication-and-session.md`

## Tables

When a scenario depends on tabular content, use the established typed table abstractions.

Validate the behavior that matters, such as:

* expected row exists;
* expected row is absent;
* cell contains required value;
* filtering produces expected results;
* sorting produces expected order;
* row action affects the intended entity.

Do not rely on row position unless ordering itself is part of the requirement.

For table guidance, see:

`ui-tables.md`

## Network Interception

Use interception only when network data materially supports the UI scenario.

Interception may provide runtime identifiers, response data, or supporting evidence.

It must not silently replace user-facing validation.

For example:

```text
UI action
→ visible success state

interception
→ captures created entity id for cleanup
```

is valid.

But:

```text
UI action
→ network response captured
→ only response is asserted
→ visible UI result ignored
```

does not prove a UI requirement when the visible behavior is what matters.

For interception guidance, see:

`ui-network-interception.md`

## Cleanup

State-changing UI scenarios should consider cleanup during design.

Determine:

```text
what state does the UI action create or modify?
        ↓
can another test observe it?
        ↓
what identifier or state is needed for cleanup?
        ↓
which existing Ripper / DataCleaner should own it?
```

Reuse established cleanup mechanisms.

Cleanup should not depend on another unrelated test having executed first.

## Test Isolation

UI tests should be independently executable unless sequential behavior is intentional.

Avoid:

* test-order dependencies;
* shared mutable browser state;
* one test depending on another test's output;
* reused entities with unpredictable state;
* stale authentication state;
* leftover application data.

Design with parallel execution in mind where relevant.

## Reusable UI Behavior

When several tests repeat meaningful UI-domain behavior, reuse an existing project service or introduce an appropriate abstraction when justified.

Do not hide the entire test behind a service until the scenario no longer communicates:

* what user behavior is exercised;
* what important state is prepared;
* what result is validated.

Reuse technical orchestration without hiding test intent.

## Cross-Ring Setup and Verification

Another Ring may support a UI scenario.

Examples:

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

DB / API
→ independently verify resulting state
```

Use another Ring only when it materially improves the scenario.

Do not introduce cross-Ring complexity when UI evidence is already sufficient.

## Failure Interpretation

A failing UI test does not automatically mean the automation is wrong.

Distinguish between:

* automation defect;
* incorrect expectation;
* locator problem;
* synchronization problem;
* application behavior change;
* application defect;
* authentication/session issue;
* test-data or precondition issue;
* environment or configuration failure;
* incorrect ROA framework usage.

Investigate evidence before changing the test.

Do not weaken assertions, add arbitrary waits, or alter correct expectations merely to obtain a passing result.

## Knowledge Sources

Use each source for its responsibility:

```text
Actual application / DevTools
→ DOM, runtime behavior, synchronization, network and session evidence

Existing repository
→ current UI abstractions, services, elements, tests, and conventions

ROA UI documentation
→ UI automation architecture and design guidance

Pandora
→ exact ROA UI framework metadata and usage

AI Teacher
→ curated project-approved Java implementation patterns
```

Use each source only for the questions it can actually answer.

## Core Principles

* Design UI tests around user behavior, not framework calls.
* Ground interactions in the actual application.
* Use typed elements, components, and project UI abstractions.
* Validate meaningful visible or business outcomes.
* Keep synchronization deterministic and separate from assertion.
* Preserve the behavior under test when using setup or supporting Rings.
* Use controlled, isolated test data.
* Reuse established authentication, lifecycle, insertion, table, interception, and cleanup abstractions.
* Keep tests independently executable where practical.
* Use cross-Ring support only when it materially improves the scenario.
* Investigate failures before changing expectations or synchronization.
* Use Pandora rather than guessing exact ROA UI framework behavior.

## Further Reference

For the overall ROA UI architecture:

`ui-architecture.md`

For actual application discovery:

`ui-application-discovery.md`

For component modeling:

`ui-component-model.md`

For elements and synchronization:

`ui-elements-and-synchronization.md`

For model-driven insertion:

`ui-data-insertion.md`

For authentication and browser session behavior:

`ui-authentication-and-session.md`

For typed tables:

`ui-tables.md`

For network interception:

`ui-network-interception.md`

For focused implementation examples:

`ui-examples.md`
