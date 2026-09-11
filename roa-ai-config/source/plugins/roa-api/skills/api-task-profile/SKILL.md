---
name: api-task-profile
description: Apply API-specific implementation requirements when shared ROA automation workflows are planning or implementing API automation.
user-invocable: false
allowed-tools: Read, Glob, Grep, Skill
---

Apply this profile to API automation tasks.

## Requirements

1. Ground application contract details in the configured Swagger/OpenAPI source.

2. Reuse existing project API abstractions before creating new:
   - endpoints;
   - request or response models;
   - constants;
   - JSONPaths;
   - authentication components;
   - domain services;
   - test-data or lifecycle components.

3. Represent API operations through the established typed endpoint abstraction and ROA API Ring.

4. Do not introduce raw endpoint paths, ad-hoc HTTP clients, direct Rest Assured usage, or duplicate request infrastructure when the existing ROA API capability supports the required behavior.

5. Keep models aligned with the actual contract, including:
   - required and optional fields;
   - nested structures;
   - collections;
   - constrained values;
   - parameter names and types.

6. Preserve exact contract-defined parameter locations:
   - path;
   - query;
   - header;
   - body.

7. Use the project's established API authentication mechanism when authentication is supporting infrastructure.

8. Preserve the behavior under test. API setup may prepare prerequisites but must not perform the API action the test exists to verify.

9. Validate meaningful outcomes using the response or resulting state required by the scenario. Do not rely on status alone when stronger evidence is necessary.

10. Keep negative scenarios deliberate and grounded in the contract or another explicit requirement source.

11. Use Quest/API storage only when runtime data genuinely needs to cross request, lifecycle, cleanup, or Ring boundaries.

12. Before generating new Java code, use the `ai-teacher` skill for relevant project-approved patterns.

13. When exact `io.cyborgcode.roa.*` API framework behavior is uncertain, use the `ai-compass` skill rather than guessing.

14. Keep the implementation proportional to the task and avoid unrelated API refactoring or new abstractions.
