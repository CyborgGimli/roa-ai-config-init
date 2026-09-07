# ROA Framework — Validation

Assertions run inside the test through the ring. Rings expose component-specific
validators (names starting `validate...`) plus two generic overloads.

## Hard and soft

```java
// Hard — fails immediately. JUnit.
.validate(() -> Assertions.assertEquals(expected, actual))

// Soft — collected until quest.complete(). AssertJ SoftAssertions.
.validate(soft -> soft.assertThat(actual).isEqualTo(expected))
```

Soft assertions only report at `.complete()`. A chain missing `.complete()` silently
swallows them.

Use soft when checking several independent things about one state; use hard when a
later step is meaningless if this one failed.

## Assertion.builder()

Used where a ring method actually accepts an `Assertion`: UI **tables**, and
structured API/DB checks. Never for ordinary UI components.

```java
Assertion.builder()
    .target(TARGET)       // module-specific target enum
    .key("jsonPath")      // optional — where inside the payload
    .type(ASSERTION_TYPE) // how to compare
    .expected(value)
    .soft(true)           // collect until complete()
    .build();
```

## Targets by module

| Module | Target enum | Values |
| --- | --- | --- |
| API | `RestAssertionTarget` | `STATUS`, `BODY`, `HEADER` |
| DB | `DbAssertionTarget` | `QUERY_RESULT`, `NUMBER_ROWS`, `COLUMNS` |
| UI tables | `UiTablesAssertionTarget` | see the UI table chunk |

## Assertion types

`AssertionTypes` (`io.cyborgcode.roa.validator.core`):

`IS`, `NOT`, `CONTAINS`, `NOT_NULL`, `ALL_NOT_NULL`, `IS_NULL`, `ALL_NULL`,
`GREATER_THAN`, `LESS_THAN`, `CONTAINS_ALL`, `CONTAINS_ANY`, `STARTS_WITH`,
`ENDS_WITH`, `LENGTH`, `MATCHES_REGEX`, `EMPTY`, `NOT_EMPTY`, `BETWEEN`,
`EQUALS_IGNORE_CASE`.

UI tables use `TableAssertionTypes` instead.

## Results

Executing an `Assertion` produces an `AssertionResult` carrying the pass/fail verdict
and the diagnostic message. The validation engine emits these for reporting; tests do
not consume them directly — express the check through the ring and let `complete()`
surface it.

## Assertions that mean something

An assertion that would still pass with the feature removed is not an assertion.
Before committing one, ask what would still pass if the behaviour were deleted.
