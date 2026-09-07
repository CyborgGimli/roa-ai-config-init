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

## Methods available in a test

| Method | Purpose |
| --- | --- |
| `use(RingClass)` | enter a fluent service (ring) |
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

## Outside a test body

```java
SuperQuest quest = QuestHolder.get();
```

Used by hooks, preconditions and cleanup functions, which run outside the method
that received the `Quest`.
