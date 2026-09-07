# ROA Framework — Storage

A per-test, thread-local container attached to the active Quest. It holds one or
more values per enum key (append-only) and is namespaced by sub-storages:
`PRE_ARGUMENTS`, `ARGUMENTS`, `STATIC_DATA`, `HOOKS`, and the module namespaces
`UI` / `API` / `DB`.

Most writes happen automatically inside ROA services. Tests mostly read.

## Reading in a test

```java
// Latest value for a key
Order order = retrieve(StorageKeysTest.PRE_ARGUMENTS, DataCreator.ORDER, Order.class);

// Via a DataExtractor — best when a raw object was stored
String token = retrieve(
    DataExtractorsUi.responseBodyExtraction(
        RequestsInterceptor.INTERCEPT_AUTH_SESSION.getEndpointSubString(),
        "$.token"),
    String.class);

// Preloaded static data
String value = retrieve(DataExtractorsTest.staticTestData(StaticData.KEY), String.class);
```

## Writing (rare)

```java
quest.getStorage().sub(StorageKeysUi.UI).put(MyUiKeys.CHECKBOX_SELECTED, true);
```

## Reading outside a test

```java
SuperQuest quest = QuestHolder.get();
Order order = quest.getStorage()
                   .sub(StorageKeysTest.PRE_ARGUMENTS)
                   .getByClass(DataCreator.ORDER, Order.class);
```

## Index semantics

Storage keeps **every** write for a key.

| Call | Returns |
| --- | --- |
| `get(key, ...)` | the latest value |
| `getByIndex(key, 1, ...)` | the latest |
| `getByIndex(key, 2, ...)` | the previous |

## DefaultStorage shortcut

When `config.properties` sets `default.storage=UI`, `DefaultStorage.retrieve(...)`
reads from `storage.sub(UI)` without an explicit `.sub(...)`.

```java
Boolean selected = DefaultStorage.retrieve(MyUiKeys.CHECKBOX_SELECTED, Boolean.class);
```

## Module storage keys

| Module | Key | Keyed by |
| --- | --- | --- |
| API | `StorageKeysApi.API` | the endpoint enum constant |
| DB | `StorageKeysDb.DB` | the query enum constant |
| UI | `StorageKeysUi.UI` | project-defined keys |
