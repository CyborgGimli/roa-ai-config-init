# ROA Testing Standards

How an ROA test is shaped, regardless of which ring it drives. Module-specific test
shape lives in `ui-test-basics.md`, `api-test-basics.md` and `db-test-basics.md`.

## Test class

```java
@API                                  // ring marker: @UI / @API / @DB
class OrderTests extends BaseQuest {

    @Test
    @Smoke
    @DisplayName("An order can be placed with a valid payload")
    void placeOrder_withValidPayload_returnsCreated(Quest quest) {
        quest.use(RING_OF_API)
             // ... fluent chain
             .drop()
             .complete();
    }
}
```

- Extend `BaseQuest`. `BaseQuestSequential` only when ordering is genuinely required.
- `Quest` is the first method parameter, injected by JUnit 5.
- Name tests `action_condition_result`.
- `@DisplayName` carries the human-readable intent; keep it a real sentence.
- Tag with `@Smoke` / `@Regression`, or JUnit's `@Tag` — one convention per repo.
- `.complete()` is mandatory. Use try-finally where a chain can throw partway.

A class may carry more than one ring marker. Cross-ring tests — drive the UI, verify
in the database — are normal and are covered in the `*-test-cross-ring.md` chunks.

## One behaviour per test

A long chain that exercises five behaviours fails as one opaque unit. Prefer several
short tests: the failure then names itself.

## Validation

Every ring exposes the same two generic overloads:

```java
.validate(() -> Assertions.assertEquals(expected, actual))   // hard, JUnit
.validate(soft -> soft.assertThat(actual).isEqualTo(expected))  // soft, AssertJ
```

Beyond those, each module has its own preferred form:

| Module | Preferred | Notes |
| --- | --- | --- |
| UI | direct `validate*` on the component service | `Assertion.builder()` is for tables only |
| API | `requestAndValidate` with `Assertion.builder()` | targets `STATUS` / `BODY` / `HEADER` |
| DB | `queryAndValidate` with `Assertion.builder()` | targets `QUERY_RESULT` / `NUMBER_ROWS` / `COLUMNS` |

Soft assertions only report at `.complete()`. A chain missing it swallows them.

## Assertions that mean something

An assertion that would still pass with the feature removed is not an assertion.
Check the outcome a user or caller would actually observe, not merely that an
element, row or field exists.

## Test data lifecycle

Every test that creates data registers its cleanup:

```java
@Journey(value = Preconditions.Data.LOGIN,
         journeyData = {@JourneyData(DataCreator.Data.ADMIN)})
@Ripper(targets = {DataCleaner.Data.DELETE_USERS})
void test(Quest quest, @Craft(model = DataCreator.Data.USER) User user) { … }
```

- `@Ripper` runs even when the test fails — that is the point of it.
- Test data must be unique per run. A fixed id collides the moment two runs overlap.
- No test may depend on data another test created, or on execution order.

## Determinism

- No `Thread.sleep()`. Wait on the condition you actually depend on; where the wait
  is genuinely for eventual consistency, use `retryUntil` — see `framework-retry.md`.
- No dependence on wall-clock time, locale, or timezone unless that is the thing
  under test.
- No assertions on ids, timestamps, or ordering the system does not guarantee,
  unless you normalise them first.

## Marking a failure honestly

Classify every failure: **code issue**, **test issue**, **environment issue**,
**flaky**, or **unknown cause**. A flaky claim needs a differing re-run as evidence.
Never "fix" flakiness by widening a timeout — that hides the race rather than
removing it.
