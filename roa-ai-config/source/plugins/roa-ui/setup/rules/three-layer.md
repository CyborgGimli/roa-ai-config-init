<!-- BEGIN ROA AI CONFIG: ${plugin_name}/three-layer -->
# Three-Layer UI Architecture

Every UI component exists in all three layers. Nothing skips one.

- **types** (`ui/types/`) — an enum naming the UI technology variant (Bootstrap,
  Vaadin, …). It exists so one logical element can be rendered differently in two
  apps without changing any test.
- **elements** (`ui/elements/`) — an enum binding a locator to a component type,
  with optional `before()` / `after()` synchronisation hooks. **Every locator in the
  repository lives here.**
- **components** (`ui/components/`) — the class that performs the Selenium
  interaction, annotated `@ImplementationOfType` and extending `BaseComponent`.

Tests drive components through the ring's service fluents, never directly. A test
that reaches into `types`, or that carries an inline selector, is a layering bug and
not a shortcut - fix the layer instead.

Selenium calls belong in the component layer only. `findSmartElement()`, never
`findElement()`; `getDomAttribute()` / `getDomProperty()`, never `getAttribute()`.
<!-- END ROA AI CONFIG: ${plugin_name}/three-layer -->
