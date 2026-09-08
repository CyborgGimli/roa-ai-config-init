# API — Validation

Prefer `requestAndValidate(...)` with `Assertion.builder()`. Fall back to
`request(...)` then `validate(...)` only when the check needs custom logic.

## The builder

| Field | Meaning |
| --- | --- |
| `target` | where to assert — `RestAssertionTarget` |
| `key` | refines the target: the JSONPath for `BODY`, the header name for `HEADER`; omitted for `STATUS` |
| `type` | how to compare — `AssertionTypes` |
| `expected` | the reference value |
| `soft` | collect the failure until `complete()` instead of failing now |

## Targets

`RestAssertionTarget`: `STATUS`, `BODY`, `HEADER`.

## Types

`AssertionTypes`: `IS`, `NOT`, `CONTAINS`, `NOT_NULL`, `ALL_NOT_NULL`, `IS_NULL`,
`ALL_NULL`, `GREATER_THAN`, `LESS_THAN`, `CONTAINS_ALL`, `CONTAINS_ANY`,
`STARTS_WITH`, `ENDS_WITH`, `LENGTH`, `MATCHES_REGEX`, `EMPTY`, `NOT_EMPTY`,
`BETWEEN`, `EQUALS_IGNORE_CASE`.

## Examples

```java
// Status
Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build()

// Body field via the JSONPath registry
Assertion.builder().target(BODY).key(TOKEN.getJsonPath()).type(NOT_NULL).expected(true).build()

// Header
Assertion.builder().target(HEADER).key("Content-Type").type(CONTAINS).expected("application/json").build()

// Soft — collected until complete()
Assertion.builder().target(BODY).key(TOTAL.getJsonPath()).type(GREATER_THAN).expected(0).soft(true).build()
```

## Assert status **and** payload

A status-only assertion is the most common way an API test passes while the feature
is broken: a 200 with an empty body satisfies it.

```java
.requestAndValidate(GET_USER.withPathParam(ID_PARAM, ID_THREE),
    Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build(),
    Assertion.builder().target(BODY).key(USER_ID.getJsonPath(0)).type(NOT_NULL).expected(true).build())
```

## Avoid

- **Whole-body equality** — an unrelated additive field breaks an unrelated test.
- **Asserting non-deterministic fields** — ids, timestamps, collection order. Use
  `MATCHES_REGEX` or `NOT_NULL`, or normalise first.
- **Skipping error paths** — assert the status, the error code, and the message shape.

## Status codes

Use `org.apache.http.HttpStatus` constants (`SC_OK`, `SC_CREATED`, `SC_NOT_FOUND`),
not integer literals.
