# ROA UI Plugin

AI-assisted UI test development for the ROA framework.

## What it does

Guides UI test creation through ROA's three-layer component architecture:

1. **Component types** (`ui/types/`) — which UI technology variant a control uses
   (Bootstrap, Vaadin, Angular, web components)
2. **UI elements** (`ui/elements/`) — locators, the type each uses, and optional
   synchronisation hooks
3. **Component implementations** (`ui/components/`) — the actual Selenium
   interaction, annotated `@ImplementationOfType`

Every component exists in all three layers. A test carrying its own locator is a
layering bug, not a shortcut: locators in Layer 2 make a markup change one edit,
and Selenium confined to Layer 3 means a Selenium upgrade never touches a test.

## Using this plugin

1. `/roa-base:setup roa-ui`, then `/reload-plugins --force`
2. `/roa-ui:roa-ui-architect <flow to cover>` to design and generate tests
3. Read the single-topic chunks in `docs/` — start at `ui-architecture.md`, then
   `ui-layers.md`
4. Load `ai-compass` for any ROA signature that is unclear

## Core concepts

- **AppUiService** — the central UI facade, extending `UiServiceFluent`
- **Fluent chaining** — every method returns `this`; the chain ends `.complete()`
- **SmartWebDriver** — use `findSmartElement()`, never `findElement()`
- **Validation** — direct methods (`.input().validateValue()`), or
  `Assertion.builder()` for tables

## Key constraints

- ✓ Three layers mandatory — types → elements → implementations
- ✓ Enums use a nested `Data` class for the string keys annotations reference
- ✓ Component implementations carry `@ImplementationOfType`
- ✓ Locators come from the rendered application, never from a guess
- ✓ Waits target an observable condition — never `Thread.sleep`
- ✓ Assertions prove a visible or business outcome, not that a click succeeded
- ✓ Table rows are selected by business data, not by row index
- ✓ Every chain ends with `.complete()`

Layers 1 and 2 are both on the Pandora regeneration list — run
`mvn pandora:navigation -U` after changing either.

---

Reference docs ship in `docs/`; skills in `skills/`; the flakiness reviewer and
application investigator in `agents/`.
