<!-- BEGIN ROA AI CONFIG: roa-ui/ui-architecture -->

# UI Architecture

- Use the ROA UI Ring and established `AppUiService`/project UI abstractions for browser interaction.
- Reuse existing UI services, component types, component implementations, element definitions, tables, insertion models, authentication, interception, and domain services before creating new ones.
- Keep reusable component behavior in component implementations and application-specific locators/configuration in typed element definitions.
- Do not bypass established ROA abstractions with direct Selenium/WebDriver interaction unless the project architecture explicitly requires it.
- Ground DOM structure, locators, component behavior, network behavior, and browser/session behavior in the actual application through browser/DevTools evidence.
- Use supporting lifecycle mechanisms or other Rings only for prerequisites or independent verification; they must not replace the UI behavior under test.
- Use `ai-teacher` before generating new Java implementation code and `ai-compass` when exact ROA framework usage is unclear.
- If required application or framework evidence is unavailable, report the uncertainty instead of inventing behavior.

<!-- END ROA AI CONFIG: roa-ui/ui-architecture -->
