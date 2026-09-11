<!-- BEGIN ROA AI CONFIG: roa-api/api-testing -->

# API Testing Rules

- Design API tests around the behavior and requirement being verified, not around individual framework calls.
- Ground expected request and response behavior in Swagger/OpenAPI or another explicit requirement source; do not rely on general REST conventions.
- Use deliberate, controlled inputs and preconditions so failures are attributable to the intended scenario.
- Validate meaningful outcomes, not only successful status codes, when the requirement depends on response content or resulting application state.
- Keep negative scenarios focused and intentional; do not combine unrelated invalid conditions unless the requirement specifically depends on that combination.
- Preserve the behavior under test: setup may create prerequisites, but it must not perform the API action the test exists to verify.
- Reuse established authentication, lifecycle, test-data, cleanup, and domain abstractions instead of duplicating setup logic in tests.
- Keep tests independently executable where practical and avoid hidden dependencies on execution order, shared mutable state, or leftover environment data.
- Do not weaken assertions, change correct expectations, or mask application failures merely to obtain a passing result.
- Use cross-Ring setup or verification only when it materially improves the scenario and does not introduce unnecessary complexity.

<!-- END ROA AI CONFIG: roa-api/api-testing -->
