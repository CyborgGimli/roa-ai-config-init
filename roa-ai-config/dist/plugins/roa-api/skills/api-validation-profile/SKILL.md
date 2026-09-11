---
name: api-validation-profile
description: Apply API-specific validation requirements when shared ROA validation workflows verify completed API automation.
user-invocable: false
allowed-tools: Read, Glob, Grep, Bash, Skill, Task
---

Apply this profile when validating API automation changes.

## Requirements

1. Verify that the implemented behavior matches the requested API scenario and acceptance criteria.

2. Confirm that affected endpoint paths, HTTP methods, parameters, schemas, status codes, authentication requirements, and response expectations are grounded in the authoritative Swagger/OpenAPI contract or another explicit requirement source.

3. Verify that the implementation reuses appropriate existing project abstractions, including where relevant:
   - typed endpoints;
   - request or response models;
   - constants;
   - JSONPaths;
   - authentication components;
   - lifecycle abstractions;
   - domain services;
   - cleanup mechanisms.

4. Confirm that API interaction uses the established ROA API Ring rather than unnecessary direct HTTP or Rest Assured code.

5. Verify that request models and parameters preserve the contract-defined:
   - names;
   - types;
   - locations;
   - required and optional semantics;
   - nested structures;
   - collections;
   - constrained values.

6. Confirm that authentication follows the established project mechanism unless authentication itself is the behavior under test.

7. Verify that setup and supporting API operations do not replace the behavior the test is intended to prove.

8. Review assertions for meaningful evidence. Status-only validation is insufficient when the requirement depends on response content or resulting application state.

9. Confirm that negative scenarios intentionally exercise the expected invalid condition and that expected failures are supported by the contract or another explicit requirement source.

10. Verify that JSONPath expressions and extracted response values match the actual response structure and that extraction is not mistaken for assertion.

11. Check runtime storage usage where relevant. API or Quest storage should be used only when data genuinely needs to cross request, lifecycle, cleanup, or Ring boundaries.

12. When exact `io.cyborgcode.roa.*` behavior affects validation and cannot be established from the repository, use the `ai-compass` skill rather than assuming the implementation is correct.

13. Confirm that relevant Java code compiles and that the appropriate API test scope was actually executed.

14. Distinguish automation defects from:
   - application defects;
   - contract changes;
   - environment failures;
   - authentication problems;
   - test-data or precondition issues;
   - configuration problems;
   - framework issues.

15. Do not approve API automation that passes only because assertions were weakened, tests were skipped, failures were masked, or contract expectations were changed without evidence.

## Result

Return:

- PASS, FAIL, or BLOCKED;
- contract alignment findings;
- architecture and modeling findings;
- assertion and scenario-quality findings;
- compilation and test-execution evidence;
- external application, contract, environment, data, authentication, configuration, or framework issues;
- the smallest remaining changes or evidence required for completion.
