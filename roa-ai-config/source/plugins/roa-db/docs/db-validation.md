# DB — Validation

Prefer `queryAndValidate(...)` with `Assertion.builder()`. Fall back to `query(...)`
then `validate(...)` when the check needs custom logic.

## Targets

`DbAssertionTarget`:

| Target | Asserts on |
| --- | --- |
| `QUERY_RESULT` | the result set, addressed by JSONPath |
| `NUMBER_ROWS` | the row count |
| `COLUMNS` | the column set |

## Types

`AssertionTypes`: `IS`, `NOT`, `CONTAINS`, `NOT_NULL`, `ALL_NOT_NULL`, `IS_NULL`,
`ALL_NULL`, `GREATER_THAN`, `LESS_THAN`, `CONTAINS_ALL`, `CONTAINS_ANY`,
`STARTS_WITH`, `ENDS_WITH`, `LENGTH`, `MATCHES_REGEX`, `EMPTY`, `NOT_EMPTY`,
`BETWEEN`, `EQUALS_IGNORE_CASE`.

## Examples

```java
// Row count
Assertion.builder().target(NUMBER_ROWS).type(IS).expected(1).build()

// A value in the result set
Assertion.builder().target(QUERY_RESULT).key("$[0].username").type(IS).expected("john_doe").build()

// Column presence
Assertion.builder().target(COLUMNS).type(CONTAINS_ALL).expected(List.of("id", "username")).build()

// Soft — collected until complete()
Assertion.builder().target(NUMBER_ROWS).type(GREATER_THAN).expected(0).soft(true).build()
```

## Assert the values, not just the count

A count of 1 is satisfied by the wrong row:

```java
.queryAndValidate(UserQueries.GET_BY_ID.withParam("id", 42),
    Assertion.builder().target(NUMBER_ROWS).type(IS).expected(1).build(),
    Assertion.builder().target(QUERY_RESULT).key("$[0].email").type(IS).expected("john@example.com").build())
```

## Test the invariant

A migration that adds a constraint needs a test that would fail without it. Asserting
that the happy-path insert works does not test the constraint — only the rejected
duplicate does.
