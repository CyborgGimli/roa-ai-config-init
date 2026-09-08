# ROA Framework — Quest

`Quest` is a strict facade injected by JUnit 5 as the **first parameter** of every
test method. It orchestrates execution, owns the test's storage, and hands out rings.

## Test anatomy

```java
@UI
class GettingStartedTests extends BaseQuest {

    @Test
    @DisplayName("User can sign in with valid credentials")
    void login_withValidCredentials_succeeds(Quest quest) {
        quest
            .use(RING_OF_UI)
            .browser().navigate(getUiConfig().baseUrl())
            .input().insert(InputFields.USERNAME_FIELD, "value")
            .button().click(ButtonFields.LOGIN_BUTTON)
            .drop()
            .complete();
    }
}
```

## Base classes

| Class | Use when |
| --- | --- |
| `BaseQuest` | default — parallel-safe, independent tests |
| `BaseQuestSequential` | only when test ordering is genuinely required |

`BaseQuestSequential` runs `PER_CLASS` and adds two overridable class-level hooks,
each handed the `Services` container:

```java
class AdvancedFeaturesTest extends BaseQuestSequential {

    @Override
    protected void beforeAll(Services services) { }

    @Override
    protected void afterAll(Services services) { }
}
```

Reach for it only when the methods genuinely must share state — a wizard flow kept
alive across steps, or setup too expensive to repeat. Ordering that is merely
convenient is a reason to split the test, not to serialise the class.

`Services` is the Spring container, handed to those two hooks and nowhere else.
There is no Quest yet at that point, so `quest.use(...)` is not available; `Services`
is how you reach the plain service behind a ring instead:

```java
@Override
protected void beforeAll(Services services) {
    RestService restService = services.service(RestServiceFluent.class, RestService.class);
}
```

`service(fluentServiceClass, serviceClass)` finds the ring's Spring bean and returns
the field of the requested type inside it. The ring class has to implement
`ClassLevelHook`; the built-in ones do. If the ring holds more than one field of that
type you get the first, with a warning in the log.

This is class-level setup only. Inside a test, use the ring.

## Methods available in a test

| Method | Purpose |
| --- | --- |
| `use(RingClass)` | enter a fluent service (ring) |
| `retrieve(...)` | read from storage — see `framework-storage.md` |
| `hookData(key, Class)` | read what a class-level `@ApiHook` / `@DbHook` stored |
| `complete()` | finalise the test — **mandatory** |

`.complete()` is what flushes soft assertions and releases resources. A chain
without it leaves the test unfinished even if every assertion passed.

## What Quest is not

Not a service locator, not a configuration container, not a place to reach for
internals. `quest.getDriver()` is forbidden.

The ring's own accessor is different and is fine:

```java
var driver = quest.use(RING_OF_UI).getDriver();
```

## The same shape in every module

The ring changes; the anatomy does not.

```java
@API  class OrderApiTests extends BaseQuest { void t(Quest q) { q.use(RING_OF_API)…complete(); } }
@DB   class OrderDbTests  extends BaseQuest { void t(Quest q) { q.use(RING_OF_DB)…complete(); } }
```

## Outside a test body

```java
SuperQuest quest = QuestHolder.get();
```

Used by hooks, preconditions and cleanup functions, which run outside the method
that received the `Quest`.
