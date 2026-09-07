# API — Typed Endpoints

`AppEndpoints` is the single source of truth for method, URL, and the default
configuration every call inherits.

## Definition

```java
public enum AppEndpoints implements Endpoint<AppEndpoints> {

    GET_ALL_USERS(Method.GET, "/users"),
    GET_USER(Method.GET, "/users/{id}"),
    POST_CREATE_USER(Method.POST, "/users"),
    DELETE_USER(Method.DELETE, "/users/{id}");

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
call means one forgotten call is a confusing 401 later.

## Parameterisation

Never build a URL by hand.

```java
GET_ALL_USERS.withQueryParam(PAGE_PARAM, PAGE_TWO)
GET_USER.withPathParam(ID_PARAM, ID_THREE)
GET_USER.withHeader(EXAMPLE_HEADER, token)
```

Chain them; each returns the endpoint so the call site stays one expression.

## Rules

- Path parameters stay parameters. Concatenating an id into the constant turns a
  constant back into a literal.
- Params, ids, headers and expected values come from constants classes, not inline.
- Base URL comes from `getApiConfig().baseUrl()`.
- `Endpoint` implementations are on the Pandora regeneration list — run
  `mvn pandora:open -U` after changing the enum.
