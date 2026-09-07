# DB — Preconditions and Cleanup

This is where database tests most often go wrong.

## Seeding through preconditions

```java
@Test
@DisplayName("Counting accounts by owner returns only that owner's rows")
@Journey(value = Preconditions.Data.SEED_ACCOUNTS,
         journeyData = {@JourneyData(DataCreator.Data.OWNER_WITH_THREE_ACCOUNTS)})
@Ripper(targets = {DataCleaner.Data.DELETE_ACCOUNTS})
void countByOwner_whenOtherOwnersExist_countsOnlyTheOwner(Quest quest) {
    quest
        .use(RING_OF_DB)
        .queryAndValidate(AppQueries.COUNT_ACCOUNTS_BY_OWNER.withParam("ownerId", ownerId),
            Assertion.builder().target(QUERY_RESULT).key("$[0].total")
                     .type(IS).expected(3).build())
        .complete();
}
```

Seeding rows for a **second owner** is what makes this test meaningful. Without them
it passes even if the `WHERE` clause were dropped entirely.

## Cleanup on the failure path

```java
@Test
@DisplayName("Archiving sets archived_at")
@Ripper(targets = {DataCleaner.Data.DELETE_ACCOUNTS})   // runs even when the test fails
void archive_whenCalled_setsArchivedAt(
        Quest quest,
        @Craft(model = DataCreator.Data.ACCOUNT) Account account) { … }
```

A test that only tidies up when it passes leaves rows behind exactly when someone is
already debugging something else.

## Unique per run

```java
// Fragile: two overlapping runs collide, and the failure looks like a product bug
final String name = "Payments";

// Robust
final String name = "Payments-" + UUID.randomUUID();
```

## Class-level setup

Connectivity checks and shared reference data belong in `@DbHook`, not in every
test — see `db-hooks.md`.

| Scope | Mechanism |
| --- | --- |
| Once per class | `@DbHook(when = BEFORE/AFTER, …)` |
| Per test, before the body | `@Journey` |
| Per test, after — including on failure | `@Ripper` |
| Built model as a parameter | `@Craft` |
