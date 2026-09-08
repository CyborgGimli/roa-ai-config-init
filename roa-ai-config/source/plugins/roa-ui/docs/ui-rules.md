# UI — Non-Negotiable Rules

| Rule | Why |
| --- | --- |
| **ROA ring only** | `quest.use(RING_OF_UI)` — a raw driver in a test breaks the abstraction and the reporting |
| **Smart API only** | `findSmartElement()`, never `findElement()`; `getDomAttribute()` / `getDomProperty()`, never `getAttribute()` |
| **Three layers required** | types + elements + implementations — no layer skipped |
| **Every locator in Layer 2** | a selector inlined in a test spreads the next markup change across every test that inlined it |
| **@ImplementationOfType** | links an implementation to its type via `Types.Data.CONSTANT` |
| **Hooks for sync only** | never business logic in a `before()` / `after()` hook |
| **Direct validation** | components use the `validate*` methods, not `Assertion.builder()` — tables are the exception |
| **No `quest.getDriver()`** | Quest internals are closed. `quest.use(RING_OF_UI).getDriver()` is the accessor |
| **No `Thread.sleep`** | wait on the condition — the loader service, an element hook, or `retryUntil` |
| **Always `complete()`** | soft assertions flush there; the lifecycle finalises there |

## Common mistakes

| Mistake | Instead |
| --- | --- |
| `By.cssSelector(...)` inline in a test | a constant in the Layer 2 element enum |
| `driver.findElement(...)` | `driver.findSmartElement(...)` |
| `getDomAttribute("value")` to read what the user typed | `getDomProperty("value")` — the attribute is the markup default |
| `Thread.sleep(2000)` after a click | `loader().waitToBeShownAndRemoved(...)`, or an element `before()` hook |
| `Assertion.builder()` on a button or input | the component's own `validate*` method |
| Implementing only `m(container)` | also the `m(container, label)` overload — both are abstract |
| A `Link` implementation with only `doubleClick` | `Link extends Button`; the whole `Button` set is owed |
| Business logic in an element hook | the test, or a custom ring method |
| `@Tag` where `HTML.Tag` was meant | `javax.swing.text.html.HTML.Tag` for `validateTextInField` |
| A new component that duplicates an existing one | extend the existing type, or add a variant |
| `Strategy.RANDOM` on an assertion path | an explicit target — a random failure is unreproducible |
| Type constant renamed in the enum but not in `Data` | keep them in step; the mismatch compiles and fails at runtime |

## Waiting

A wait that passes because the page has not begun re-rendering yet is a race, not a
wait. Anchor on a state change, not on the absence of one — the spinner having
appeared *and* gone, the value having changed, the request having settled.

If a test only passes with a longer timeout, the wait is on the wrong condition.

## Assertions

Assert the outcome a user would observe. `validateIsVisible` on an element that
renders unconditionally is not an assertion — it passes with the feature deleted.
Assert the value, the state, or the message the behaviour actually produces.
