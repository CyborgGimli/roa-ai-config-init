<!-- BEGIN ROA AI CONFIG: ${plugin_name}/waits -->
# Waiting Rules

- Wait through `SmartWebDriver`. `Thread.sleep` is never an acceptable wait.
- Wait for the condition you actually depend on - the element being interactable,
  the request having settled, the value having changed - not for time to pass.
- A wait that passes because the page has not begun re-rendering yet is a race,
  not a wait. Anchor on a state change, not on the absence of one.
- If a test only passes with a longer timeout, the wait is on the wrong condition.
<!-- END ROA AI CONFIG: ${plugin_name}/waits -->
