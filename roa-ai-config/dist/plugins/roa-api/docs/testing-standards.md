# ROA Testing Standards

How an ROA test is shaped, regardless of which ring it drives.

## Test class

```java
@UI                                   // ring marker: @UI / @API / @DB
class GettingStartedTests extends BaseQuest {

    @Test
    @Smoke
    @Description("User can sign in with valid credentials")
    void login_withValidCredentials_succeeds(Quest quest) {
        quest.use(RING_OF_UI)
             // ... fluent chain
             .drop()
             .complete();
    }
}
```

- Extend `BaseQuest`.
- `Quest` is the first method parameter, injected by JUnit 5.
- Name tests `action_condition_result`.
- `@Description` carries the human-readable intent; keep it a real sentence.
- `.complete()` is mandatory. Use try-finally or try-with-resources where a chain
  can throw partway.

## One behaviour per test

A long chain that exercises five behaviours fails as one opaque unit. Prefer several
short tests: the failure then names itself.

## Validation

- **Direct component validation**: `.input().validateValue(...)`,
  `.button().validateIsEnabled(...)`.
- **Soft assertion** (collect and continue):
  `.validate().validateTextInField(Tag.I, text, true)`.
- **Hard assertion** (fail immediately):
  `.validate().validateTextInField(Tag.I, text, false)` — or omit the flag.
- **Tables**: `.table().validate(Tables.X, Assertion.builder()...)`.

`Assertion.builder()` is for table validation only. Do not reach for it on ordinary
components — the direct validators exist and read better.

## Assertions that mean something

An assertion that would still pass with the feature removed is not an assertion.
Check the outcome a user or caller would actually observe, not merely that an
element or field exists.

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

- No `Thread.sleep()`. Wait on the condition you actually depend on.
- No dependence on wall-clock time, locale, or timezone unless that is the thing
  under test.
- No assertions on ids, timestamps, or ordering the system does not guarantee,
  unless you normalise them first.

## Marking a failure honestly

Classify every failure: **code issue**, **test issue**, **environment issue**,
**flaky**, or **unknown cause**. A flaky claim needs a differing re-run as evidence.
Never "fix" flakiness by widening a timeout — that hides the race rather than
removing it.
