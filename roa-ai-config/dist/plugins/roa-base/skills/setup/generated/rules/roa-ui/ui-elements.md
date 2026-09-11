<!-- BEGIN ROA AI CONFIG: roa-ui/ui-elements -->

# UI Elements

- Represent application controls through the project's typed element abstractions; do not place raw selectors in tests.
- Derive locators from the actual rendered application and verify them through browser/DevTools inspection.
- Prefer the simplest stable locator that uniquely identifies the intended control.
- Avoid generated classes, fragile DOM chains, positional selectors, unstable identifiers, and guessed locators.
- Reuse an existing element definition when it represents the same application control and still matches the current application.
- Associate each element with the component type that matches its verified behavior; do not choose component types from appearance alone.
- Keep application-specific locator information in element definitions and reusable interaction behavior in component implementations.
- Use `ai-compass` rather than guessing exact element, component, or configuration contracts.

<!-- END ROA AI CONFIG: roa-ui/ui-elements -->
