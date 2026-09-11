# API Examples

This document provides focused examples of how ROA API automation should be structured.

The examples illustrate architecture and test intent. Exact `io.cyborgcode.roa.*` methods, overloads, annotations, and supported options must be verified from the current repository and Pandora metadata before implementation.

## Basic API Flow

A typical API test follows this structure:

```text
Quest
  ↓
API Ring
  ↓
typed endpoint
  ↓
configure request
  ↓
execute request
  ↓
validate response
  ↓
.drop()
  ↓
.complete()
```

Conceptually:

```java
quest.use(RING_OF_API)
    // select typed endpoint
    // configure request
    // execute and validate
    .drop()
    .complete();
```

Do not replace typed ROA abstractions with raw HTTP calls merely to reproduce this structure.

## Typed Endpoint

Prefer a project endpoint definition over a raw URL in the test.

```java
// Preferred concept
request(APP_ENDPOINT);

// Avoid
request("/users/123");
```

The exact endpoint type and request method must come from the project and Pandora.

The endpoint path and HTTP method must come from Swagger/OpenAPI.

## Request Model

For a structured request body:

```java
CreateUserRequest request = new CreateUserRequest(
    /* scenario data */
);
```

Then pass the model through the established ROA request mechanism.

Conceptually:

```text
CreateUserRequest
        ↓
ROA API request
        ↓
serialization
        ↓
HTTP body
```

Do not construct ad-hoc JSON when the project already uses typed models for the contract.

## Query Parameters

When the contract defines query parameters:

```text
GET /users
    ?status=ACTIVE
    &page=1
```

Represent them using the project's established API request abstraction.

Do not hardcode parameter names repeatedly when the project already centralizes them.

## Authentication

When authentication is supporting infrastructure:

```java
@AuthenticateViaApi(/* project configuration */)
```

Conceptually:

```text
authentication lifecycle
        ↓
authenticated API state
        ↓
test executes business request
```

Use the actual project authentication implementation and Pandora metadata.

Do not invent annotation attributes or authentication options.

## Response Validation

A successful test should validate evidence that proves the requirement.

Conceptually:

```text
POST create user
        ↓
response
        ↓
status is expected
AND
returned user data is correct
```

Possible validation targets include:

```text
STATUS
HEADER
BODY
```

For body validation, a JSONPath may identify the relevant response value.

```text
$.id
$.status
$.user.name
```

Use JSONPaths that match the actual response contract.

## Weak vs Meaningful Validation

Weak:

```text
request succeeds
→ status is successful
```

Stronger when the requirement concerns created data:

```text
request succeeds
→ expected status
→ returned identifier exists
→ returned business fields match the request
```

Only assert what materially proves the scenario.

Do not validate every response field by default.

## Response Extraction

Sometimes a response value is required later.

Conceptually:

```text
create request
        ↓
response contains id
        ↓
extract id
        ↓
store or retain id
        ↓
later request / cleanup
```

Extraction is not validation by itself.

If the identifier is part of the expected behavior, assert it separately where appropriate.

## Response Storage

When runtime data must cross operation or lifecycle boundaries:

```text
API request
        ↓
response
        ↓
API storage
        ↓
later API operation
```

or:

```text
API response
        ↓
Quest storage
        ↓
Ripper
        ↓
cleanup
```

Use the project's established storage mechanism.

Do not introduce storage when a local variable is sufficient.

## Journey Setup

A reusable API precondition may belong in a Journey.

```text
@Journey
→ create prerequisite account through API

Test
→ perform target operation

@Ripper
→ clean created state
```

The Journey prepares the scenario.

It must not perform the behavior the test itself exists to verify.

## Generated Request Data

A test may receive generated data through `@Craft`.

Conceptually:

```java
@Craft(/* project data type */)
```

```text
@Craft
   ↓
DataCreator
   ↓
request model
   ↓
API test
```

Use the exact project `DataCreator` configuration and Pandora metadata rather than inventing annotation values.

## Runtime-Dependent Data

A request model may require a value that does not exist until an earlier lifecycle step executes.

Conceptually:

```text
Journey
→ creates account
→ account id becomes available

request model
→ accountId = Late<T>

test executes
→ runtime value resolves
```

Use `Late<T>` only when the value genuinely depends on runtime state.

## Negative Scenario

A focused negative test should deliberately create one invalid condition.

Example:

```text
Contract
→ email is required

Test
→ valid request except email is absent

Expected
→ contract-defined error response
```

Do not combine several unrelated invalid inputs unless the requirement specifically concerns that combination.

Do not invent the expected error status or schema.

## Authentication Negative Scenario

When authentication behavior itself is being tested:

```text
request without required authentication
        ↓
target endpoint
        ↓
contract-defined rejection
        ↓
assert expected response
```

Do not use automatic authentication setup when it would bypass the behavior under test.

## Reusable Domain Service

When several tests need the same meaningful API business flow:

```text
Test
  ↓
CustomerService
  ↓
API Ring
  ↓
multiple API operations
```

The service should represent domain behavior rather than merely rename individual requests.

## Cross-Ring Setup

An API capability may prepare state for another Ring:

```text
API
→ create prerequisite organization

.drop()

UI
→ perform behavior under test
```

This is valid when the API operation only prepares prerequisites.

Do not use API setup to perform the UI behavior that the test is supposed to verify.

## Cross-Ring Verification

Another Ring may independently verify an API action:

```text
API
→ create entity

.drop()

DB
→ verify persisted state
```

Use cross-Ring verification only when it materially improves confidence in the scenario.

## Contract Change Example

If a previously passing test begins failing:

```text
test expects field A
        ↓
current response contains field B
```

Do not immediately update the test.

First determine:

```text
Swagger/OpenAPI still defines A
→ possible application defect

Swagger/OpenAPI now defines B
→ automation may be stale

repository model still defines A
→ project representation may need updating
```

Contract evidence comes before changing expectations.

## Framework Uncertainty Example

If implementation requires an unfamiliar ROA method:

```text
Need
→ configure request parameter

Repository
→ no relevant example

Pandora
→ inspect exact API Ring metadata
```

Do not invent a fluent method because its name seems likely.

## Project Pattern Example

If a new request model or service must be created:

```text
Need
→ new Java implementation

Existing repository
→ inspect directly relevant code

AI Teacher
→ inspect relevant curated lessons

Pandora
→ verify exact ROA types used by the implementation
```

Use each source for its own responsibility.

## Example Principles

* Treat examples as structural guidance, not substitutes for the current contract or Pandora.
* Use Swagger/OpenAPI for endpoint and schema truth.
* Use the repository for existing project abstractions and conventions.
* Use Pandora for exact ROA framework usage.
* Use AI Teacher before generating new Java implementation code.
* Prefer typed endpoints and models over raw paths and ad-hoc payloads.
* Validate meaningful outcomes rather than superficial success.
* Keep setup separate from the behavior under test.
* Use runtime storage only when data genuinely needs to cross boundaries.
* Never copy an example mechanically when the current project or contract differs.
