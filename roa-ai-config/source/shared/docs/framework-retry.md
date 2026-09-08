# ROA Framework — Retry

`retryUntil` is a `FluentService` primitive, so every ring has it — UI, API, DB and
custom rings alike. It polls a condition until it holds or the window expires.

## The condition

`RetryCondition<T>` pairs a function that produces a value with a predicate that
decides success. `RetryConditionImpl` is the concrete form:

```java
RetryCondition<Boolean> dashboardVisible = new RetryConditionImpl<>(
    driver -> driver.find(By.cssSelector(".dashboard")).isDisplayed(),
    result -> result);
```

The framework calls the function repeatedly with the service object and checks the
predicate after each call.

Modules ship ready-made builders — `RetryConditionApi` (`io.cyborgcode.roa.api.retry`)
and `RetryConditionDb` (`io.cyborgcode.roa.db.retry`). Prefer them over hand-building
a condition for those rings.

## In a test

```java
quest.use(RING_OF_UI)
     .browser().navigate(getUiConfig().baseUrl())
     .retryUntil(dashboardVisible, Duration.ofSeconds(10), Duration.ofSeconds(1))
     .button().click(DashboardButtons.REFRESH)
     .drop()
     .complete();
```

`retryUntil(condition, maxWait, interval)` runs before the next step in the chain.

## In a custom ring

The four-argument form is `protected` on `FluentService` — it takes the service
object the condition's function expects. Wrap it in your ring rather than exposing
it to tests:

```java
public class CustomService extends FluentService {

    public CustomService waitUntilDashboardVisible(RetryCondition<Boolean> condition) {
        retryUntil(condition, Duration.ofSeconds(10), Duration.ofMillis(200), driver);
        return this;
    }
}
```

The `service` argument must match what `condition.function()` accepts — often
`SmartWebDriver` for UI flows, or the component/service instance elsewhere.

## When retry is right

- The system is documented as eventually consistent.
- An async process must finish before the assertion can hold.
- A known transient the product does not consider a defect — a cold container, a
  rate limit.

## When retry is wrong

- To make a flaky test pass. Retry hides the race; it does not remove it.
- Around an assertion that should already hold. It only delays the failure report
  and costs `maxWait` on every run.
- To mask a performance regression, which then ships unnoticed.

Keep the window as small as the behaviour genuinely needs. A window wide enough to
hide a slow query is wide enough to hide a real regression.

Module specifics: `api-retry.md`, `db-retry.md`, `ui-retry.md`.
