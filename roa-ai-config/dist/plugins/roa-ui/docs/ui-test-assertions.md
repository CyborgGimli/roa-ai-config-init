# UI — Assertions in Tests

## Direct validators

Components have their own validators, and they read better than a generic assertion:

```java
.button().validateIsVisible(ButtonFields.SUBMIT)
.input().validateValue(InputFields.NAME, "expected")
.select().validateSelectedOptions(SelectFields.ACCOUNT, "Savings")
.alert().validateValue(AlertFields.TRANSFER_SUCCESS, "Transfer complete")
.modal().validateIsOpened(ModalFields.CONFIRM)
```

`ui-services.md` has the full validator list per service.

`Assertion.builder()` is for **tables** only — see `ui-tables.md`.

## Soft vs hard

Every `validate*` method takes an optional trailing `boolean soft`:

```java
.input().validateValue(InputFields.NAME, "expected", true)   // soft: collect, continue
.input().validateValue(InputFields.NAME, "expected")         // hard: fail immediately
```

Soft when checking several independent things about one screen; hard when a later
step is meaningless if the earlier one failed.

Soft assertions report at `.complete()`. A chain missing it swallows them silently.

## Text anywhere on the page

```java
.validate().validateTextInField(HTML.Tag.I, "Saved", true)
```

That `Tag` is `javax.swing.text.html.HTML.Tag` — not JUnit's `org.junit.jupiter.api.Tag`.
In a class using both, import one and qualify the other.

## Custom logic

```java
.validate(() -> {
    var driver = quest.use(RING_OF_UI).getDriver();
    var table = driver.findSmartElement(By.cssSelector(".board-content"));
    assertTrue(table.isDisplayed(), "Activity table should be visible");
})
```

Note `quest.use(RING_OF_UI).getDriver()` — the ring's accessor. `quest.getDriver()`
is the forbidden one.

Reach for this only when no validator covers the check. A raw selector here is the
same layering problem as a raw selector anywhere else: if you need it more than once,
it belongs in the element layer with a component behind it.

## Assertions that would pass with the feature removed

```java
// Weak: passes as long as the element renders at all
.button().validateIsVisible(ButtonFields.SUBMIT)

// Meaningful: passes only if the submission actually did something
.alert().validateValue(AlertFields.TRANSFER_SUCCESS, "Transfer complete")
```

Before committing an assertion, ask what would still pass if the feature were
deleted. If the answer is "this test", it is not doing its job.

A visibility check earns its place as a precondition — confirming the control is
there before clicking it — not as the assertion the test exists for.
