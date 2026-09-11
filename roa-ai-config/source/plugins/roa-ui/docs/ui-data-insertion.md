# UI Data Insertion

ROA UI automation can map structured test data to typed UI elements so forms and similar input flows can be populated through reusable, model-driven behavior.

This document defines UI-specific guidance for insertion models, element mappings, ordering, synchronization, and when insertion is appropriate.

## Mental Model

```text
test data model
      ↓
insertion metadata
      ↓
typed UI elements
      ↓
ROA insertion service
      ↓
application form
```

The model describes the data.

The insertion mapping connects model fields to UI elements.

The UI layer performs the interaction.

## When to Use Insertion

Use model-driven insertion when a scenario contains meaningful structured data entry that benefits from reuse.

Typical examples include:

* registration forms;
* customer creation;
* account setup;
* multi-field business forms;
* other repeated structured input flows.

Insertion is useful when it removes duplicated field-by-field interaction while keeping the test intent clear.

Do not use insertion merely to avoid writing a small number of simple UI interactions.

## Insertion Elements

ROA supports mappings between model fields and application elements through metadata such as:

```java
@InsertionElement
```

The exact annotation attributes, supported element types, ordering behavior, and insertion APIs must be verified from the repository and Pandora metadata.

Do not invent annotation values or insertion contracts.

## Model-to-Element Mapping

Conceptually:

```text
model field
→ insertion metadata
→ typed element definition
→ component behavior
→ UI value entry
```

For example:

```text
firstName
→ FIRST_NAME_INPUT

email
→ EMAIL_INPUT

country
→ COUNTRY_SELECT
```

The actual mapping must use the project's established ROA insertion mechanism.

## Typed Elements

Insertion must reuse the same typed element definitions used by the rest of the UI architecture.

Do not create separate raw locators solely for insertion.

Conceptually:

```text
normal UI interaction
        +
data insertion
        ↓
same typed element model
```

This keeps locator, component, and synchronization behavior centralized.

For element guidance, see:

`ui-elements-and-synchronization.md`

## Component Behavior

The insertion mechanism depends on the component type associated with each mapped element.

For example, entering data into an input and selecting data from a select control require different component behavior.

The insertion layer should rely on the established component model rather than implementing separate low-level interaction logic.

For component modeling, see:

`ui-component-model.md`

## Ordering

Some forms require fields to be populated in a specific order.

Examples include:

```text
country
→ determines available regions

account type
→ reveals additional fields

parent selection
→ enables dependent control
```

Where ROA insertion metadata supports ordering, use it to represent real interaction dependencies.

Do not impose arbitrary ordering when fields are independent.

The exact ordering mechanism must come from Pandora and existing project usage.

## Synchronization

Insertion does not remove synchronization requirements.

Each mapped element must still be interacted with only when the application is ready.

Reuse synchronization defined by:

* the element;
* the component implementation;
* the relevant project UI abstraction.

Do not add arbitrary sleeps inside insertion flows.

For synchronization guidance, see:

`ui-elements-and-synchronization.md`

## Dynamic Forms

Some forms change according to earlier input.

Examples include:

* fields appearing after a selection;
* dependent dropdowns;
* conditional sections;
* dynamically enabled controls;
* validation-driven state changes.

Before using insertion for such a form, inspect the actual application behavior.

Determine whether:

* insertion ordering is sufficient;
* synchronization is required between fields;
* part of the flow should remain explicit in the test or domain service.

Do not force a highly dynamic interaction into a generic insertion flow if doing so hides important behavior.

## Test Data

Insertion should consume test data from established project mechanisms.

Possible sources include:

* `DataCreator`;
* `@Craft`;
* static configured data;
* `Late<T>`;
* Journey-produced runtime state.

Conceptually:

```text
test data source
        ↓
model
        ↓
insertion
        ↓
UI form
```

Keep data creation separate from UI interaction.

For shared data concepts, see:

`roa-data-and-storage.md`

## Runtime-Dependent Values

A model used for insertion may contain values that are unavailable when the model is initially created.

When the project uses `Late<T>` for such values, allow them to resolve through the established lifecycle before or during the supported insertion flow.

Conceptually:

```text
Journey
→ produces runtime value

model
→ contains Late<T>

insertion
→ resolves required value
→ populates UI
```

Use exact ROA behavior from Pandora rather than assuming how deferred values participate in insertion.

## Validation

Insertion populates the UI.

It does not prove that the application accepted or processed the data correctly.

Conceptually:

```text
insertion
→ performs data entry

validation
→ proves resulting application behavior
```

Tests should still assert the meaningful result required by the scenario.

Do not treat successful form population as sufficient validation.

## Preserve Test Intent

Insertion should reduce repetitive technical interaction without hiding the scenario.

A test should still communicate:

* what data is being entered;
* what business action is performed;
* what result is expected.

Do not hide an entire UI workflow inside generic insertion if important business behavior becomes invisible.

## Reuse Existing Insertion Models

Before creating new insertion mappings:

1. inspect existing project models and insertion annotations;
2. inspect element definitions already used by similar forms;
3. verify the actual application form;
4. reuse or extend existing mappings when appropriate;
5. create new mappings only when required.

Avoid multiple competing insertion models for the same application form without a justified reason.

## Application Discovery

Insertion design must reflect the actual form.

Use browser/DevTools inspection to verify:

* field presence;
* component type;
* dynamic behavior;
* ordering dependencies;
* visibility;
* enabled state;
* synchronization requirements.

Do not design mappings from screenshots or assumptions.

For discovery guidance, see:

`ui-application-discovery.md`

## AI Teacher and Pandora

Use:

```text
AI Teacher
→ project-approved Java patterns for new models or insertion-related classes

Pandora
→ exact ROA insertion annotations, methods, options, and usages
```

Use both when new Java implementation is required.

Do not use AI Teacher to infer framework contracts.

Do not use Pandora to infer project-specific coding style.

## Core Principles

* Use insertion for meaningful reusable structured data entry.
* Reuse typed element definitions rather than defining insertion-specific locators.
* Keep model data, element mappings, and component interaction responsibilities separate.
* Preserve real field-order dependencies where required.
* Reuse established synchronization during insertion.
* Do not use arbitrary sleeps.
* Keep dynamic workflows explicit when generic insertion would hide important behavior.
* Use established test-data mechanisms rather than embedding data creation in UI interaction.
* Treat insertion as interaction, not validation.
* Reuse existing project insertion mappings before creating new ones.
* Use AI Teacher before generating new Java insertion-related code.
* Use Pandora rather than guessing exact ROA insertion behavior.

## Further Reference

For the overall ROA UI architecture:

`ui-architecture.md`

For application and form discovery:

`ui-application-discovery.md`

For component types and implementations:

`ui-component-model.md`

For typed elements and synchronization:

`ui-elements-and-synchronization.md`

For shared test data and `Late<T>`:

`roa-data-and-storage.md`

For UI scenario design and validation:

`ui-test-design.md`
