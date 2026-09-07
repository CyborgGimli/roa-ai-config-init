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

## Module annotations

`@AuthenticateViaUi` / `@InterceptRequests` (UI), `@AuthenticateViaApi` /
`@ApiHook` (API), `@DbHook` (DB). See the module chunks.

Every creator needs a matching cleaner. Data created without cleanup is the most
common cause of a suite that degrades over time.
