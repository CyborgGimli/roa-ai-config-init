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

## What a new component costs

All three layers, every time — that is the price of the abstraction, and it is worth
naming up front:

1. `ui/types/` — an enum constant naming the technology variant.
2. `ui/elements/` — the locator, bound to that type.
3. `ui/components/` — the implementation, annotated `@ImplementationOfType`.

Then `mvn pandora:navigation -U`, because Layer 1 and Layer 2 are both on the regeneration
list.

Adding a *locator* for an interaction that already exists is Layer 2 only. Check
whether the implementation is already there before writing a fourth one.

## Non-negotiable

The full list, with the mistakes each rule prevents, is in `ui-rules.md`.
