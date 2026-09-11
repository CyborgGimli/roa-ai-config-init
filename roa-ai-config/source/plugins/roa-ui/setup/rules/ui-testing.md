<!-- BEGIN ROA AI CONFIG: roa-ui/ui-testing -->

# UI Testing

- Design tests around meaningful user behavior and required outcomes, not individual UI framework calls.
- Use verified application behavior, typed elements, established components, and project UI abstractions.
- Keep setup separate from the behavior under test; authentication, Journeys, API/DB support, insertion, or interception must not perform the action the UI test exists to verify.
- Use controlled test data and established ROA lifecycle, authentication, storage, and cleanup mechanisms.
- Assert meaningful visible or business outcomes; successful clicks, element presence, or absence of exceptions are not sufficient when stronger evidence is required.
- Keep positive and negative scenarios focused on the behavior being verified.
- Use deterministic synchronization and never weaken assertions, skip behavior, or add arbitrary waits merely to make a test pass.
- Keep tests independently executable where practical and avoid shared mutable browser state, stale sessions, test-order dependencies, and uncontrolled data.
- Use network interception only when it materially supports the scenario; it must not replace required UI validation.
- Reuse existing domain flows and abstractions when they improve clarity without hiding the behavior under test.
- Investigate failures before modifying expectations and distinguish automation defects from application, data, environment, authentication, and configuration failures.
- Use `ai-teacher` before generating new Java implementation code and `ai-compass` when exact ROA framework usage is unclear.

<!-- END ROA AI CONFIG: roa-ui/ui-testing -->
