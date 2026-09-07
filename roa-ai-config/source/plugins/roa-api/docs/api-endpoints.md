# API — Typed Endpoints

`AppEndpoints` is the single source of truth for method, URL, and the default
configuration every call inherits.

## Definition

```java
public enum AppEndpoints implements Endpoint<AppEndpoints> {

    GET_ALL_USERS(Method.GET, "/users"),
    GET_USER(Method.GET, "/users/{id}"),
    POST_CREATE_USER(Method.POST, "/users"),
    PUT_UPDATE_USER(Method.PUT, "/users/{id}"),
    PATCH_USER(Method.PATCH, "/users/{id}"),
    DELETE_USER(Method.DELETE, "/users/{id}"),
    POST_LOGIN(Method.POST, "/login");

    private final Method method;
    private final String url;

    AppEndpoints(final Method method, final String url) {
        this.method = method;
        this.url = url;
    }

    @Override public Method method()      { return method; }
    @Override public String url()         { return url; }
    @Override public AppEndpoints enumImpl() { return this; }

    @Override
    public RequestSpecification defaultConfiguration() {
        RequestSpecification spec = Endpoint.super.defaultConfiguration();
        spec.contentType(ContentType.JSON);
        spec.header(API_KEY_HEADER, API_KEY_VALUE);
        return spec;
    }
}
```

`defaultConfiguration()` is where a mandatory header belongs. Adding `x-api-key` per
call means one forgotten call is a confusing 401 later. Take its value from
`Data.testData()` — never a literal.

## Parameterisation

Never build a URL by hand.

| Call | Adds |
| --- | --- |
| `withQueryParam(String key, Object value)` | a query parameter |
| `withPathParam(String key, Object value)` | a value for a `{placeholder}` in the URL |
| `withHeader(String key, String value)` | a header for this call |
| `withHeader(String key, List<String> values)` | a multi-value header — rare |

```java
GET_ALL_USERS.withQueryParam(PAGE_PARAM, PAGE_TWO)
GET_USER.withPathParam(ID_PARAM, USER_ID_FOUR)
GET_USER.withPathParam(ID_PARAM, id).withHeader(AUTHORIZATION_HEADER_KEY, AUTHORIZATION_HEADER_VALUE + token)
```

Each returns a **new** endpoint instance and leaves the enum constant untouched, so
they chain freely and one test's parameterisation cannot leak into another's. The
storage key is unaffected: a parameterised `GET_USER` still stores under `GET_USER`.

`withPathParam` requires the URL to contain the matching placeholder.

## Rules

- Path parameters stay parameters. Concatenating an id into the constant turns a
  constant back into a literal.
- Params, ids, headers and expected values come from constants classes, not inline.
- Base URL comes from `getApiConfig().baseUrl()`.
- `Endpoint` implementations are on the Pandora regeneration list — run
  `mvn pandora:open -U` after changing the enum.
