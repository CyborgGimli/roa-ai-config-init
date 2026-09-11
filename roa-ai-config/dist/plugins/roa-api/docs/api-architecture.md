# ROA API Architecture

ROA API automation is built on the shared Quest/Ring model.

The API Ring provides the capability for executing HTTP interactions, validating responses, storing runtime response data, and composing API behavior with the rest of the ROA test lifecycle.

This document defines the architectural role of API automation. Endpoint modeling, contract discovery, authentication, request construction, and test design are documented separately.

## Mental Model

```text
Test
  ↓
Quest
  ↓
quest.use(RING_OF_API)
  ↓
API Ring
  ↓
typed endpoint
  ↓
request configuration
  ↓
request execution
  ↓
response validation / storage
  ↓
.drop()
  ↓
Quest / another Ring
  ↓
.complete()
```

The test remains inside the same Quest while using API capabilities.

The API Ring owns API-specific interaction. The Quest continues to provide the shared execution context, lifecycle, validation, and runtime state.

## API Capability

API tests access API automation through the API Ring rather than constructing independent HTTP clients when the ROA capability already supports the required behavior.

Conceptually:

```java
quest.use(RING_OF_API)
```

The API Ring exposes fluent operations for working with configured endpoints and requests.

Exact methods and supported operations must be taken from the current repository and Pandora metadata rather than assumed.

## Typed Endpoints

API targets should be represented through the project's established typed endpoint abstraction.

Conceptually:

```text
application endpoint definition
        ↓
ROA Endpoint contract
        ↓
API Ring
        ↓
request execution
```

Endpoint definitions centralize information such as the API resource being called and allow tests to avoid scattering raw URLs through test code.

Reuse existing endpoint definitions before creating new ones.

For endpoint design and modeling, see:

`api-endpoints-and-modeling.md`

## Requests

The API Ring is responsible for constructing and executing API requests through ROA's API abstraction.

A request may involve:

* an endpoint;
* HTTP-specific request configuration;
* query parameters;
* path or other supported parameters;
* headers;
* authentication;
* serialized request models;
* response handling.

Keep request construction inside the established ROA API flow.

Do not bypass it with direct low-level HTTP or Rest Assured usage unless the framework genuinely cannot support the required behavior and the design explicitly justifies the exception.

For authentication and request construction, see:

`api-authentication-and-requests.md`

## Request Models

Request bodies should normally use typed Java models where the API contract represents structured data.

Conceptually:

```text
API contract schema
        ↓
project request model
        ↓
ROA request
        ↓
serialization
        ↓
HTTP request body
```

Models should represent the contract accurately and follow existing project conventions.

Do not create duplicate models when an appropriate project model already exists.

For detailed modeling guidance, see:

`api-endpoints-and-modeling.md`

## Response Validation

API automation should validate behavior through meaningful response evidence.

Depending on the scenario, validation may include:

* status;
* headers;
* response body;
* values extracted through JSONPath;
* business-relevant response content.

Conceptually:

```text
request
  ↓
response
  ↓
status / headers / body
  ↓
meaningful assertions
```

Do not treat a successful HTTP status alone as sufficient evidence when the requirement depends on response content or resulting state.

Exact validation APIs belong to Pandora and the current project implementation.

## Response Storage

API operations can make response information available through the Quest's API-specific runtime storage.

Conceptually:

```text
API request
   ↓
response
   ↓
API storage
   ↓
later request / validation / cleanup / another Ring
```

Use stored response state only when information genuinely needs to cross operation, lifecycle, or Ring boundaries.

Do not use storage for values that can remain local to the current operation.

For the shared storage model, see:

`roa-data-and-storage.md`

## Lifecycle Integration

API automation participates in the normal ROA lifecycle.

API capability may be used by:

* the test body;
* Journeys;
* authentication;
* generated or runtime-dependent data flows;
* cleanup;
* custom services;
* cross-Ring scenarios.

For example:

```text
@Journey
→ prepare prerequisite data through API

Test
→ exercise API behavior

Validation
→ prove response or resulting state

@Ripper
→ clean created data
```

Use lifecycle abstractions when they represent reusable setup or cleanup rather than reproducing the same technical sequences inside tests.

For lifecycle behavior, see:

`roa-test-lifecycle.md`

## API Authentication

Authentication is part of the API capability but should remain separate from the business behavior being tested unless authentication itself is the subject of the scenario.

ROA supports API authentication lifecycle mechanisms such as:

```text
@AuthenticateViaApi
```

The exact strategy is project-specific.

Reuse the project's established authentication configuration and implementation instead of duplicating credentials or login/token acquisition logic in individual tests.

For detailed authentication guidance, see:

`api-authentication-and-requests.md`

## Domain Services

Projects may build reusable domain services on top of the API Ring.

Conceptually:

```text
Test
  ↓
domain service
  ↓
API Ring
  ↓
one or more API operations
```

A domain service is useful when it represents meaningful reusable business behavior or orchestration.

Do not create services merely to wrap individual API calls without adding a useful abstraction.

For shared guidance on custom services and Rings, see:

`roa-custom-services-and-rings.md`

## Cross-Ring Use

The API Ring may participate in scenarios involving other ROA capabilities.

For example:

```text
API
→ prepare prerequisite state

UI
→ exercise behavior under test
```

or:

```text
UI
→ perform user action

API
→ independently verify resulting state
```

Supporting API operations must not replace the behavior the test exists to prove.

Use the API Ring according to the responsibility it serves in the scenario.

## Contract as Authority

API automation must be grounded in the actual API contract.

Do not guess:

* endpoint paths;
* HTTP methods;
* request schemas;
* required fields;
* response schemas;
* status codes;
* authentication requirements;
* parameter names or types.

Use the configured Swagger/OpenAPI source when contract information is required.

For contract discovery, see:

`api-contract-discovery.md`

## Knowledge Sources

Use each source for its intended responsibility:

```text
Swagger / OpenAPI
→ authoritative application API contract

Existing repository
→ current endpoints, models, services, tests, and conventions

ROA API documentation
→ API architecture and automation concepts

Pandora
→ exact ROA framework metadata and API-Ring usage

AI Teacher
→ curated project-approved Java implementation patterns
```

Do not substitute one source for another.

For example, Pandora can establish how an ROA API type is used, but it does not define the application's HTTP contract.

## Core Principles

* Access API automation through the API Ring.
* Reuse existing typed endpoints, models, services, and project abstractions.
* Keep raw URLs and duplicated contract information out of test bodies.
* Model structured request data with appropriate typed project models.
* Validate outcomes that meaningfully prove the requested behavior.
* Use API storage only for runtime state that needs to cross boundaries.
* Integrate API operations with the established ROA lifecycle.
* Reuse project authentication mechanisms.
* Use domain services only when they provide meaningful reusable behavior.
* Do not bypass the behavior under test with supporting API setup.
* Treat Swagger/OpenAPI as the authority for application contract details.
* Use Pandora instead of guessing exact ROA framework usage.

## Further Reference

For authoritative API contract discovery:

`api-contract-discovery.md`

For endpoint definitions, request/response models, and JSONPath organization:

`api-endpoints-and-modeling.md`

For authentication and request construction:

`api-authentication-and-requests.md`

For API scenario design and meaningful validation:

`api-test-design.md`

For focused implementation examples:

`api-examples.md`

For the shared Quest and Ring model:

`roa-core-architecture.md`
