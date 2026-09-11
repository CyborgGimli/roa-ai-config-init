# API Endpoints and Modeling

ROA API automation should represent application contracts through typed project abstractions rather than scattered raw paths, ad-hoc payloads, or duplicated response expressions.

This document defines the API-specific guidance for endpoint definitions, request/response models, constants, and JSONPath organization.

## Typed Endpoints

API operations should use the project's established typed endpoint abstraction.

Conceptually:

```text
Swagger / OpenAPI operation
        ↓
project endpoint definition
        ↓
ROA Endpoint contract
        ↓
API Ring request
```

An endpoint definition should represent the application operation required by the test without forcing individual tests to repeat raw endpoint information.

Before creating a new endpoint:

1. search the repository for an existing definition;
2. verify it against the current Swagger/OpenAPI contract;
3. reuse or extend it when appropriate;
4. create a new definition only when no correct abstraction exists.

Do not duplicate an endpoint because another test organizes its code differently.

## Contract-Driven Endpoint Design

Endpoint definitions must come from the actual application contract.

Verify:

* HTTP method;
* endpoint path;
* path parameters;
* query parameters;
* required headers;
* request content type;
* authentication requirement;
* documented responses.

Do not infer endpoint details from naming conventions, similar APIs, or memory.

For contract discovery, see:

`api-contract-discovery.md`

## Avoid Raw Contract Details in Tests

Tests should express API behavior through typed project abstractions.

Avoid scattering values such as:

```text
"/users/{id}"
"/orders"
"/accounts/search"
```

through test methods when the project endpoint layer should own them.

The same principle applies to reusable:

* header names;
* query parameter names;
* JSONPath expressions;
* domain constants;
* other contract identifiers.

Centralize them according to existing project conventions.

## Request Models

Structured request bodies should normally be represented by typed Java models.

Conceptually:

```text
contract request schema
        ↓
project Java model
        ↓
ROA request serialization
        ↓
HTTP request body
```

A request model should represent the fields required by the contract and the scenario.

Before creating a model:

1. inspect the repository for an existing compatible model;
2. verify the current contract schema;
3. determine whether reuse or extension is appropriate;
4. create a new model only when needed.

Do not introduce multiple models representing the same contract shape without a clear reason.

## Model the Contract, Not the Test Implementation

Java models should reflect the application contract rather than temporary test mechanics.

Do not add fields merely because they make one test easier to implement.

Likewise, do not omit required contract fields because a particular environment happens to tolerate their absence.

Use Swagger/OpenAPI to establish the contract and repository conventions to determine the appropriate Java representation.

## Required and Optional Fields

Preserve the distinction between required and optional contract data.

When building test data, the scenario may intentionally omit an optional field or deliberately exercise missing required data.

Do not make every field mandatory in the automation model merely because one happy-path scenario populates it.

Negative tests should deliberately control invalid or missing input rather than depending on accidental model state.

## Nested Models and Collections

When the API schema contains nested structures or collections, model them according to the actual contract and existing project conventions.

Conceptually:

```text
request
├── primitive fields
├── nested object
└── collection of objects
```

Do not flatten contract structures solely to simplify test code.

Reuse existing nested models where the repository already represents the same schema.

## Enums and Constrained Values

When the contract defines a constrained set of values, prefer the project's established typed representation where appropriate.

Do not introduce arbitrary string literals throughout tests when an existing enum or typed constant already represents the contract values.

If the contract and repository representation disagree, investigate the discrepancy before changing automation.

## Response Models

Use typed response models when the project architecture or scenario benefits from them.

Not every response requires a dedicated Java model.

For focused validation, ROA response assertions or JSONPath-based access may be sufficient.

Choose the representation according to:

* existing project conventions;
* response complexity;
* reuse requirements;
* whether the response becomes meaningful domain data later in the flow.

Do not create response DTOs mechanically for every endpoint.

## JSONPath

JSONPath expressions may be used to identify relevant response content for validation, extraction, or later runtime use.

Keep reusable JSONPath expressions centralized according to the project's established conventions.

Conceptually:

```text
response body
        ↓
JSONPath
        ↓
relevant value
        ↓
validation / storage / later request
```

Prefer stable expressions based on the actual response schema.

Do not scatter duplicated or fragile JSONPath strings throughout tests.

## JSONPath and Assertions

A JSONPath should identify the value required by the scenario.

The assertion should then prove the intended behavior.

For example:

```text
JSONPath
→ locate created entity identifier

assertion
→ verify the returned identifier or related business outcome
```

Do not confuse locating a value with validating it.

Extraction alone is not an assertion.

## JSONPath and Runtime Data

Values extracted from responses may be needed later by:

* another request;
* cleanup;
* a Journey;
* another Ring;
* subsequent validation.

When the value genuinely needs to cross execution boundaries, use the established Quest/API storage model.

Do not introduce shared storage when the value can remain local to the current operation.

For shared storage concepts, see:

`roa-data-and-storage.md`

## Constants

Use project constants when values are stable, reusable, and meaningful across automation code.

Appropriate candidates may include:

* reusable parameter names;
* reusable header names;
* domain values;
* JSONPath expressions;
* other project-level contract identifiers.

Avoid creating constants for one-off values merely to remove every literal from code.

The project should remain readable rather than becoming an indirection layer of unnecessary constants.

## Reuse Existing Modeling Conventions

Before adding endpoints, models, enums, constants, or JSONPath definitions, inspect nearby API automation.

Prefer the repository's established organization when it correctly represents the current contract.

AI Teacher should be used before generating new Java code so that new models and related classes follow curated project-approved patterns.

Pandora should be used separately when exact ROA framework types or methods must be verified.

## Contract Changes

When the API contract changes, determine which project abstractions are affected.

Potentially impacted areas include:

```text
endpoint definition
request model
response model
parameter constants
JSONPath expressions
tests
```

Update only what the contract change actually requires.

Do not create parallel "new" abstractions while leaving stale equivalents in place unless compatibility requirements justify both.

## Core Principles

* Represent API operations through typed project endpoint abstractions.
* Treat Swagger/OpenAPI as the authority for application contract details.
* Reuse existing endpoint definitions before creating new ones.
* Keep raw endpoint paths and duplicated contract identifiers out of test bodies.
* Use typed Java models for structured request data where appropriate.
* Preserve required, optional, nested, collection, and constrained contract semantics.
* Do not create response models when focused response validation is sufficient.
* Centralize reusable JSONPath expressions according to project conventions.
* Keep extraction and assertion responsibilities distinct.
* Reuse existing constants and typed values instead of duplicating magic strings.
* Use AI Teacher for project-approved Java implementation patterns.
* Use Pandora for exact ROA framework usage rather than guessing.

## Further Reference

For the overall ROA API architecture:

`api-architecture.md`

For authoritative Swagger/OpenAPI discovery:

`api-contract-discovery.md`

For authentication and request construction:

`api-authentication-and-requests.md`

For API scenario design and assertions:

`api-test-design.md`

For focused implementation examples:

`api-examples.md`
