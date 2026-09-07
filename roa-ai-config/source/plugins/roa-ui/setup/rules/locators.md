<!-- BEGIN ROA AI CONFIG: ${plugin_name}/locators -->
# Locator Rules

- Locators belong in the element layer, never inline in a test or component action.
- Prefer stable hooks (test ids, roles, labels) over CSS or XPath tied to structure.
- Never build a locator from generated text that changes with data or locale.
- When a locator must be dynamic, take the varying part as a parameter rather than
  assembling a string at the call site.
<!-- END ROA AI CONFIG: ${plugin_name}/locators -->
