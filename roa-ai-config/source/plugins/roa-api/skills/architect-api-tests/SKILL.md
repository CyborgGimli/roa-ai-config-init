---
name: architect-api-tests
description: Design an ROA API automation solution from verified requirements, repository context, authoritative Swagger/OpenAPI contract information, and established ROA architecture without implementing code.
allowed-tools: Read, Glob, Grep, Bash, Skill, Task
---

Design the requested ROA API automation for:

```text
$ARGUMENTS
```

## Procedure

1. Establish the behavior to automate, scope, acceptance criteria, and known constraints.

2. Ground the design in the actual repository. Use `codebase-investigator` when relevant endpoints, models, services, tests, authentication, lifecycle, data, storage, cleanup, or configuration are not already clear.

3. Establish the authoritative application contract for the affected operations. Use `api-contract-investigator` when endpoint paths, methods, parameters, schemas, status codes, authentication requirements, or response behavior need verification.

4. Reuse existing project abstractions before proposing new ones.

5. Delegate API architecture reasoning to `api-test-architect` when the task requires non-trivial design decisions.

6. Determine the smallest complete API automation design, including only what the task requires:

    * typed endpoints;
    * request or response models;
    * constants or JSONPaths;
    * authentication integration;
    * test data and preconditions;
    * storage;
    * reusable domain services;
    * cleanup;
    * test scenarios and assertions.

7. Preserve architectural responsibilities:

    * Swagger/OpenAPI defines the application contract;
    * the API Ring owns API interaction;
    * project services own meaningful reusable domain behavior;
    * lifecycle mechanisms own setup and cleanup;
    * tests own the behavior and assertions being verified.

8. When exact `io.cyborgcode.roa.*` behavior, construction, methods, annotations, or available options materially affect the design, use the `ai-compass` skill rather than guessing.

9. Preserve the behavior under test. Supporting setup may prepare prerequisites or perform independent verification, but must not perform the API behavior the test exists to prove.

10. Define the required validation evidence, including compilation and the relevant API test scope.

## Return

Provide:

* behavior the automation must prove;
* verified contract facts the design depends on;
* existing project abstractions to reuse;
* required endpoints, models, constants, JSONPaths, services, or other API structures;
* authentication, lifecycle, test-data, storage, and cleanup design;
* intended test scenarios and meaningful assertions;
* files or symbols likely to be created or modified;
* validation requirements;
* risks, blockers, inconsistencies, or unresolved decisions.

Do not implement code. Do not invent application contract details or ROA framework behavior.
