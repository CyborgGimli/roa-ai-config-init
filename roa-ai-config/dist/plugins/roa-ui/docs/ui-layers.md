# UI — The Three Layers

Every UI component exists in all three layers. Nothing skips one.

| Layer | Location | Holds |
| --- | --- | --- |
| 1. Component Types | `ui/types/` | which UI technology variant (Bootstrap, Vaadin, …) |
| 2. UI Elements | `ui/elements/` | locators, the type each uses, optional sync hooks |
| 3. Implementations | `ui/components/` | the actual Selenium interaction |

Detail per layer: `ui-types.md`, `ui-elements.md`, `ui-components.md`.
The facade that exposes them to tests: `ui-facade.md`.

## Why it is enforced

A test carrying its own locator looks shorter and costs more the first time the
markup changes: the fix is now spread across every test that inlined it. Locators in
Layer 2 make a markup change one edit. Selenium calls confined to Layer 3 mean a
Selenium upgrade never touches a test.

A test reaching into `ui/types/` is a layering bug, not a shortcut.

## Technology variants

Layer 1 exists to absorb the difference between stacks:

- **Bootstrap** — `By.id`, `By.className`, `By.cssSelector`
- **Vaadin** — `vaadin-` prefixed tags, slot navigation
- **Angular / React** — prefer stable `data-test` hooks over structural CSS
- **Web components** — shadow DOM traversal

Prefer a stable test hook over a structural selector in every case. A selector tied
to layout breaks when someone adds a wrapper `div`.

## Non-negotiable

| Rule | Description |
| --- | --- |
| **Smart API only** | `findSmartElement()`, never `findElement()`; `getDomAttribute()`, never `getAttribute()` |
| **Three layers required** | types + elements + implementations |
| **@ImplementationOfType** | links an implementation to its type via `Types.Data.CONSTANT` |
| **Hooks for sync only** | never business logic in `before()` / `after()` |
| **Direct validation** | components use `validate*` methods, not `Assertion.builder()` — tables excepted |
