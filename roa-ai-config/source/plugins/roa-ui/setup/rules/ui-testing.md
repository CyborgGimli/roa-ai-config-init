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
- Name test methods after the behavior: `<subject>_<action>_<expectedOutcome>` in lowerCamel segments (for example `search_unknownTerm_showsNoResultsMessage`). Never use numbered names such as `testScenario_4` or `test1`, even when a sibling method in the same class already does.
- Annotate a test with `@Test`, the project's suite marker that matches its role (`@Regression`, or `@Smoke` only for a genuine smoke check — not both by default), and a short `@Description` that names the behavior in one phrase; do not narrate the steps.
- Keep a value that only one scenario uses (an input, the message derived from it) as a local variable inside that test method, and derive the expectation from the input (`"No results found for: " + term`). Promote a literal to the shared test-data class only when more than one test needs it or it is a stable application constant.
- Assert exactly the outcome the requirement names, using the most direct evidence. Validate text in the element that renders it as seen in the DOM (`validate().validateTextInField(<tag of that element>, text)`), not `body` or another page-wide container, and do not add a new element definition only to assert a one-off message.
- Do not add assertions, preconditions, constants classes, helpers, or annotations the requirement does not call for; the smallest complete change is the correct one.
- Always invoke `ai-teacher` before generating new Java implementation code and `ai-compass` before using any `io.cyborgcode.roa.*` type — even when the repository already contains a similar example.

<!-- END ROA AI CONFIG: roa-ui/ui-testing -->
