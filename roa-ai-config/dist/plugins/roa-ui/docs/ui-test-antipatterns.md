# UI — Test Anti-Patterns

Each of these looks like a shortcut and transfers a cost to whoever debugs the suite
next.

```java
Thread.sleep(2000);                            // wait on a condition, never on time
WebDriver driver = quest.getDriver();          // never reach into Quest internals
driver.findElement(By.id("save")).click();     // use the component layer
final By save = By.id("save");                 // locators live in Layer 2
```

| Anti-pattern | Why it hurts | Instead |
| --- | --- | --- |
| `Thread.sleep` | passes or fails on machine speed, not behaviour | wait on the real condition via `SmartWebDriver` |
| `quest.getDriver()` | bypasses the framework's lifecycle | `quest.use(RING_OF_UI).getDriver()` where genuinely needed |
| `findElement` | no staleness recovery | `findSmartElement` |
| `getAttribute` | not normalised | `getDomAttribute` |
| Inline locator | one markup change, many edits | Layer 2 element enum |
| Test reaching into `types` | layering bug | go through the component |
| Missing `.complete()` | soft assertions never report | always finish the chain |
| Widening a timeout to fix flakiness | hides the race, does not remove it | fix the wait condition |
| Business logic in a `before()` hook | hides behaviour from the test driving it | keep hooks to synchronisation |
| Data created without a cleaner | suite degrades run by run | matching `@Ripper` |
| Fixed fixture id | collides when runs overlap; looks like a product bug | generate per run |

## Assertions

```java
// Passes with the feature deleted
.label().validateIsVisible(LabelFields.TOTAL)

// Actually checks the behaviour
.label().validateValue(LabelFields.TOTAL, "42.00")
```

## Structure

A test exercising five behaviours fails as one opaque unit. Prefer several short
tests that name their own failure — see `ui-test-basics.md`.
