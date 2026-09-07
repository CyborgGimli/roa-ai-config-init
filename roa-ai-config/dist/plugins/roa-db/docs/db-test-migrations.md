# DB — Testing Migrations

A schema change is tested by a test that would **fail without it**. Asserting that
the happy-path insert still works does not test a new constraint.

## Testing a constraint

```java
@Test
@DisplayName("The owner/name unique constraint rejects a duplicate")
@Ripper(targets = {DataCleaner.Data.DELETE_ACCOUNTS})
void insertDuplicate_whenSameOwnerAndName_isRejected(Quest quest) {
    quest
        .use(RING_OF_DB)
        // insert the first account — succeeds
        // insert a duplicate — the unique constraint must reject it
        .complete();
}
```

Only the rejected insert exercises the constraint.

## Testing a new column

```java
Assertion.builder().target(COLUMNS).type(CONTAINS_ALL)
         .expected(List.of("id", "owner_id", "archived_at")).build()
```

`COLUMNS` asserts the column set — useful for confirming a migration actually ran
against the environment under test.

## Migration hygiene

- Safe to run online; reversible where the data allows it.
- One migration per schema change, not a batch that half-applies.
- A migration requiring downtime is a decision for the team, not a side effect of a
  test change.

## Backfills

A backfill is data, not schema. Test the resulting state, not the script: assert that
rows which should have been populated were, **and** that rows which should not have
been were left alone. A backfill that touched everything passes a test that only
checks the first half.
