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

`TableElement` is on the Pandora regeneration list — run `mvn pandora:open -U` after
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

| Call | Returns |
| --- | --- |
| `readTable(table)` | every row, every mapped column |
| `readTable(table, Row.class)` | every row, typed |
| `readTable(table, fields…)` | every row, only the named columns |
| `readTable(table, from, to[, fields…])` | a row range |
| `readRow(table, index[, fields…])` | one row by index |
| `readRow(table, criteria[, fields…])` | the first row matching a `List` of values |

Reads land in storage; `ui-storage.md` covers getting a row back out.

## Validating

```java
Assertion assertion = Assertion.builder()
    .target(UiTablesAssertionTarget.ROW_VALUES)
    .type(TableAssertionTypes.CONTAINS_ROW)
    .expected("TELECOM")
    .soft(true)
    .build();

quest.use(RING_OF_UI)
     .table().validate(Tables.ALL_TRANSACTIONS, assertion)
     .drop().complete();
```

| Part | Meaning | Where the values come from |
| --- | --- | --- |
| `target` | which part of the table is validated | `UiTablesAssertionTarget` |
| `type` | how it is validated | `TableAssertionTypes` |
| `expected` | the expected value | your test |
| `soft` | `true` collects until `complete()`; `false` fails immediately | your test |

`validate` is varargs — pass several assertions in one call.

Open the metadata for `UiTablesAssertionTarget` and `TableAssertionTypes` to see the
constants available in your framework version. Do not guess a name.

## Traps

- **Asserting the row count alone.** A count of 1 is satisfied by the wrong row.
  Assert the values.
- **Reading before the table has rendered.** Read after the action that populates it,
  and let `loader().waitToBeShownAndRemoved(...)` or an element hook handle the wait.
- **Ordering assumptions.** Unless the product guarantees an order, assert
  containment rather than position.
