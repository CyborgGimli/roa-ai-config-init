# UI — Storage and Extractors

Storage fundamentals — sub-storages, index semantics, reading outside a test — are in
`framework-storage.md`. This is what the UI ring puts there and how to get it back.

## The UI sub-storage

`StorageKeysUi.UI` is the UI namespace. Unlike API and DB, which key automatically by
the endpoint or query constant, most UI writes are yours:

```java
quest.getStorage().sub(StorageKeysUi.UI).put(MyUiKeys.CHECKBOX_SELECTED, true);
```

Two things the ring writes on its own: intercepted responses (when the test carries
`@InterceptRequests`) and the rows produced by `table().readTable(...)` /
`readRow(...)`.

## DataExtractorsUi

`io.cyborgcode.roa.ui.storage.DataExtractorsUi` builds the extractors that read those
back.

### Intercepted responses

```java
String token = retrieve(
    DataExtractorsUi.responseBodyExtraction(
        RequestsInterceptor.INTERCEPT_AUTH_SESSION.getEndpointSubString(),
        "$.token"),
    String.class);
```

| Argument | Meaning |
| --- | --- |
| 1 | the URL substring identifying the captured request |
| 2 | a JSONPath into the response body |
| 3 (optional) | which capture, when the substring matched more than once |

The third argument follows storage index semantics: `1` is the latest, `2` the one
before. A page that calls the same endpoint twice needs it; without it you get the
last call, which is not always the one the assertion is about.

### Table rows

```java
// The first row containing every indicator, case-insensitively
AllTransactionEntry row = retrieve(
    DataExtractorsUi.tableRowExtractor(Tables.ALL_TRANSACTIONS, "TELECOM", "ONLINE"),
    AllTransactionEntry.class);

// By position
AllTransactionEntry first = retrieve(
    DataExtractorsUi.tableRowExtractor(Tables.ALL_TRANSACTIONS, 1),
    AllTransactionEntry.class);

// The row a preceding readRow(...) selected — no search argument needed
OutFlow selected = retrieve(
    DataExtractorsUi.tableRowExtractor(Tables.OUTFLOW),
    OutFlow.class);
```

The bare form pairs with `readRow(table, …)`: the read chooses the row, the extractor
just hands it back typed. Use the search form after a `readTable(...)`, where storage
holds every row and the extractor has to pick one.

Every row at once comes straight from the namespace, keyed by the table constant:

```java
List<FilteredTransactionEntry> allRows = retrieve(
    StorageKeysUi.UI, Tables.FILTERED_TRANSACTIONS, List.class);
```

A cell is a `TableCell`, not a `String` — read its text:

```java
String amount = retrieve(DataExtractorsUi.tableRowExtractor(Tables.OUTFLOW, RETAIL), OutFlow.class)
        .getAmount().getText();
```

The row must have been read first — the extractor reads storage, not the page. A
`null` here almost always means the `readTable` call is missing, or ran before the
table rendered.

## DefaultStorage

When `config.properties` sets `default.storage=UI`:

```java
Boolean selected = DefaultStorage.retrieve(MyUiKeys.CHECKBOX_SELECTED, Boolean.class);
```

## Passing values between steps

Prefer storage over a local variable when the value crosses a ring boundary or is
produced inside a precondition — a precondition runs outside the test method and
cannot assign to its locals.

```java
Order order = retrieve(StorageKeysTest.PRE_ARGUMENTS, DataCreator.ORDER, Order.class);
```
