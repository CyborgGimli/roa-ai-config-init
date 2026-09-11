# ROA DB Plugin

AI-assisted database test development for the ROA framework.

## What it does

Guides database test creation through ROA's query abstractions:

1. **Query enums** — `DbQuery<T>` implementations holding the SQL, with `{name}`
   placeholders filled at runtime by `withParam`
2. **Result types** — typed row-to-object mapping
3. **Fluent assertions** — readable validation of the returned data
4. **Cleanup** — `@Ripper` and `DataCleaner` for test isolation

## Using this plugin

1. `/roa-base:setup roa-db`, then `/reload-plugins --force`
2. `/roa-db:roa-db-architect <what to cover>` to design and generate tests
3. Read the single-topic chunks in `docs/` — start at `db-architecture.md`, then
   `db-queries.md`
4. Load `ai-compass` for any ROA signature that is unclear

## Core concepts

- **Queries as enums** — SQL lives in the registry, never as a string at a call site
- **`{name}` placeholders** — every value goes through `withParam`; quote the
  placeholder in the SQL for strings, leave it unquoted for numerics. It is text
  substitution, not a bound parameter, so only controlled test data goes in
- **Results** — `QueryResponse.getRows()` or a typed JSONPath extraction via
  `query(q, jsonPath, Type.class)`; there is no mapper layer
- **Explicit column lists** — `SELECT *` couples the test to column order
- **Data cleanup** — `@Ripper` scoped to the rows this test created

## Key constraints

- ✓ Every value passed through `withParam` — no SQL assembled by concatenation
  at a call site, so the registry stays the single place to fix
- ✓ Queries defined in `DbQuery` enums
- ✓ Explicit column lists rather than `SELECT *`
- ✓ Rows created uniquely per run, so reruns and parallel execution do not collide
- ✓ `DELETE` / `TRUNCATE` / unqualified `UPDATE` only inside a registered cleaner
- ✓ Assertions prove the data invariant, not merely a non-zero row count
- ✓ Every chain ends with `.complete()`

`DbQuery` implementations are on the Pandora regeneration list — run
`mvn pandora:navigation -U` after changing the enum.

---

Reference docs ship in `docs/`; skills in `skills/`; the data reviewer in
`agents/roa-db-data-reviewer.md`.
