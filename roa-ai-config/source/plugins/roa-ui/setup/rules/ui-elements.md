<!-- BEGIN ROA AI CONFIG: roa-ui/ui-elements -->

# UI Elements and Components

- Identify a control in the live DOM before modelling it: a native element (`input`, `select`, `option`, `input[type=checkbox|radio]`, `button`, `a`) or a custom widget whose state lives in a class, an `aria-*` attribute, or a wrapper. Record where it keeps its state.
- The component type follows the control's technology and behavior, not its appearance or package neighbors. Two controls share a component type and implementation only when they behave the same way.
- In a component implementation, read state where the DOM keeps it. Native controls: `isSelected()` for checkboxes, radios, and options, `isEnabled()`, and `getDomProperty("value")` for inputs — the HTML attributes `checked`, `selected`, and `value` keep the page's initial state, not the current one. Custom widgets: the class or `aria-*` state verified in the DOM. Never copy a state-reading helper from an implementation for a different kind of control.
- Implement every method the ROA component interface declares, with the parameter names `ai-compass` shows; select and deselect act only when the state needs to change.
- Choose the simplest stable locator that is unique: `id`, then `name` or another stable attribute, then the visible text for a link (`By.linkText`). Avoid generated classes, positions, and long DOM chains.
- Name a new element constant with the page or feature prefix its neighbors use. When the enum has a nested `Data` class, add the constant's string mirror there for any constant an annotation references (`@InsertionElement`, `@ImplementationOfType`) and static-import it where it is used.
- Reuse an existing element constant when it is the same control and its locator still matches the DOM.

<!-- END ROA AI CONFIG: roa-ui/ui-elements -->
