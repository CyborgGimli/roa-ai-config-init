# API — Response Storage and Chaining

Every call made through the ring stores its response automatically under
`StorageKeysApi.API`, keyed by the **endpoint enum constant** (`endpoint.enumImpl()`).
Parameterising a call does not change the key: `GET_USER.withPathParam(ID_PARAM, id)`
still stores under `GET_USER`.

Only the ring stores. `RestService` — used inside hooks and auth clients — returns a
`Response` and stores nothing; see `api-rest-service.md`.

## Retrieval

`BaseQuest.retrieve(...)` has four overloads:

| Call | Reads |
| --- | --- |
| `retrieve(key, Class)` | the latest value in the default namespace |
| `retrieve(subKey, key, Class)` | the latest value in a namespace — the API form |
| `retrieve(extractor, Class)` | the latest value, transformed by a `DataExtractor` |
| `retrieve(extractor, index, Class)` | an earlier value by index, then transformed |

The API form is the two-key one:

```java
Response response = retrieve(StorageKeysApi.API, GET_ALL_USERS, Response.class);
GetUsersDto users = response.getBody().as(GetUsersDto.class);
```

## Extractors

`DataExtractorsApi` builds a `DataExtractor` that pulls a value straight out of the
stored response, so you do not hand-roll `getBody().jsonPath().getString(...)`:

```java
String token = retrieve(
    responseBodyExtraction(POST_LOGIN, TOKEN.getJsonPath()),
    String.class);

Integer status = retrieve(statusExtraction(GET_ALL_USERS), Integer.class);
```

| Factory | Returns |
| --- | --- |
| `responseBodyExtraction(endpoint, jsonPath)` | a JSON field from the stored response body |
| `statusExtraction(endpoint)` | the stored response's HTTP status code |

The first argument is the same endpoint constant the response was stored under.

## Index semantics

Storage keeps every write, newest first. Calling the same endpoint twice stores both
responses; reach the earlier one through the indexed `retrieve` overload:

```java
String latestName   = retrieve(responseBodyExtraction(POST_CREATE_USER, NAME.getJsonPath()), 1, String.class);
String previousName = retrieve(responseBodyExtraction(POST_CREATE_USER, NAME.getJsonPath()), 2, String.class);
```

The index is **1-based from the newest**: `1` is the latest, `2` the one before it.
The index goes in the middle, before the class — `retrieve(extractor, index, type)`.

## Chaining requests

The common shape: read an id from a list, use it as a path parameter.

```java
quest.use(RING_OF_API)
     .request(GET_ALL_USERS.withQueryParam(PAGE_PARAM, PAGE_ONE))
     .validate(() -> {
         GetUsersDto users = retrieve(StorageKeysApi.API, GET_ALL_USERS, Response.class)
                 .getBody().as(GetUsersDto.class);

         int id = users.getData().stream()
                 .filter(u -> USER_TWO_FIRST_NAME.equals(u.getFirstName()))
                 .map(UserData::getId)
                 .findFirst()
                 .orElseThrow(() -> new AssertionError(userNotFound(USER_TWO_FIRST_NAME)));

         quest.use(RING_OF_API)
              .requestAndValidate(GET_USER.withPathParam(ID_PARAM, id),
                  Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build());
     })
     .complete();
```

A nested `quest.use(RING_OF_API)` inside a `validate(...)` block is the normal way to
issue a follow-up call that depends on a value only available at that point. The
outer chain still owns the single `.complete()`.

## Token reuse

Log in, extract the token, send it as a header on the next request. Prefer
`@AuthenticateViaApi` when the flow is a plain login — see `api-authentication.md`.
Extract manually only when the token is needed as data rather than as auth.

```java
String token = retrieve(StorageKeysApi.API, POST_LOGIN, Response.class)
        .getBody().jsonPath().getString(TOKEN.getJsonPath());

GET_USER.withPathParam(ID_PARAM, USER_ID_FOUR)
        .withHeader(AUTHORIZATION_HEADER_KEY, AUTHORIZATION_HEADER_VALUE + token)
```

## When to chain vs. seed

Chaining through the API is right when the test is *about* the sequence. When the
earlier call is only setup, prefer a `@Journey` precondition — a setup failure then
reports as a setup failure rather than as a failure of the behaviour under test.

Mechanism detail, including the underlying `Storage` methods: `framework-storage.md`.
