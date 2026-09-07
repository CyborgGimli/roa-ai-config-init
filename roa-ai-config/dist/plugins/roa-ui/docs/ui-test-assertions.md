# UI — Assertions in Tests

## Soft vs hard

```java
// Hard — stops at the first failure
.validate().validateTextInField(Tag.I, "Saved", false)

// Soft — collects failures and continues, so one run reports everything wrong
.validate().validateTextInField(Tag.I, "Saved", true)
```

Soft when checking several independent things about one screen; hard when a later
step is meaningless if the earlier one failed.

Soft assertions report at `.complete()`. A chain missing it swallows them silently.

## Direct validators

Components have their own validators, and they read better than a generic assertion:

```java
.button().validateIsVisible(ButtonFields.SUBMIT)
.input().validateValue(InputFields.NAME, "expected")
.select().validateValue(SelectFields.ACCOUNT, "Savings")
```

`Assertion.builder()` is for **tables** only — see `ui-tables.md`.

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

## Assertions that would pass with the feature removed

```java
// Weak: passes as long as the element renders at all
.label().validateIsVisible(LabelFields.TOTAL)

// Meaningful: passes only if the calculation is right
.label().validateValue(LabelFields.TOTAL, "42.00")
```

Before committing an assertion, ask what would still pass if the feature were
deleted. If the answer is "this test", it is not doing its job.
