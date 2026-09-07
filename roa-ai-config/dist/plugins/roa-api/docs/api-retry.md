# API — Retry and Eventual Consistency

Some assertions are correct but not yet true: an async job has not finished, a
read replica has not caught up, or CI is briefly unstable.

## Pattern

```java
quest.use(RING_OF_API)
     .retryUntil(
         statusEquals(GET_USER.withPathParam(ID_PARAM, USER_ID_TWO), SC_OK),
         Duration.ofSeconds(10),
         Duration.ofSeconds(2))
     .requestAndValidate(GET_USER.withPathParam(ID_PARAM, USER_ID_TWO),
         Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build())
     .complete();
```

`retryUntil(condition, maxWait, retryInterval)` polls until the condition holds or
`maxWait` elapses, then continues the chain.

## Ready-made conditions

`RetryConditionApi` (`io.cyborgcode.roa.api.retry`) covers the API cases. Prefer
these over a custom condition.

| Factory | Polls until |
| --- | --- |
| `statusEquals(endpoint, status)` | the status code matches |
| `statusEquals(endpoint, body, status)` | same, for an endpoint needing a payload |
| `responseFieldEqualsTo(endpoint, jsonPath, expected)` | a body field equals a value |
| `responseFieldEqualsTo(endpoint, body, jsonPath, expected)` | same, with a payload |
| `responseFieldNonNull(endpoint, jsonPath)` | a body field becomes non-null |
| `responseFieldNonNull(endpoint, body, jsonPath)` | same, with a payload |

```java
responseFieldEqualsTo(GET_USER.withPathParam(ID_PARAM, id), USER_EMAIL.getJsonPath(), USER_FOUR_EMAIL)
responseFieldNonNull(POST_LOGIN, loginRequest, TOKEN.getJsonPath())
```

Take the JSONPath from `ApiResponsesJsonPaths`, never as a raw string — the rule does
not relax inside a retry condition.

Each of these **issues a fresh request on every attempt**. They do not inspect the
stored response, so the endpoint is genuinely hit `maxWait / retryInterval` times in
the worst case. Keep the interval honest.

Custom conditions are `RetryConditionImpl` and are covered by `framework-retry.md`,
along with the protected four-argument `retryUntil` for custom rings.

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
