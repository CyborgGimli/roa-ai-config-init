# DB — The Ring

`RING_OF_DB` resolves to `DatabaseServiceFluent`. Tests never open a JDBC connection
themselves.

## Operations

| Call | Use |
| --- | --- |
| `query(dbQuery)` | run a query; response stored, validate later |
| `query(dbQuery, jsonPath, resultType)` | run and extract one typed value |
| `queryAndValidate(dbQuery, assertions...)` | run and assert in one step — **preferred** |
| `validate(queryResponse, assertions...)` | assert a response you already hold |
| `validate(Runnable)` | hard assertion |
| `validate(Consumer<SoftAssertions>)` | soft assertion |
| `retryUntil(condition, maxWait, interval)` | eventual consistency — see `db-retry.md` |

## Shape

```java
@DB
class AccountQueryTests extends BaseQuest {

    @Test
    void activeAccounts_whenOneArchived_excludesIt(Quest quest) {
        quest
            .use(RING_OF_DB)
            .queryAndValidate(AppQueries.SELECT_ACTIVE_ACCOUNTS,
                Assertion.builder().target(NUMBER_ROWS).type(GREATER_THAN).expected(0).build())
            .complete();
    }
}
```

## Cross-ring

The most common use of the DB ring is verifying that a UI or API action actually
persisted:

```java
quest.use(RING_OF_UI)
     .button().click(ButtonFields.SAVE)
     .drop()
     .use(RING_OF_DB)
     .queryAndValidate(AppQueries.SELECT_ACCOUNT_BY_ID.withParam("id", id),
         Assertion.builder().target(NUMBER_ROWS).type(IS).expected(1).build())
     .complete();
```

A success toast proves the UI reacted. It does not prove anything was written.
