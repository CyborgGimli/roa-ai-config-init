# API — `RestService` vs the Ring

Two types execute API calls. Picking the wrong one is the most common structural
mistake in a new ROA API project.

| | `RestServiceFluent` | `RestService` |
| --- | --- | --- |
| Reached via | `quest.use(RING_OF_API)` | handed to you by the framework |
| Used in | `@Test` methods, preconditions | hook flows, auth clients |
| Returns | itself, for chaining | `Response`, or `List<AssertionResult>` |
| Stores the response | yes, under `StorageKeysApi.API` | no |

**In a test, always the ring.** `RestService` appears only where there is no Quest
chain to hang off.

## Where `RestService` legitimately appears

### Hook flows

`ApiHookFlow` hands the flow a `RestService` because a class-level hook runs outside
any test's Quest:

```java
public static void pingReqres(RestService service, Map<Object, Object> storage, String[] args) {
    service.requestAndValidate(
        GET_ALL_USERS.withQueryParam(PAGE_PARAM, PAGE_ONE),
        Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build());
}
```

See `api-hooks.md`.

### Authentication clients

`BaseAuthenticationClient.authenticateImpl(...)` receives a `RestService` to perform
the login itself:

```java
@Override
protected Header authenticateImpl(RestService restService, String username, String password) {
    String token = restService
        .request(POST_LOGIN, new LoginDto(username, password))
        .getBody().jsonPath().getString(TOKEN.getJsonPath());

    return new Header(AUTHORIZATION_HEADER_KEY, AUTHORIZATION_HEADER_VALUE + token);
}
```

See `api-authentication.md`.

## Operations

```java
Response response = service.request(endpoint);
Response response = service.request(endpoint, body);

List<AssertionResult<Object>> results = service.validate(response, assertions...);
List<AssertionResult<Object>> results = service.requestAndValidate(endpoint, assertions...);
List<AssertionResult<Object>> results = service.requestAndValidate(endpoint, body, assertions...);

service.authenticate(username, password, AppAuth.class);   // attaches the header to later calls
```

`requestAndValidate` here **returns** the assertion results rather than reporting
them through the chain. Inside a custom ring, hand them to
`FluentService.validation(results)` to get ROA's logging, Allure output, and
soft/hard handling. Inside a hook, either let a failing assertion throw or inspect
the results yourself.

## Logging

`LogApi` is the framework logger facade for project-side code — hooks, auth clients,
custom rings, helpers. Tests do not need it.

```java
LogApi.info("Starting API smoke flow");
```

It offers `info`, `warn`, `error`, `debug`, `trace`, `step`, `validation`, and an
extended verbose variant, each varargs-formatted. Never log a password or a token.

## Rules

- A `@Test` method that references `RestService` is almost always wrong — use the ring.
- `RestService` results are invisible to `retrieve(StorageKeysApi.API, ...)`. To get a
  hook's value into a test, write it into the hook's map and read it with
  `hookData(key, type)`.
- Endpoint, constant, and JSONPath discipline applies identically here: hook and auth
  code is project code, not a place for raw strings.
