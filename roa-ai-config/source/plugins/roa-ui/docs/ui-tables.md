# UI Tables

ROA UI automation should represent structured tabular content through the project's established table abstractions rather than treating rows, cells, and actions as unrelated raw elements.

This document defines UI-specific guidance for table modeling, field mapping, row selection, filtering, sorting, pagination, and validation.

## Mental Model

```text
application table
      ↓
typed table abstraction
      ↓
field definitions
      ↓
row / cell operations
      ↓
validation or action
```

A table abstraction should make structured data interaction clearer while preserving the actual application behavior.

## When to Use a Table Abstraction

Use a table-specific abstraction when the UI presents meaningful structured rows and columns that tests need to interact with repeatedly.

Typical scenarios may include:

* locating a row by business data;
* reading a cell;
* clicking a row action;
* validating table content;
* filtering;
* sorting;
* pagination;
* selecting a row for a later operation.

Do not introduce a table abstraction for a trivial layout that is not semantically tabular.

## Application Discovery

Table modeling must be grounded in the actual rendered application.

Inspect:

* table container;
* header structure;
* row structure;
* cell structure;
* unique row identifiers;
* action controls;
* sorting behavior;
* filtering behavior;
* pagination;
* lazy or dynamic loading;
* component-library-specific behavior.

Do not infer table structure from screenshots or visual layout alone.

For discovery guidance, see:

`ui-application-discovery.md`

## Typed Table Fields

Projects may represent table columns or fields through typed definitions such as `TableField` or equivalent project abstractions.

Conceptually:

```text
table column
→ typed field definition
→ row/cell lookup
```

Use the repository and Pandora metadata to establish the exact supported table model.

Do not invent field interfaces, constructors, methods, or registration behavior.

## Row Identification

Select rows using stable business-relevant data where possible.

Conceptually:

```text
target customer
→ locate row by customer identifier or other stable value
→ perform action on that row
```

Avoid relying on row position when the position can change due to:

* sorting;
* filtering;
* pagination;
* new data;
* asynchronous loading.

Use positional access only when row order itself is part of the scenario.

## Cell Access

Access cells through the established table abstraction rather than constructing fragile row-and-column selectors repeatedly.

The table model should preserve the relationship between:

```text
row
+
field
=
target cell
```

Keep reusable column knowledge centralized according to project conventions.

## Row Actions

Tables often contain controls associated with a specific row, such as:

* edit;
* delete;
* open;
* select;
* expand;
* contextual menu actions.

A row action must target the intended row based on verified table structure.

Do not locate a generic action button without proving that it belongs to the expected row.

## Filtering

When testing or using table filters, distinguish between:

```text
filter as setup
→ narrow the table so another behavior can be exercised

filter as behavior under test
→ validate that filtering itself works correctly
```

If filtering is only setup, use the simplest valid project abstraction.

If filtering is under test, validate the resulting table state explicitly.

## Sorting

When sorting matters, verify the actual application behavior.

Do not assume:

* default sort direction;
* sort stability;
* lexical vs numeric ordering;
* server-side vs client-side sorting.

If sorting is the behavior under test, assert the resulting order using meaningful table data.

## Pagination

When a target row may exist outside the current page, use the project's established pagination behavior.

Do not assume the first page contains the required row.

If pagination itself is under test, validate:

* navigation behavior;
* page transitions;
* item boundaries;
* resulting content.

The exact pagination approach should follow actual application behavior and project conventions.

## Dynamic Tables

Some tables load or update asynchronously.

Examples include:

* server-side pagination;
* lazy loading;
* live refresh;
* asynchronous filtering;
* row replacement after actions.

Observe the actual runtime condition that indicates readiness.

Do not use arbitrary sleeps to wait for table updates.

For synchronization guidance, see:

`ui-elements-and-synchronization.md`

## Validation

Table interaction and table validation are separate responsibilities.

Conceptually:

```text
table lookup
→ finds row or cell

assertion
→ proves expected application state
```

Examples of meaningful validation may include:

* expected row exists;
* expected row does not exist;
* a cell contains the required value;
* a row reflects a completed action;
* filtering returns the correct data;
* sorting produces the expected order.

Do not treat successful row lookup as proof of every table-related requirement.

## Reuse Existing Table Models

Before creating new table definitions:

1. inspect the repository for an existing table abstraction;
2. inspect existing field definitions;
3. verify the current application table;
4. reuse or extend the existing model when appropriate;
5. create new table structures only when necessary.

Avoid multiple competing representations of the same table.

## Tables and Typed Elements

Table-specific abstractions may use typed element definitions internally.

Keep table structure within the table model rather than duplicating the same cells, headers, or actions as unrelated global elements.

Use normal typed element abstractions for controls that genuinely exist outside the table model.

## Tables and Domain Services

A reusable domain service may encapsulate meaningful table behavior when several tests repeatedly perform the same business operation.

For example:

```text
CustomerService
→ find customer row
→ open customer details
```

Do not create domain services merely to hide one simple table lookup.

## Repository, Application, and Pandora

Use each source for its responsibility:

```text
Actual application / DevTools
→ real table DOM, runtime behavior, filtering, sorting, pagination

Existing repository
→ current table abstractions, fields, and conventions

Pandora
→ exact ROA table types, methods, options, and usages
```

Do not use Pandora to infer application table structure.

Do not use DOM inspection to invent unsupported ROA table APIs.

## AI Teacher

When new Java table definitions, fields, or related implementation classes must be created, use the `ai-teacher` skill before generating code.

AI Teacher provides project-approved Java patterns.

Pandora remains responsible for exact ROA framework contracts.

## Core Principles

* Use typed table abstractions for meaningful structured tabular interaction.
* Ground table modeling in actual application inspection.
* Reuse existing table definitions and fields before creating new ones.
* Identify rows through stable business-relevant data where possible.
* Avoid positional assumptions unless ordering is part of the scenario.
* Keep row actions associated with the intended row.
* Treat filtering, sorting, and pagination according to whether they are setup or behavior under test.
* Synchronize against real table readiness conditions rather than arbitrary delays.
* Keep table lookup separate from business validation.
* Use AI Teacher before generating new Java table implementation code.
* Use Pandora rather than guessing exact ROA table behavior.

## Further Reference

For the overall ROA UI architecture:

`ui-architecture.md`

For application and table discovery:

`ui-application-discovery.md`

For typed elements and synchronization:

`ui-elements-and-synchronization.md`

For component types and implementations:

`ui-component-model.md`

For UI scenario design and validation:

`ui-test-design.md`
