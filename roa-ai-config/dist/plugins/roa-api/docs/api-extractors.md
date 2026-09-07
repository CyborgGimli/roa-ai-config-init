# API — JSONPath Registry

Raw JSONPath strings scattered through tests are unmaintainable: when the response
shape changes, nothing tells you which tests to fix.

## The registry

```java
public enum ApiResponsesJsonPaths {

    TOTAL("total"),
    USER_ID("data[%d].id"),
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

- No raw JSONPath string in a test — ever.
- Keep the registry in `api/extractors/`.
- Name constants for what they mean, not where they sit: `TOKEN`, not `FIELD_3`.

## Extracting rather than asserting

`DataExtractorsApi` provides extractors for pulling a value out of a stored response
for later use. See `api-storage.md` for the chaining pattern.
