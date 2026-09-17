---
name: ui-validation-profile
description: Provides the mandatory validation profile for completed ROA UI automation changes.
user-invocable: false
allowed-tools: Read, Grep, Glob, Bash, Skill, Task
---

# UI Validation Profile

Apply this profile when validating implemented ROA UI automation.

## Validate

1. Confirm the implementation satisfies the requested user behavior rather than only exercising UI mechanics.

2. Compare the implementation with verified application evidence where the change depends on:
    - DOM structure;
    - locators;
    - component behavior;
    - synchronization;
    - forms;
    - tables;
    - network activity;
    - authentication/session behavior.

   If required application facts were never verified, do not claim full validation.

3. Confirm existing project abstractions were reused or extended appropriately.

4. Verify UI architecture:
    - browser interaction uses the established UI Ring and project abstractions;
    - typed elements are used instead of raw selectors;
    - component behavior is not duplicated in tests;
    - application-specific locators remain in appropriate element definitions;
    - direct driver/framework bypasses are justified.

5. Verify synchronization:
    - waits correspond to observable application conditions;
    - no arbitrary sleeps were introduced;
    - timeouts were not inflated merely to hide instability;
    - synchronization is distinct from business assertion.

6. Verify setup preserves the behavior under test.

   Authentication, Journeys, API/DB setup, insertion, interception, or domain services must not perform the UI action the scenario exists to verify.

7. Verify test data, lifecycle, storage, authentication, and cleanup are consistent with established ROA/project patterns.

8. Verify table logic does not depend on fragile row positions or DOM assumptions unless required by the scenario.

9. Verify interception, when used, is narrowly scoped and supports rather than replaces required UI validation.

10. Verify assertions materially prove the expected visible or business outcome.

    Flag assertions that merely prove:
    - a click succeeded;
    - an element exists;
    - a page opened;
    - no exception occurred;
    - a weak generic state when a stronger requirement exists.

11. Verify test shape and scope:
    - test method names are descriptive `subject_action_outcome`, not numbered;
    - each test carries `@Test`, one matching suite marker, and a one-phrase `@Description`;
    - single-use literals are local to the test; only shared values were added to the test-data class;
    - text is validated in the element that renders it, not in `body`;
    - no assertion, element, constants holder, helper, or annotation exists that the requirement did not call for.

12. Verify isolation and determinism:
    - no accidental test-order dependency;
    - no inappropriate shared mutable browser state;
    - no stale session dependency;
    - no uncontrolled shared data;
    - parallel execution remains safe where expected.

13. Before planning, writing, changing, or reviewing any code that uses an `io.cyborgcode.roa.*` type, invoke the `ai-compass` skill and read the metadata for every ROA type involved — always, even when the repository already contains a similar example. Do not infer framework contracts from names or from other repository code.

14. Compile changed Java code using the project's Maven wrapper when available, otherwise Maven, with the narrowest sufficient compile command.

15. Run the smallest relevant test scope needed to demonstrate the changed behavior.

16. Never skip, disable, weaken, or rewrite valid assertions merely to obtain a green result.

17. Classify failures accurately:
    - automation defect;
    - application defect;
    - expectation/requirement mismatch;
    - locator or synchronization defect;
    - test-data/precondition issue;
    - authentication/session issue;
    - environment/configuration issue;
    - external blocker;
    - unresolved framework usage.

## Result

Return exactly one overall status:

- `PASS` — implementation and required validation evidence support the requested behavior.
- `FAIL` — the automation contains a confirmed defect or does not satisfy the requirement.
- `BLOCKED` — required evidence or execution is unavailable, so correctness cannot be established.

Include:

- requirement coverage;
- architectural findings;
- application-fidelity findings;
- assertion quality;
- lifecycle/data/isolation findings;
- compile evidence;
- test execution evidence;
- failure classification;
- required fixes;
- remaining blockers or uncertainty.

Do not report `PASS` without sufficient evidence.

Do not invent application facts or ROA framework behavior.