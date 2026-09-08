# ROA Framework — Storage

A per-test, thread-local container attached to the active Quest. It holds one or
more values per enum key (append-only) and is namespaced by sub-storages:
`PRE_ARGUMENTS`, `ARGUMENTS`, `STATIC_DATA`, `HOOKS`, and the module namespaces
`UI` / `API` / `DB`.

Most writes happen automatically inside ROA services. Tests mostly read.

## Scope

Every test gets its **own** storage instance, tied to the thread running it, and it
is discarded when the test finishes.

```text
Test thread 1 → Storage #1
Test thread 2 → Storage #2
```

That is what makes parallel execution safe: nothing test A writes can be read by
test B. It is also why storage is not a way to pass state *between* tests — a test
that depends on what another one stored will pass alone and fail in a parallel run.

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

## Custom extractors

The module factories — `DataExtractorsApi.responseBodyExtraction`,
`DataExtractorsUi`, `DataExtractorsTest.staticTestData` — cover the common shapes.
When the extraction is genuinely one of a kind, build a `DataExtractor` directly:

```java
DataExtractor<String> firstUserEmail = new DataExtractorImpl<>(
    StorageKeysApi.API,                 // namespace
    GET_ALL_USERS,                      // key the raw object is stored under
    raw -> ((Response) raw).getBody().jsonPath().getString("data[0].email"));

String email = retrieve(firstUserEmail, String.class);
```

The lambda receives whatever was stored — cast it yourself. There is a two-argument
constructor without the namespace, for keys in the root storage.

Prefer a factory. A custom extractor that hardcodes a path is the same scattered
JSONPath the registries exist to prevent: once the path is stable, move it into
`ApiResponsesJsonPaths` and go back to `responseBodyExtraction`.

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
| `get(key, Class)` | the latest value, cast to the type |
| `getByIndex(key, 1, Class)` | the latest |
| `getByIndex(key, 2, Class)` | the previous |
| `getByClass(key, Class)` | the latest value **that is** of that type |
| `getAllByClass(key, Class)` | every value of that type, oldest first |

`get` and `getByClass` differ when a key holds values of more than one type. `get`
takes the newest entry and casts it — the wrong type there is a failure. `getByClass`
skips past entries that do not match and returns the newest one that does. Reach for
it when a key accumulates mixed writes; `get` is right everywhere else.

Each also takes a `ParameterizedTypeReference` instead of a `Class` for generic types
such as `List<Order>`.

## The default sub-storage

`default.storage=UI` in the framework config names one namespace as the default, so
`storage.sub()` — no argument — returns it:

```java
Boolean selected = quest.getStorage().sub().get(MyUiKeys.CHECKBOX_SELECTED, Boolean.class);
```

The default is latched **lazily**: `Storage` records the enum the first time
`sub(subKey)` is called with a constant whose `name()` equals the configured value.
Until something has entered that namespace in the current test, `sub()` throws:

```text
IllegalStateException: There is no default storage initialized
```

So `sub()` is dependable inside a ring that has already written to its own namespace,
and a coin flip in a test that has not. Naming the namespace — `sub(StorageKeysUi.UI)`
— costs one argument and never throws.

## Namespaces — what goes where

| Namespace | Keyed by | Holds |
| --- | --- | --- |
| `StorageKeysApi.API` | the endpoint enum constant | the `Response` of every ring call |
| `StorageKeysDb.DB` | the query enum constant | `QueryResponse` objects |
| `StorageKeysUi.UI` | project-defined keys, and table/element constants | intercepted responses, table rows, values read from components |
| `StorageKeysTest.PRE_ARGUMENTS` | the `DataCreator` constant | the input and output of journeys and preconditions |
| `StorageKeysTest.STATIC_DATA` | the static-data key | data preloaded before the run |
| `StorageKeysTest.HOOKS` | an arbitrary object key | values a hook flow wrote, read back with `hookData(...)` |

Writing into the wrong namespace is not an error — it just means the matching
`retrieve` never finds it. Match the namespace to what produced the value.

## Practices

- **Enums as keys.** They are discoverable, they survive a rename, and they keep the
  typed `retrieve` overloads usable. A string key defeats all three.
- **Keep direct storage access in rings, journeys, hooks and cleaners** — not spread
  through tests. A test reading `quest.getStorage().sub(...)` directly is usually a
  missing extractor or a missing precondition.
- **Prefer `retrieve(...)` and `staticTestData(...)`** over raw map access; they do
  the cast, so a wrong type fails with a useful message rather than a `ClassCastException`.
- **Do not store large payloads** you will not assert on. Storage lives for the whole
  test, and a parallel run multiplies whatever you put there.
