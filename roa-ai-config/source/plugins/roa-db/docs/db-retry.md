# DB — Retry and Eventual Consistency

## Pattern

```java
quest.use(RING_OF_DB)
     .retryUntil(condition, Duration.ofSeconds(10), Duration.ofSeconds(1))
     .queryAndValidate(AppQueries.SELECT_ACCOUNT_BY_ID.withParam("id", id),
         Assertion.builder().target(NUMBER_ROWS).type(IS).expected(1).build())
     .complete();
```

Build conditions with `RetryConditionDb` (`io.cyborgcode.roa.db.retry`).

The mechanism itself is `FluentService`-level and is the same in every ring:
The `ai-compass` metadata for `RetryCondition` and `RetryConditionImpl` covers the
protected four-argument form for custom rings.

## When retry is right

- A write goes through an async pipeline before it lands in the table being read.
- The query targets a read replica with documented lag.
- A CI-only transient the product does not consider a defect.

## When retry is wrong

- To make a flaky test pass. Retry hides the race rather than removing it.
- Around a query that should already be satisfied — it only delays the failure and
  costs `maxWait` on every run.
- To mask a performance regression, which then ships unnoticed.

## Slow queries

The framework detects and reports slow queries. A retry window wide enough to hide
one is a window wide enough to hide a real regression — keep it as small as the
behaviour genuinely needs.
