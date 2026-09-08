# ROA UI — Tables: Filter, Sort, Edit, Click

Operations beyond reading. The row model and `TableField` are in `ui-tables.md`.

Every operation names its row either by **index** (`3`) or by **criteria**
(`List.of("Starbucks")` — the first row containing all the given values).

## Filtering

```java
quest.use(RING_OF_UI)
     .table().filterTable(
         Tables.OUTFLOW,
         TableField.of(OutFlow::setCategory),
         FilterStrategy.SELECT_ONLY,
         new String[]{"Food"})
     .drop().complete();
```

`FilterStrategy` (`io.cyborgcode.roa.ui.components.table.filters`): `SELECT_ONLY`,
`SELECT`, `SELECT_ALL`, `UNSELECT`, `UNSELECT_ALL`.

`SELECT_ONLY` clears the column's other selections first — reach for it when the test
depends on exactly one value being active, since `SELECT` leaves whatever a previous
step selected in place.

## Sorting

```java
.table().sortTable(Tables.OUTFLOW,
                   TableField.of(OutFlow::setCategory),
                   SortingStrategy.ASC)
```

`SortingStrategy` (`…table.sort`): `ASC`, `DESC`, `NO_SORT`.

Sorting to make an index-based read deterministic is fine. Asserting on the sorted
order is only meaningful when the sort itself is the thing under test.

## Editing cells

```java
// By column, with values
.table().insertCellValue(Tables.OUTFLOW, 3, TableField.of(OutFlow::setAmount), "120")

// From a populated row model — every non-null field is written
OutFlow outFlow = new OutFlow();
outFlow.setCategory("Food");
outFlow.setAmount("120");

.table().insertCellValueAsData(Tables.OUTFLOW, List.of("Food"), outFlow)
```

`insertCellValue` also takes a trailing `int` to pick the Nth control inside the cell
when there is more than one.

## Clicking inside a cell

```java
.table().clickElementInCell(Tables.ALL_TRANSACTIONS,
                            List.of("Starbucks"),
                            TableField.of(AllTransactionEntry::setDescription))
```

A trailing `int` picks the Nth clickable element in the cell; the row can equally be
addressed by index, or by a populated row model.

## When the default cell behaviour is wrong

Default filtering types into the header input, and default insertion types into the
cell. Two annotation pairs override that.

### Delegate to a component

`@CellFilter` and `@CellInsertion` route the cell through an existing UI component
implementation — the same Layer 1/Layer 3 machinery the rest of the module uses:

```java
@CellInsertion(type = LinkComponentType.class,
               componentType = "BOOTSTRAP_LINK_TYPE",
               order = 0)
@TableCellLocator(cellLocator       = @FindBy(css = "td:nth-of-type(1)"),
                  headerCellLocator = @FindBy(css = "th:nth-of-type(1)"))
private TableCell account;
```

Prefer this over a custom function: the interaction stays in the component layer
where it can be reused.

### Write a handler

`@CustomCellFilter` and `@CustomCellInsertion` take a class when no component fits —
the cell needs a modal opened, an icon clicked, a date picker driven:

```java
@CustomCellInsertion(insertionFunction = ClickDetailsIcon.class)
@TableCellLocator(cellLocator       = @FindBy(css = "td.details"),
                  headerCellLocator = @FindBy(css = "th.details"))
private TableCell details;

private static class ClickDetailsIcon implements CellInsertionFunction {

    @Override
    public void cellInsertionFunction(SmartWebElement cellElement, String... values) {
        cellElement.findSmartElement(By.cssSelector("img.details-icon")).click();
    }
}
```

The filter counterpart is `CellFilterFunction`, whose method receives the **header**
cell plus the `FilterStrategy` and values:

```java
void cellFilterFunction(SmartWebElement headerCellElement,
                        FilterStrategy strategy,
                        String... values)
```

`order` sequences multiple handlers on the same row model; it defaults to `0`, which
is right whenever there is only one.

## Traps

- **Criteria that match more than one row.** The first match wins, silently. Make the
  criteria unique, or address by index after a sort.
- **Editing without re-reading.** `insertCellValue` changes the page, not the rows
  already in storage. Read again before asserting.
- **A custom handler that asserts.** These are interactions. An assertion inside one
  fails outside the validation reporting and will not appear where anyone looks.
