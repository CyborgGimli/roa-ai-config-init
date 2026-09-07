# API — Retry and Eventual Consistency

Some assertions are correct but not yet true: an async job has not finished, a
read replica has not caught up, or CI is briefly unstable.

## Pattern

```java
quest.use(RING_OF_API)
     .retryUntil(condition, Duration.ofSeconds(10), Duration.ofSeconds(1))
     .requestAndValidate(GET_USER.withPathParam(ID_PARAM, id),
         Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build())
     .complete();
```

`retryUntil(condition, maxWait, interval)` — build conditions with
`RetryConditionApi` (`io.cyborgcode.roa.api.retry`).

The mechanism itself is `FluentService`-level and is the same in every ring:
`framework-retry.md` covers `RetryCondition`, `RetryConditionImpl`, and the
protected four-argument form for custom rings.

## When retry is right

- The system is documented as eventually consistent.
- An async process must complete before the assertion can hold.
- A known transient (a cold container, a rate limit) that the product does not
  consider a defect.

## When retry is wrong

- To make a flaky test pass. Retry hides the race; it does not remove it.
- To paper over a genuine performance regression — the test then passes while the
  product gets slower.
- Around an assertion that should be true immediately. If it is, retry only delays
  the failure report.

Retrying an assertion that was never going to pass costs `maxWait` on every run.
Keep the window as small as the behaviour genuinely needs.
