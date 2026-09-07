# API — JSONPath Registry

Raw JSONPath strings scattered through tests are unmaintainable: when the response
shape changes, nothing tells you which tests to fix.

## The registry

```java
public enum ApiResponsesJsonPaths {

    TOTAL("total"),
    TOTAL_PAGES("total_pages"),
    USER_ID("data[%d].id"),
    RESPONSE_NAME("name"),
    TOKEN("token"),
    ERROR("error");

    private final String jsonPath;

    ApiResponsesJsonPaths(final String jsonPath) {
        this.jsonPath = jsonPath;
    }

    public String getJsonPath(final Object... args) {
        return args.length == 0 ? jsonPath : String.format(jsonPath, args);
    }
}
```

Indexed paths take a format argument, so `USER_ID.getJsonPath(0)` yields
`data[0].id`.

## Use

```java
Assertion.builder()
    .target(BODY)
    .key(TOKEN.getJsonPath())
    .type(NOT_NULL)
    .expected(true)
    .build();
```

## Rules

- No raw JSONPath string in a test — ever. The rule holds equally in auth clients,
  hook functions, preconditions, and retry conditions.
- One registry per project. Two competing JSONPath enums defeat the point.
- Keep the registry path-only: no `RestService` calls, no storage access, no
  assertions.
- Name constants for what they mean, not where they sit: `TOKEN`, not `FIELD_3`.
- Missing a path? Add a constant. Do not work around it with a literal.

## Extracting rather than asserting

`DataExtractorsApi` turns a registry path into a `DataExtractor` that reads straight
out of the stored response:

```java
String token   = retrieve(responseBodyExtraction(POST_LOGIN, TOKEN.getJsonPath()), String.class);
Integer status = retrieve(statusExtraction(GET_ALL_USERS), Integer.class);
```

Full semantics, including indexed access to earlier responses: `api-storage.md`.
