# ROA Custom Services and Rings

ROA can be extended with project-specific services and custom Rings when existing framework capabilities do not fully represent the automation domain.

Extensions should make tests more expressive and reusable while remaining inside the ROA architecture.

This document defines the framework-wide role of custom services, custom Rings, Ring registration, and cross-Ring composition.

## Mental Model

ROA already provides Rings for capabilities such as API, UI, and database interaction.

Projects can build domain abstractions on top of those capabilities:

```text
Quest
  ↓
Built-in Rings
  ├── API
  ├── UI
  └── DB
  ↓
Project-specific services / domain flows
  ↓
Optional custom Ring
```

A reusable abstraction does not automatically require a new Ring.

Use the smallest abstraction that clearly represents the project need.

## Custom Services

A custom service groups reusable automation behavior that belongs to a meaningful project or domain capability.

Examples might include:

```text
CustomerService
OrderService
AccountService
CheckoutService
```

A service may coordinate lower-level ROA operations while exposing a clearer domain-oriented API to tests.

Conceptually:

```text
test
  ↓
domain service
  ↓
reusable automation flow
  ↓
ROA capabilities
```

Custom services are useful when they:

* remove meaningful duplication;
* represent a real domain operation;
* hide repeated technical orchestration;
* improve test readability;
* centralize reusable automation behavior.

Do not create a service merely to rename or wrap a single framework call without adding meaningful abstraction.

## Reuse Existing Services First

Before creating a new custom service:

1. search the repository for related services and flows;
2. inspect similar tests;
3. determine whether an existing abstraction can be extended;
4. check whether the behavior already belongs to a built-in Ring;
5. create a new service only when it provides real reuse or domain clarity.

Avoid competing abstractions for the same responsibility.

## Custom Rings

A custom Ring represents a distinct automation capability that should be available through the Quest like other ROA capabilities.

Conceptually:

```text
Quest
  ↓
quest.use(RING_OF_CUSTOM)
  ↓
project-specific Ring service
  ↓
custom capability
```

A custom Ring should represent a genuine capability rather than a container for unrelated helper methods.

## Ring Registration

The project Ring registry maps Ring identifiers to their service implementations.

This allows the Quest to resolve a capability when the test calls:

```java
quest.use(...)
```

Custom Rings must therefore participate in the project's established registration mechanism.

Before creating or registering a Ring:

* inspect the existing registry;
* reuse the project's conventions;
* verify the relevant ROA extension contract.

Do not invent registration APIs, interfaces, or constructors.

Use Pandora when the exact ROA extension mechanism is not established by the repository.

## Custom Service vs Custom Ring

A custom service does not automatically need to become a Ring.

Use this distinction:

```text
Custom Service
→ reusable domain or automation behavior

Custom Ring
→ distinct capability exposed through Quest
```

Prefer a custom service when the need is primarily reusable behavior.

Consider a custom Ring when the project introduces a capability that should participate directly in Quest-based service resolution and composition.

## Composition With Existing Rings

Custom services and Rings may coordinate existing ROA capabilities.

For example:

```text
Custom/domain flow
        ↓
API Ring
        ↓
create prerequisite state
        ↓
.drop()
        ↓
UI Ring
        ↓
exercise primary behavior
```

Or:

```text
Custom service
        ↓
prepare reusable domain state
        ↓
return control to Quest
        ↓
test continues
```

The abstraction should make the flow easier to reuse without hiding which capability owns the important behavior.

## Cross-Ring Scenarios

A Quest can use multiple Rings when the scenario genuinely benefits from separate capabilities.

Conceptually:

```text
API
→ prepare prerequisite data

UI
→ exercise the behavior under test

DB
→ independently verify persisted state
```

or:

```text
UI
→ perform user action

API
→ verify resulting backend state
```

Use multiple Rings because they improve the scenario, not merely because another Ring offers a shortcut.

## Preserve the Behavior Under Test

Supporting services or Rings may prepare state or perform independent verification, but they should not replace the behavior the test is intended to prove.

For example:

```text
Requirement
→ verify account creation through UI

Valid
→ API prepares prerequisite organization
→ UI creates account

Invalid
→ API creates account
→ UI only verifies that it exists
```

Setup should establish prerequisites.

The primary test action should still exercise the required behavior.

## Custom Services and Lifecycle

Custom services can be reused by lifecycle mechanisms such as Journeys and Rippers.

Conceptually:

```text
Journey
   ↓
custom service
   ↓
prepare state

Test
   ↓
exercise behavior

Ripper
   ↓
cleanup service
   ↓
restore state
```

The service owns reusable behavior.

The lifecycle mechanism determines when that behavior executes.

For lifecycle concepts, see:

`roa-test-lifecycle.md`

## Custom Services and Storage

A custom service may produce runtime information needed elsewhere in the Quest.

When state needs to cross a service, lifecycle, or Ring boundary, use the established Quest storage model.

Conceptually:

```text
custom service
     ↓
produces runtime state
     ↓
Quest Storage
     ↓
test / another Ring / cleanup
```

Keep values local when they are only needed inside the service.

For storage conventions, see:

`roa-data-and-storage.md`

## Keep Abstractions Cohesive

Avoid broad utility abstractions that accumulate unrelated automation behavior, such as:

```text
SomeUtils
CommonUtils
TestUtils
AutomationHelper
```

Prefer services with a clear domain or capability responsibility.

A useful abstraction should answer:

```text
What automation responsibility does this service own?
```

If that cannot be answered clearly, the abstraction may be too broad or unnecessary.

## Keep Tests Understandable

Custom abstractions should remove technical repetition without hiding test intent.

A test should still make clear:

* what behavior is exercised;
* what important state is prepared;
* what result is validated.

Do not hide an entire scenario behind a service until the test method no longer communicates its purpose.

## Knowledge Sources

Use the appropriate source when extending ROA:

```text
Existing repository
→ current services, Rings, registries, and conventions

ROA documentation
→ architectural role of services and Rings

Pandora
→ exact ROA extension types, methods, options, and usage

AI Teacher
→ curated project-approved Java implementation patterns
```

Repository conventions should be reused where appropriate.

Pandora should be consulted when exact ROA extension behavior is uncertain.

AI Teacher should be used when new Java implementation code is being created.

## Core Principles

* Reuse existing ROA and project abstractions before creating new ones.
* Use custom services for meaningful reusable domain behavior.
* Do not create trivial wrapper services without an abstraction benefit.
* Introduce a custom Ring only for a genuine Quest-level capability.
* Follow the project's established Ring registry and service conventions.
* Keep services cohesive and domain-oriented.
* Preserve the behavior under test when using supporting capabilities.
* Use cross-Ring composition only when multiple capabilities materially improve the scenario.
* Keep shared runtime state in Quest storage when it genuinely needs to cross boundaries.
* Let lifecycle mechanisms determine when reusable setup or cleanup services execute.
* Do not bypass established ROA capabilities with independent clients, drivers, or state mechanisms.
* Use Pandora rather than guessing exact ROA extension contracts.

## Further Reference

For Quest, Rings, `.drop()`, validation, and `.complete()`:

`roa-core-architecture.md`

For Journeys, authentication, generated data, interception, and Rippers:

`roa-test-lifecycle.md`

For Quest storage, namespaces, generated/runtime data, and cross-Ring state:

`roa-data-and-storage.md`

For exact ROA extension types, methods, available implementations, and usages:

`pandora-overview.md`

For curated project-approved Java implementation patterns:

`ai-teacher-overview.md`