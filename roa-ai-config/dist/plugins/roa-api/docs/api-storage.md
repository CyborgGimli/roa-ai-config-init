# API — Response Storage and Chaining

Every call made through the ring stores its response automatically under
`StorageKeysApi.API`, keyed by the **endpoint enum constant**.

## Retrieval

```java
Response response = retrieve(StorageKeysApi.API, GET_ALL_USERS, Response.class);
GetUsersDto users = response.getBody().as(GetUsersDto.class);
```

## Chaining requests

The common shape: read an id from a list, use it as a path parameter.

```java
quest.use(RING_OF_API)
     .requestAndValidate(GET_ALL_USERS,
         Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build())
     .validate(() -> {
         Response listed = retrieve(StorageKeysApi.API, GET_ALL_USERS, Response.class);
         String id = listed.jsonPath().getString(USER_ID.getJsonPath(0));
         assertNotNull(id);
     })
     .complete();
```

## Token reuse

Log in, extract the token, send it as a header on the next request. Prefer
`@AuthenticateViaApi` when the flow is a plain login — see `api-authentication.md`.
Extract manually only when the token is needed as data rather than as auth.

## Index semantics

Storage keeps every write. Calling the same endpoint twice stores both responses;
`getByIndex(key, 2, ...)` reaches the previous one. See `framework-storage.md`.

## When to chain vs. seed

Chaining through the API is right when the test is *about* the sequence. When the
earlier call is only setup, prefer a `@Journey` precondition — a setup failure then
reports as a setup failure rather than as a failure of the behaviour under test.
