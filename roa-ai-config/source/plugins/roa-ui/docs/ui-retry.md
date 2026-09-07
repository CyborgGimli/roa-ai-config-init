# UI — Waiting and Retry

The mechanism — `RetryCondition`, `retryUntil`, custom-ring wrappers — is in
`framework-retry.md`. This is which wait to reach for in a UI test, and in what
order.

## Prefer, in this order

1. **The loader service.** If the app shows a spinner, that is the signal:

   ```java
   .button().click(ButtonFields.SUBMIT)
   .loader().waitToBeShownAndRemoved(LoaderFields.PAGE_SPINNER, 10)
   ```

   `waitToBeShownAndRemoved` covers both edges, so it cannot pass by running before
   the spinner appeared — which is exactly how `waitToBeRemoved` alone gives a green
   test on a page that never started loading.

2. **An element hook.** A control that always needs the same wait carries it in
   Layer 2, so no test has to remember:

   ```java
   SIGN_IN_BUTTON(By.id("signin_button"), ButtonFieldTypes.BOOTSTRAP_BUTTON_TYPE,
       driver -> SharedUiFunctions.waitForPresence(driver, By.id("signin_button")),
       driver -> {}),
   ```

3. **Interception.** Waiting on the request having settled, rather than on the
   element the request eventually updates — see `ui-interception.md`.

4. **`retryUntil`.** Last, for the case none of the above covers.

## retryUntil

```java
RetryCondition<Boolean> dashboardVisible = new RetryConditionImpl<>(
    driver -> driver.find(By.cssSelector(".dashboard")).isDisplayed(),
    result -> result);

quest.use(RING_OF_UI)
     .browser().navigate(getUiConfig().baseUrl())
     .retryUntil(dashboardVisible, Duration.ofSeconds(10), Duration.ofSeconds(1))
     .button().click(DashboardButtons.REFRESH)
     .drop()
     .complete();
```

Unlike API and DB, the UI module ships no ready-made condition builder — build the
`RetryConditionImpl` yourself, and make sure the function accepts the service object
the ring passes it (`SmartWebDriver` for `RING_OF_UI`).

If the same condition appears in more than two tests, it belongs in a custom ring
method, not repeated in each of them.

## When retry is wrong here

The UI is the module where retry is most often reached for and least often right.

- **A slow-rendering element** is a wait problem, not a retry problem. Wait on the
  element, or on the spinner that precedes it.
- **A stale element reference** means the page re-rendered between find and use.
  Retrying the whole condition hides it; re-resolving through the component fixes it.
- **An intermittently missing element** with no async cause behind it is a product
  bug or a locator bug. Retry turns a reproducible failure into an occasional one.

A retry window wide enough to absorb a rendering regression will absorb it silently,
every run, until someone profiles the suite and asks where the minutes went.
