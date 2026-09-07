# ROA UI — Tables

Tables are the one UI area that uses `Assertion.builder()`, because a table
assertion needs a target, a type, and an expected value rather than a single
comparison.

## Row model

Annotate a class describing one row:

```java
@TableInfo(
    tableContainerLocator = @FindBy(css = "table#orders"),
    rowsLocator           = @FindBy(css = "tbody tr"),
    headerRowLocator      = @FindBy(css = "thead tr"))
public class OrderTableEntry {

    @TableCellLocator(
        cellLocator       = @FindBy(css = "td.customer"),
        headerCellLocator = @FindBy(css = "th.customer"))
    private TableCell customerCell;
}
```

## Table element enum

```java
public enum Tables implements TableElement<Tables> {

    ORDERS(OrderTableEntry.class);

    public static final class Data {
        public static final String ORDERS = "ORDERS";

        private Data() {
        }
    }

    // standard enum pattern: field, constructor, interface overrides
}
```

`TableElement` is on the Pandora regeneration list — run `mvn pandora:open -U`
after adding one.

## Reading and validating

```java
quest.use(RING_OF_UI)
     .table().readTable(Tables.ORDERS)
     .table().validate(Tables.ORDERS, Assertion.builder()
         .target(UiTablesAssertionTarget.TABLE_VALUES)
         .type(TableAssertionTypes.TABLE_NOT_EMPTY)
         .expected(true)
         .build())
     .drop()
     .complete();
```

## Assertion anatomy

| Part | Meaning | Where the values come from |
| --- | --- | --- |
| `target` | which part of the table is validated | `UiTablesAssertionTarget` |
| `type` | how it is validated | `TableAssertionTypes` |
| `expected` | the expected value | your test |
| `soft` | `true` collects until `complete()`; `false` fails immediately | your test |

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

Open the metadata for `UiTablesAssertionTarget` and `TableAssertionTypes` to see the
values actually available in your framework version — do not guess a constant name.

## Soft vs hard

- `soft(true)` — the failure is collected and reported at `quest.complete()`. Use it
  when checking several independent things about one table.
- `soft(false)` (or omitted) — fails immediately. Use it when a later step is
  meaningless if this one failed.

## Traps

- **Asserting the row count alone.** A count of 1 is satisfied by the wrong row.
  Assert the values.
- **Reading before the table has rendered.** Read after the action that populates
  it, and let the loader service or an element hook handle the wait.
- **Ordering assumptions.** Unless the product guarantees an order, assert
  containment rather than position.
