# API Contract Discovery

API automation must be grounded in the actual application contract.

Use the configured Swagger/OpenAPI source when endpoint paths, methods, parameters, schemas, status codes, or authentication requirements are not already established by the repository.

Do not guess contract details.

## Mental Model

```text
Swagger / OpenAPI
        ↓
authoritative API contract
        ↓
endpoint and schema discovery
        ↓
ROA endpoint/model design
        ↓
test implementation
```

The contract defines what the application API exposes.

ROA defines how the automation interacts with that contract.

## Contract Authority

Use Swagger/OpenAPI as the authority for application-level details such as:

* endpoint path;
* HTTP method;
* path parameters;
* query parameters;
* request headers;
* request body schema;
* required and optional fields;
* response schema;
* documented status codes;
* authentication requirements;
* content types.

Do not infer these details from naming conventions or similar endpoints.

## Repository and Contract

The existing repository may already contain typed endpoints, models, services, or tests representing part of the contract.

Use both sources for different questions:

```text
Existing repository
→ how this project currently represents the API

Swagger / OpenAPI
→ what the application contract actually defines
```

If they disagree, treat the discrepancy as something to investigate rather than silently choosing one.

Do not modify tests or models to match assumptions when the authoritative contract says otherwise.

## What to Discover

For each API operation relevant to the task, establish only the contract information required by the scenario.

Typically verify:

```text
HTTP method
endpoint path
parameters
request body
authentication
expected responses
response schema
```

Do not load or analyze the entire API specification when a focused operation-level lookup is sufficient.

## Request Parameters

Determine whether each input belongs to:

* path parameters;
* query parameters;
* headers;
* request body.

Preserve the exact contract name and type.

Do not move a parameter between these locations because another representation would be easier to automate.

## Request Schema

When the operation accepts a structured request body, identify:

* required fields;
* optional fields;
* field names;
* field types;
* nested objects;
* collections;
* enums or constrained values where defined.

Use this information to design project request models.

Do not invent fields that are not supported by the contract.

## Response Contract

Determine the response information needed by the scenario.

This may include:

* documented status code;
* response body schema;
* required response fields;
* headers;
* identifiers or values needed by later steps.

Tests should validate the contract elements that materially prove the intended behavior.

Do not assert every documented field by default when the scenario only requires a focused subset.

## Status Codes

Use documented response behavior rather than assuming conventional HTTP status codes.

For example, do not assume that a create operation must return a particular status solely because that status is common REST practice.

Verify the actual contract.

When testing negative behavior, establish the expected response from the contract or other authoritative requirement source.

## Authentication

Determine whether the endpoint requires authentication and what the contract specifies about it.

The API contract establishes the application requirement.

The project's ROA authentication implementation determines how automation satisfies that requirement.

Do not confuse these responsibilities.

For ROA authentication implementation, see:

`api-authentication-and-requests.md`

## Contract-Driven Modeling

Contract discovery should inform:

```text
Swagger / OpenAPI
        ↓
typed endpoint
        +
request / response models
        +
parameter definitions
        +
expected response behavior
```

Do not design project models or endpoint definitions first and then force the contract to fit them.

## Existing Abstractions

Before creating a new endpoint or model:

1. inspect the repository for the same operation or schema;
2. determine whether an existing abstraction already represents it;
3. compare that abstraction with the current contract;
4. reuse or extend it when valid.

Avoid duplicate endpoint definitions and multiple models representing the same contract without a justified reason.

## Contract Changes

When an existing test begins failing because application behavior appears to have changed, compare the current behavior with the authoritative contract.

Possible outcomes include:

```text
contract unchanged + application differs
→ possible product defect

contract changed + automation is stale
→ automation may require update

repository differs from contract
→ investigate stale or incorrect project representation
```

Do not automatically change expected behavior merely because the application currently returns something different.

## Contract Investigator

For tasks requiring focused Swagger/OpenAPI investigation, use the API contract investigator.

Its responsibility is to return verified contract facts without designing or implementing the automation solution.

The architect and implementation workflow should consume those findings rather than rediscovering the same contract information.

## Knowledge Sources

Use each source for its intended responsibility:

```text
Swagger / OpenAPI
→ application API contract

Existing repository
→ current project representation and conventions

ROA API documentation
→ automation architecture and design guidance

Pandora
→ exact ROA framework metadata and usage

AI Teacher
→ project-approved Java implementation patterns
```

Swagger/OpenAPI does not define ROA framework usage.

Pandora does not define the application's HTTP contract.

## Core Principles

* Treat Swagger/OpenAPI as the authority for application API contract details.
* Never guess endpoint paths, methods, schemas, parameters, status codes, or authentication requirements.
* Inspect only the contract operations relevant to the task.
* Preserve exact parameter names, locations, and types.
* Base request and response models on the actual schema.
* Reuse existing project endpoint and model abstractions when they still match the contract.
* Investigate repository/contract discrepancies rather than hiding them.
* Do not change correct expectations merely to match undocumented application behavior.
* Keep contract discovery separate from ROA framework discovery.
* Use Pandora for exact ROA framework behavior, not for application contract information.

## Further Reference

For the overall ROA API structure:

`api-architecture.md`

For typed endpoints, models, and JSONPath organization:

`api-endpoints-and-modeling.md`

For authentication and request execution:

`api-authentication-and-requests.md`

For API scenario design and validation:

`api-test-design.md`
