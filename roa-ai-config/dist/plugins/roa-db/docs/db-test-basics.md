# DB — Test Basics

```java
@DB
class AccountQueryTests extends BaseQuest {

    @Test
    @DisplayName("An archived account is excluded from the active query")
    @Ripper(targets = {DataCleaner.Data.DELETE_ACCOUNTS})
    void activeAccounts_whenOneArchived_excludesIt(
            Quest quest,
            @Craft(model = DataCreator.Data.ARCHIVED_ACCOUNT) Account archived) {

        quest
            .use(RING_OF_DB)
            .queryAndValidate(AppQueries.SELECT_ACTIVE_ACCOUNTS,
                Assertion.builder().target(QUERY_RESULT)
                         .type(NOT).expected(archived.getName()).build())
            .complete();
    }
}
```

## What each part is doing

| Part | Why |
| --- | --- |
| `@DB` | enables the DB ring |
| `extends BaseQuest` | parallel-safe, independent tests |
| `@Craft` | the fixture row, built by `DataCreator` |
| `@Ripper` | cleanup, including on the failure path |
| `queryAndValidate` | run and assert in one step — preferred |
| `.complete()` | mandatory; soft assertions flush here |

## Assert values, not counts

```java
// A count of 1 is satisfied by the wrong row
Assertion.builder().target(NUMBER_ROWS).type(IS).expected(1).build()

// Add the value the behaviour actually depends on
Assertion.builder().target(QUERY_RESULT).key("$[0].email")
         .type(IS).expected("john@example.com").build()
```

Operations: `db-ring.md`. Queries: `db-queries.md`. Assertions: `db-validation.md`.
