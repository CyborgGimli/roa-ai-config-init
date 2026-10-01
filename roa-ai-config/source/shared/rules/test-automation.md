<!-- BEGIN ROA AI CONFIG: shared/test-automation -->

# Test Automation Rules

- A test proves one named behavior and performs that action itself. Journeys, authentication, and other Rings only prepare prerequisites or verify independently; they never perform the action under test.
- Assert the outcome the requirement names, where it is observable: the UI element that renders it, the response field or resulting state, the row values. A status code, element presence, row count, or absence of an exception is not proof when the requirement concerns content.
- Expectations come from the requirement or the contract, never from what the code currently returns.
- Use controlled data that is unique per run when it persists, and register cleanup (`DataCleaner`, Rippers) for everything the test creates, including when it fails partway.
- Tests run in parallel: no shared mutable state, execution-order dependence, or reliance on leftover data.
- Synchronize on observable conditions, never on elapsed time.
- A failure is evidence. Classify it — automation, application, data, environment, or contract — before changing code, and never weaken, skip, or disable a test to get a green run.

<!-- END ROA AI CONFIG: shared/test-automation -->
