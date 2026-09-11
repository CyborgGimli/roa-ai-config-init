# API Test Design

ROA API tests should prove meaningful application behavior through focused scenarios, deliberate inputs, and assertions grounded in the actual API contract.

This document defines API-specific guidance for scenario design, assertions, positive and negative coverage, setup, isolation, and validation.

## Scenario Mental Model

```text
requirement
   ↓
contract
   ↓
preconditions / test data
   ↓
API action
   ↓
response or resulting state
   ↓
meaningful assertions
```

A test should make clear:

* what behavior is being exercised;
* what input and preconditions are required;
* what result is expected;
* what evidence proves the behavior.

## Test the Requirement

Design tests around the requested behavior rather than around framework methods.

Avoid tests whose purpose is effectively:

```text
call endpoint
→ check request succeeded
```

Prefer:

```text
perform business action
→ verify the response and outcome that prove the requirement
```

The API operation is the mechanism. The requirement determines what must be validated.

## Contract-Driven Scenarios

Use Swagger/OpenAPI to establish the application contract relevant to the scenario.

Verify contract details such as:

* endpoint;
* method;
* parameters;
* request schema;
* authentication;
* documented responses.

Do not guess expected behavior from REST conventions or similar APIs.

For contract discovery, see:

`api-contract-discovery.md`

## Positive Scenarios

A positive test should provide valid input and verify the meaningful successful outcome.

Depending on the requirement, evidence may include:

* expected status;
* relevant response fields;
* returned identifiers;
* business values;
* headers;
* resulting application state.

Do not validate only the status code when the requirement depends on response content or resulting state.

## Negative Scenarios

Negative tests should deliberately violate one relevant expectation at a time where practical.

Examples include:

* missing required input;
* invalid value;
* unsupported value;
* missing authentication;
* invalid authentication;
* invalid resource identifier;
* invalid business state.

Keep the failure condition focused so that the reason for rejection is clear.

Expected negative behavior must come from the API contract or another authoritative requirement source.

Do not invent expected status codes or error responses.

## Assertions

Assertions should prove behavior rather than merely observe data.

Useful assertion targets may include:

* status;
* headers;
* body fields;
* error information;
* identifiers;
* domain values;
* resulting state.

Conceptually:

```text
response value
→ observed

assertion
→ proves expected behavior
```

Extracting or storing a response value does not itself validate anything.

## Assertion Strength

Choose assertions strong enough that the test would fail when the requirement is broken.

Avoid assertions that only verify:

* response exists;
* body is non-empty;
* a generic success value is present;
* status is successful when more specific behavior matters.

Prefer the smallest set of assertions that materially proves the scenario.

Do not assert every response field merely because it exists.

## Response Validation

ROA API capabilities may support validation of:

```text
STATUS
HEADER
BODY
```

and body assertions may use JSONPath-based access.

Use the existing project conventions and exact Pandora metadata for the supported validation API.

Do not invent assertion methods, types, or signatures.

## Setup and Preconditions

API tests may require prerequisite state.

Prefer established mechanisms such as:

* Journeys;
* generated test data;
* static test data where appropriate;
* authentication lifecycle;
* reusable domain services.

Setup should create only what the scenario needs.

Do not bury important preconditions in unrelated helper code.

## Preserve the Behavior Under Test

Supporting setup must not perform the same action the test exists to verify.

For example:

```text
Requirement
→ verify customer creation through API

Valid setup
→ create prerequisite account
→ test creates customer through target API

Invalid setup
→ setup creates customer
→ test only retrieves it
```

Setup establishes prerequisites.

The test performs the behavior under test.

## Test Data

Use controlled data appropriate to the scenario.

Prefer:

* project `DataCreator` patterns;
* `@Craft` where generated data is appropriate;
* static configured values where genuinely stable;
* `Late<T>` for runtime-dependent values.

Avoid:

* unexplained hardcoded business data;
* accidental dependency on pre-existing state;
* shared mutable entities across unrelated tests.

For shared data concepts, see:

`roa-data-and-storage.md`

## Authentication

Use the project's established API authentication mechanism when authentication is only infrastructure.

When authentication itself is under test, exercise the relevant authenticated or unauthenticated behavior directly.

Do not allow automatic setup to bypass the authentication scenario being verified.

For authentication behavior, see:

`api-authentication-and-requests.md`

## Cleanup

State-changing API tests should consider cleanup during design.

Determine:

```text
what state is created or modified?
        ↓
does it affect later tests?
        ↓
what identifier is required for cleanup?
        ↓
which existing Ripper / DataCleaner owns it?
```

Reuse established cleanup mechanisms where appropriate.

Cleanup should not rely on another unrelated test executing first.

## Test Isolation

Tests should be independently executable unless sequential behavior is an intentional requirement.

Avoid:

* test-order dependencies;
* mutable shared state;
* one test relying on another test's output;
* uncontrolled reusable entities;
* environment residue from previous runs.

Design with parallel execution in mind where the project supports it.

## Reusable API Behavior

When multiple tests repeat meaningful API-domain behavior, reuse an existing project service or introduce an appropriate abstraction when justified.

Do not hide the entire scenario behind a service so deeply that the test no longer communicates:

* the behavior exercised;
* the important input;
* the expected result.

Reuse technical orchestration without hiding test intent.

## Cross-Ring Validation

An API scenario may use another Ring for independent setup or verification when that improves confidence.

For example:

```text
API
→ perform behavior under test

DB
→ independently verify persisted result
```

or:

```text
API
→ prepare prerequisite state

UI
→ exercise primary behavior
```

Use another Ring only when it adds meaningful value.

Do not introduce cross-Ring complexity unnecessarily.

## Failure Interpretation

A failing API test does not automatically mean the automation is wrong.

Distinguish between:

* automation defect;
* incorrect expectation;
* contract change;
* application defect;
* data or precondition issue;
* authentication problem;
* environment or configuration failure;
* incorrect ROA framework usage.

Investigate the evidence before changing the test.

Do not weaken assertions merely to match unexpected application behavior.

## Core Principles

* Design API tests around requirements, not framework calls.
* Ground expected behavior in the actual API contract.
* Use focused scenarios with deliberate inputs and preconditions.
* Validate outcomes that materially prove the requirement.
* Do not rely on status codes alone when stronger evidence is required.
* Keep negative scenarios deliberate and contract-backed.
* Preserve the behavior under test when using setup mechanisms.
* Use controlled, isolated test data.
* Reuse established authentication, lifecycle, cleanup, and domain abstractions.
* Keep tests independently executable where practical.
* Use cross-Ring verification only when it materially improves the scenario.
* Investigate failures before changing expectations.
* Use Pandora rather than guessing exact ROA validation APIs.

## Further Reference

For the overall ROA API architecture:

`api-architecture.md`

For authoritative contract discovery:

`api-contract-discovery.md`

For endpoints, models, constants, and JSONPath:

`api-endpoints-and-modeling.md`

For authentication and request construction:

`api-authentication-and-requests.md`

For focused implementation examples:

`api-examples.md`
