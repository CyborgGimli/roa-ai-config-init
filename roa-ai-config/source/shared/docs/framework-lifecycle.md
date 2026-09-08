# ROA Framework — Lifecycle Annotations

Setup, cleanup and data injection are declarative. Keeping them out of the test body
means a login regression fails the login test, not every test that happened to sign in.

## @Journey — preconditions

Runs before the test body. Multiple journeys run in `order`.

```java
@Test
@Journey(value = Preconditions.Data.LOGIN_PRECONDITION,
         journeyData = {@JourneyData(DataCreator.Data.SELLER)},
         order = 1)
@Journey(value = Preconditions.Data.ORDER_PRECONDITION,
         journeyData = {@JourneyData(DataCreator.Data.ORDER)},
         order = 2)
void testWithPreconditions(Quest quest) { }
```

`@JourneyData` names the `DataCreator` constants the journey takes as arguments; omit
it for a journey that needs no input. The values arrive as the `Object[]` the
`Preconditions` enum unpacks.

`@PreQuest({ @Journey(...), @Journey(...) })` is an older container form for the same
thing. `@Journey` repeats on its own, so stacking it is the shorter spelling — use
the container only in code that already does.

## @Ripper — cleanup

Runs after the test **even when it fails** — which is the case that matters, since a
test that throws halfway is the one that leaves state behind.

```java
@Test
@Ripper(targets = {DataCleaner.Data.DELETE_CREATED_ORDERS})
void testWithCleanup(Quest quest) { }
```

## @Craft — data injection

Injects a built model as a test parameter.

```java
@Test
void testWithCraftedData(Quest quest,
                         @Craft(model = DataCreator.Data.SELLER) Seller seller,
                         @Craft(model = DataCreator.Data.ORDER) Order order) { }
```

## @StaticTestData — preloaded data

```java
@Test
@StaticTestData(StaticData.class)
void testWithStaticData(Quest quest) {
    String value = retrieve(staticTestData(StaticData.KEY), String.class);
}
```

## Late data

For data that depends on runtime state, take a `Late<T>` and build it at the moment
it is needed:

```java
@Test
void testWithLateData(Quest quest,
                      @Craft(model = DataCreator.Data.LATE_ORDER) Late<Order> lateOrder) {
    quest.use(RING_OF_CUSTOM)
         .doSomethingFirst()
         .createOrder(lateOrder.create())
         .complete();
}
```

## Class-level hooks

`@ApiHook` (API) and `@DbHook` (DB) run a named flow once per class. `when` takes
`HookExecution` (`io.cyborgcode.roa.framework.hooks`):

| Value | Runs |
| --- | --- |
| `HookExecution.BEFORE` | once before any `@Test` in the class |
| `HookExecution.AFTER` | once after every `@Test` in the class has finished |

```java
@DB
@DbHook(when = HookExecution.BEFORE, type = "INITIALIZE_H2")
class AdvancedFeaturesTest extends BaseQuest {
}
```

Use `BEFORE` for one-time environment setup (seed, warm-up) and `AFTER` for one-time
teardown. Cleanup that must run **per test** is `@Ripper`, not an `AFTER` hook — a
class hook does not run between tests, so a failure leaves state behind for the rest
of the class.

What a hook stored is read back with `hookData(...)`. See `api-hooks.md` and
`db-hooks.md`.

## Selection tags

Two mechanisms exist and both are in use:

| Form | Notes |
| --- | --- |
| `@Smoke`, `@Regression` | ROA annotations, `io.cyborgcode.roa.framework.annotation` |
| `@Tag("Smoke")`, `@Tag("Regression")` | plain JUnit 5 tags |

Pick one per repository and stay with it — a suite filtered by `-Dgroups=Smoke` will
silently miss tests marked the other way.

## Module annotations

`@AuthenticateViaUi` / `@InterceptRequests` (UI), `@AuthenticateViaApi` /
`@ApiHook` (API), `@DbHook` (DB). See the module chunks.

Every creator needs a matching cleaner. Data created without cleanup is the most
common cause of a suite that degrades over time.
