<!-- BEGIN ROA AI CONFIG: roa-api/api-testing -->

# API Testing Rules

- Assert the response content or resulting state the requirement names, through the project's JSONPath definitions; the status code alone proves only that the call returned.
- Each negative test breaks one input or precondition the contract defines, and asserts the contract's documented error.
- Setup — `@Craft` data, Journeys, other Rings — creates prerequisites but never sends the request the test exists to verify.
- Store a response value in Quest storage only when a later step, a cleanup, or another Ring needs it.

<!-- END ROA AI CONFIG: roa-api/api-testing -->
