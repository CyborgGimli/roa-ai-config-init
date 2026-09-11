<!-- BEGIN ROA AI CONFIG: shared/test-automation -->

# Test Automation Rules

- Automate the behavior required by the task and assert outcomes that meaningfully prove that behavior.
- Do not make a test pass by weakening assertions, deleting coverage, skipping tests, masking failures, or changing expected behavior without evidence.
- Keep tests deterministic and independently executable unless sequential/shared-state behavior is an intentional part of the scenario.
- Use controlled test data and explicit preconditions; avoid hidden dependencies on execution order, leftover state, or unrelated tests.
- Design cleanup for state-changing scenarios and reuse established Journeys, Rippers, `DataCleaner` implementations, and other lifecycle abstractions where appropriate.
- Preserve the behavior under test: supporting Rings or setup mechanisms may prepare prerequisites or perform independent verification, but must not replace the action the test exists to prove.
- Reuse existing project abstractions and domain flows instead of duplicating setup, interactions, assertions, or cleanup across tests.
- Avoid arbitrary sleeps, brittle hardcoded values, uncontrolled shared mutable state, and other workarounds that hide synchronization, data, or isolation problems.
- Consider parallel execution when introducing shared data, storage, authentication state, or cleanup behavior.
- Treat a failing test as evidence to investigate, not automatically as an automation defect or a reason to relax the test.

<!-- END ROA AI CONFIG: shared/test-automation -->
