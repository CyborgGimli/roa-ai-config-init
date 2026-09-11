# DB — Response Storage and Extraction

Every query run through the ring stores its `QueryResponse` under
`StorageKeysDb.DB`, keyed by the **query enum constant**.

## Retrieval

```java
QueryResponse response = retrieve(StorageKeysDb.DB, UserQueries.GET_BY_ID, QueryResponse.class);
```

## Typed extraction in one step

`query(dbQuery, jsonPath, resultType)` runs the query and pulls a single typed value
straight out of the tabular result:

```java
quest.use(RING_OF_DB)
     .query(UserQueries.GET_BY_ID.withParam("id", 42), "$[0].username", String.class)
     .complete();
```

Results are addressed with JSONPath over the rows: `$[0].username` is the
`username` column of the first row.

## Chaining

Read a value from one query and use it in the next:

```java
quest.use(RING_OF_DB)
     .query(UserQueries.COUNT_ALL)
     .validate(() -> {
         QueryResponse counted = retrieve(StorageKeysDb.DB, UserQueries.COUNT_ALL, QueryResponse.class);
         assertNotNull(counted);
     })
     .complete();
```

## Index semantics

Storage keeps every write, so running the same query twice stores both responses.
`getByIndex(key, 2, ...)` reaches the previous one — useful for before/after
comparisons around an action. See `roa-data-and-storage.md`.
