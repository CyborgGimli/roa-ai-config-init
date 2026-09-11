# API Authentication and Requests

ROA API automation should construct and execute requests through the established API Ring and project abstractions.

This document defines API-specific guidance for authentication, request construction, parameters, headers, bodies, and reusable request behavior.

## Request Mental Model

```text
typed endpoint
      +
request data
      +
parameters / headers
      +
authentication
      ↓
ROA API Ring
      ↓
HTTP request
      ↓
response
```

The application contract determines what the request requires.

ROA and the existing project determine how that request is represented and executed in automation.

## Request Construction

Build requests through the project's established ROA API flow.

A request may require:

* endpoint selection;
* path parameters;
* query parameters;
* headers;
* authentication;
* request body;
* content type;
* other supported request configuration.

Do not construct independent Rest Assured or low-level HTTP requests when the ROA API capability already supports the required behavior.

When exact ROA request methods or options are uncertain, use Pandora rather than guessing.

## Contract-Driven Requests

Swagger/OpenAPI defines what the application expects.

Before implementing a request, establish the required:

```text
HTTP method
endpoint
parameters
headers
authentication
request schema
content type
```

Do not add request data because a similar API uses it.

Do not omit required data because a particular environment appears to accept the request without it.

For contract discovery, see:

`api-contract-discovery.md`

## Path Parameters

Use path parameters only where the contract defines them.

Conceptually:

```text
/users/{id}
        ↓
path parameter: id
```

Preserve the exact contract name, type, and placement.

Do not replace a path parameter with a query parameter or hardcoded path segment for convenience.

## Query Parameters

Query parameters should represent the exact contract-defined inputs.

Prefer established project constants or typed abstractions when they already exist.

Avoid:

* duplicated parameter names;
* unnecessary hardcoded strings;
* parameters not supported by the contract;
* silently omitting required parameters.

## Headers

Use only headers required by:

* the application contract;
* authentication;
* project infrastructure;
* an explicit test scenario.

Reuse established project constants and request configuration.

Do not hardcode credentials, secrets, tokens, or environment-specific values into tests.

## Request Bodies

Structured request bodies should normally use typed project models.

Conceptually:

```text
contract schema
      ↓
Java request model
      ↓
ROA serialization
      ↓
request body
```

Use test data that deliberately represents the scenario.

Do not build large ad-hoc JSON strings when an established typed model is appropriate.

For model design, see:

`api-endpoints-and-modeling.md`

## Authentication

Authentication should use the project's established ROA authentication mechanism.

ROA supports API authentication lifecycle behavior such as:

```text
@AuthenticateViaApi
```

The exact authentication strategy is project-specific.

It may involve project-defined logic for obtaining and applying authentication state to API requests.

Do not invent authentication flows when the project already provides one.

## Authentication as Infrastructure

When authentication itself is not the behavior under test, treat it as supporting test infrastructure.

Conceptually:

```text
authentication setup
        ↓
authenticated API state
        ↓
test exercises business behavior
```

Avoid repeating login or token-acquisition sequences inside individual tests when the established authentication mechanism already provides the required state.

## Authentication as the Behavior Under Test

When the requirement specifically concerns authentication, the test must exercise that behavior directly.

Examples include:

* valid authentication;
* invalid credentials;
* missing authentication;
* expired or invalid authentication state;
* authorization behavior where required by the scenario.

Do not use setup mechanisms in a way that bypasses the authentication behavior being tested.

## Secrets and Credentials

Never hardcode:

* usernames intended to remain private;
* passwords;
* API keys;
* bearer tokens;
* client secrets;
* other credentials.

Use the project's configured secret, environment, or authentication mechanism.

Do not print sensitive authentication material into logs or test output.

## Reusable Request Configuration

Projects may have reusable configuration for concerns such as:

* common headers;
* authentication;
* base API configuration;
* content types;
* request defaults.

Reuse established configuration rather than reproducing it in individual tests.

Do not introduce global request behavior that silently affects unrelated tests without a clear project-level requirement.

## Request Models and Test Data

Request models describe the contract.

Test-data mechanisms determine the values used by a scenario.

These are separate concerns.

Conceptually:

```text
request model
→ structure

DataCreator / @Craft / static or runtime data
→ scenario values
```

Use the shared ROA data mechanisms when appropriate rather than embedding complex data creation directly into request execution.

For test data and `Late<T>`, see:

`roa-data-and-storage.md`

## Runtime-Dependent Request Data

A request may depend on information produced earlier in the Quest.

For example:

```text
Journey
→ creates entity
→ stores identifier

later API request
→ uses identifier
```

or:

```text
API request 1
→ returns value

API request 2
→ consumes value
```

Use Quest storage or `Late<T>` where the project's established ROA pattern requires runtime-dependent state.

Do not introduce shared state when a local value is sufficient.

## Reusable API Flows

When several API operations form meaningful reusable domain behavior, consider an existing or project-appropriate domain service.

Conceptually:

```text
test
  ↓
domain service
  ↓
multiple ROA API operations
```

Do not create a service merely to wrap one request without providing useful abstraction.

For shared service guidance, see:

`roa-custom-services-and-rings.md`

## Negative Requests

Negative API tests should deliberately create the invalid condition being verified.

Examples may include:

* missing required input;
* invalid field value;
* malformed or unsupported parameter;
* missing authentication;
* invalid authentication;
* unsupported business state.

Keep the failure condition focused so the test clearly proves the intended behavior.

Expected responses must come from the contract or another authoritative requirement source.

Do not infer negative expectations from general HTTP conventions alone.

## Request Evidence

A successful request execution does not by itself prove the requirement.

The response or resulting application state must be validated according to the scenario.

Request construction and response validation therefore form one test flow:

```text
construct intended request
        ↓
execute
        ↓
observe response / resulting state
        ↓
assert meaningful behavior
```

For assertion strategy, see:

`api-test-design.md`

## Knowledge Sources

Use each source for its responsibility:

```text
Swagger / OpenAPI
→ required application request contract

Existing repository
→ current authentication, request, and configuration patterns

Pandora
→ exact ROA API framework methods and supported usage

AI Teacher
→ project-approved Java implementation patterns
```

Do not use Pandora to infer application authentication requirements.

Do not use Swagger/OpenAPI to infer ROA method signatures.

## Core Principles

* Execute API requests through the established ROA API capability.
* Build requests from the authoritative application contract.
* Preserve exact parameter names, locations, and types.
* Use typed models for structured request bodies where appropriate.
* Reuse existing request and authentication configuration.
* Keep secrets and credentials out of source code and logs.
* Treat authentication as infrastructure unless authentication itself is under test.
* Use runtime state only when the request genuinely depends on earlier execution.
* Keep negative scenarios deliberate and focused.
* Do not bypass ROA with low-level HTTP or Rest Assured usage without a justified need.
* Use Pandora rather than guessing exact ROA request or authentication APIs.

## Further Reference

For the overall ROA API architecture:

`api-architecture.md`

For authoritative contract discovery:

`api-contract-discovery.md`

For endpoints, models, constants, and JSONPath:

`api-endpoints-and-modeling.md`

For API scenario design and assertions:

`api-test-design.md`

For focused implementation examples:

`api-examples.md`
