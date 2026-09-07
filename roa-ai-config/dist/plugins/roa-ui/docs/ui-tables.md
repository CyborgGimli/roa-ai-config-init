# ROA UI — Tables: Model and Reading

Tables are the one UI area that uses `Assertion.builder()`, because a table assertion
needs a target, a type and an expected value rather than a single comparison.

Filtering, sorting, editing and clicking inside cells are in
`ui-tables-operations.md`.

## Row model

A class describing one row, annotated with the table's structural locators:

```java
@TableInfo(
    tableContainerLocator = @FindBy(id = "filtered_transactions_for_account"),
    rowsLocator           = @FindBy(css = "tbody tr"),
    headerRowLocator      = @FindBy(css = "thead tr"))
public class FilteredTransactionEntry {

    @TableCellLocator(
        cellLocator       = @FindBy(css = "td:nth-of-type(1)"),
        headerCellLocator = @FindBy(css = "th:nth-of-type(1)"))
    private TableCell date;

    @TableCellLocator(
        cellLocator       = @FindBy(css = "td.description"),
        headerCellLocator = @FindBy(css = "th.description"))
    private TableCell description;

    // getters and setters — the setters are what TableField binds to
}
```

| Annotation attribute | What ROA uses it for |
| --- | --- |
| `tableContainerLocator` | scopes every operation to this table, so a second table on the page is never touched |
| `rowsLocator` | enumerates rows for `readTable` / `readRow` |
| `headerRowLocator` | resolves column headers for field mapping, filtering and sorting |
| `cellLocator` / `headerCellLocator` | resolves one column's cell and its header |

Each mapped column is a `TableCell` field. Fields without `@TableCellLocator` are not
resolved from the page.

## Table element enum

`TableElement` registers the table and binds it to its row model:

```java
public enum Tables implements TableElement<Tables> {

    FILTERED_TRANSACTIONS(FilteredTransactionEntry.class),
    ALL_TRANSACTIONS(AllTransactionEntry.class);

    private final Class<?> rowRepresentationClass;

    <T> Tables(final Class<T> rowRepresentationClass) {
        this.rowRepresentationClass = rowRepresentationClass;
    }

    @Override
    public <T> Class<T> rowsRepresentationClass() {
        return (Class<T>) rowRepresentationClass;
    }

    @Override
    public Tables enumImpl() {
        return this;
    }
}
```

The service takes the enum constant directly, so no nested `Data` class of string
constants is needed here — unlike the element enums, no annotation references it.

`TableElement` is on the Pandora regeneration list — run `mvn pandora:navigation -U` after
adding one.

## TableField — projecting columns

`TableField.of(Row::setColumn)` binds a column to a setter on the row model. Passing
fields reads only those columns:

```java
quest.use(RING_OF_UI)
     .table().readTable(
         Tables.FILTERED_TRANSACTIONS,
         TableField.of(FilteredTransactionEntry::setDescription),
         TableField.of(FilteredTransactionEntry::setWithdrawal))
     .drop().complete();
```

## Reading

| Call | Reads |
| --- | --- |
| `readTable(table)` | every row, every mapped column |
| `readTable(table, fields…)` | every row, only the named columns |
| `readTable(table, from, to)` | a row range, every mapped column |
| `readTable(table, from, to, fields…)` | a row range, only the named columns |
| `readRow(table, index)` | one row by index |
| `readRow(table, index, fields…)` | one row by index, only the named columns |
| `readRow(table, List.of(…))` | the first row containing all the given values |
| `readRow(table, List.of(…), fields…)` | the same, only the named columns |

There is no overload taking the row class — it comes from the enum's
`rowsRepresentationClass()`, which is the point of registering the table there.

Narrow the read to what the assertion needs. Column projection and row ranges are
not just performance: a read that pulls only what the test is about will not break
when an unrelated column changes.

Reads land in storage; `ui-storage.md` covers getting a row back out.

## Validating

```java
quest.use(RING_OF_UI)
     .table().readTable(Tables.ALL_TRANSACTIONS)
     .table().validate(
         Tables.ALL_TRANSACTIONS,
         Assertion.builder().target(TABLE_VALUES).type(ROW_CONTAINS_VALUES)
                  .expected(List.of("TELECOM")).soft(true).build())
     .drop().complete();
```

| Part | Meaning | Where the values come from |
| --- | --- | --- |
| `target` | which part of the table is validated | `UiTablesAssertionTarget` |
| `type` | how it is validated | `TableAssertionTypes` |
| `expected` | the expected value | your test |
| `soft` | `true` collects until `complete()`; `false` fails immediately | your test |

`validate` is varargs — pass several assertions in one call. Read the table first;
`validate` asserts over what is in storage, not over the page.

### Targets — `UiTablesAssertionTarget`

`TABLE_VALUES`, `TABLE_ELEMENTS`, `ROW_VALUES`, `ROW_ELEMENTS`.

The `*_VALUES` targets assert on cell text; the `*_ELEMENTS` targets assert on the
state of the controls in the cells. `ROW_*` needs a preceding `readRow(...)`.

### Types — `TableAssertionTypes`

The enum has exactly these twelve. Nothing else is valid.

| Type | Usual target | `expected` |
| --- | --- | --- |
| `TABLE_NOT_EMPTY` | `TABLE_VALUES` | `true` |
| `TABLE_ROW_COUNT` | `TABLE_VALUES` | the row count |
| `EVERY_ROW_CONTAINS_VALUES` | `TABLE_VALUES` | `List` of values every row must carry |
| `TABLE_DOES_NOT_CONTAIN_ROW` | `TABLE_VALUES` | the row that must be absent |
| `ALL_ROWS_ARE_UNIQUE` | `TABLE_VALUES` | `true` |
| `NO_EMPTY_CELLS` | `TABLE_VALUES` | `true` to forbid empty cells, `false` to allow them |
| `COLUMN_VALUES_ARE_UNIQUE` | `TABLE_VALUES` | the column index to check |
| `TABLE_DATA_MATCHES_EXPECTED` | `TABLE_VALUES` | the whole expected table |
| `ALL_CELLS_ENABLED` | `TABLE_ELEMENTS` | `true` |
| `ALL_CELLS_CLICKABLE` | `TABLE_ELEMENTS` | `true` |
| `ROW_NOT_EMPTY` | `ROW_VALUES` | `true` |
| `ROW_CONTAINS_VALUES` | `ROW_VALUES` | `List` of values the row must carry |

Every constant declares `List` as its supported type, so `expected` is coerced —
a wrong-shaped `expected` fails at assertion time, not at compile time. Check the
column index for `COLUMN_VALUES_ARE_UNIQUE` and the direction of `NO_EMPTY_CELLS`
against what you actually mean.

### Grouping assertions

Table assertions are the case soft mode was made for: one run then reports every
structural problem instead of stopping at the first.

```java
.table().validate(
    Tables.FILTERED_TRANSACTIONS,
    Assertion.builder().target(TABLE_VALUES).type(TABLE_NOT_EMPTY).expected(true).soft(true).build(),
    Assertion.builder().target(TABLE_VALUES).type(TABLE_ROW_COUNT).expected(2).soft(true).build(),
    Assertion.builder().target(TABLE_VALUES).type(ALL_ROWS_ARE_UNIQUE).expected(true).soft(true).build(),
    Assertion.builder().target(TABLE_ELEMENTS).type(ALL_CELLS_ENABLED).expected(true).soft(true).build())
.table().readRow(Tables.FILTERED_TRANSACTIONS, 1)
.table().validate(
    Tables.FILTERED_TRANSACTIONS,
    Assertion.builder().target(ROW_VALUES).type(ROW_NOT_EMPTY).expected(true).soft(true).build())
```

## Traps

- **Validating without reading.** `validate` looks up the table constant in the UI
  namespace and throws `IllegalArgumentException: No table data found for key: …` when
  nothing is there. That message means a missing `readTable` / `readRow`, not a
  broken assertion.
- **Read order decides what you assert.** Both reads store under the same table
  constant, and the lookup takes the latest. So `readTable` → table-level assertions
  → `readRow` → row-level assertions works, and reversing it silently asserts the
  table-level types against a single row.
- **Asserting the row count alone.** A count of 1 is satisfied by the wrong row.
  Assert the values.
- **Reading before the table has rendered.** Read after the action that populates it,
  and let `loader().waitToBeShownAndRemoved(...)` or an element hook handle the wait.
- **Ordering assumptions.** Unless the product guarantees an order, assert
  containment rather than position — or sort first, then read by index.
- **Editing without re-reading.** A cell write changes the page, not the rows already
  in storage.
