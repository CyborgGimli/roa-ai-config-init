# UI Network Interception

ROA UI automation can observe browser network activity when a scenario requires data from requests or responses triggered by UI behavior.

This document defines UI-specific guidance for interception scope, request matching, captured responses, storage, extraction, synchronization, and validation.

## Mental Model

```text
UI action
   ↓
browser request
   ↓
ROA interception
   ↓
captured response
   ↓
storage / extraction
   ↓
later test behavior or validation
```

Interception supports the UI scenario.

It must not replace the visible UI behavior the test is intended to verify.

## When to Use Interception

Use network interception when browser traffic provides information that is materially useful to the scenario.

Examples may include:

* capturing an identifier created by a UI action;
* retrieving backend data returned after a visible interaction;
* correlating UI behavior with a specific network response;
* obtaining runtime values needed by later test steps;
* validating network behavior when the requirement explicitly depends on it.

Do not intercept requests merely because network data is available.

Prefer ordinary UI assertions when the requirement can be proven directly through the visible application.

## `@InterceptRequests`

ROA supports request interception through lifecycle mechanisms such as:

```java
@InterceptRequests(...)
```

The exact annotation attributes, matching behavior, supported options, response storage, and retrieval APIs must come from the repository and Pandora metadata.

Do not invent interception configuration.

## Application Discovery

Interception must be based on actual browser traffic.

Use DevTools to establish where relevant:

* request URL;
* HTTP method;
* action that triggers the request;
* response timing;
* response structure;
* whether multiple similar requests occur;
* which response corresponds to the behavior under test.

Do not guess intercepted URLs or response structures.

For discovery guidance, see:

`ui-application-discovery.md`

## Request Matching

Match only the traffic required by the scenario.

A project may identify requests using supported matching information such as a URL or URL fragment.

The exact matching mechanism must be verified from Pandora and existing project usage.

Choose a matcher specific enough to avoid capturing unrelated requests.

Avoid broad matching that can make the test depend on whichever request happens to arrive first.

## Trigger Order

Interception must be active before the UI action that produces the target request.

Conceptually:

```text
configure interception
        ↓
perform UI action
        ↓
request occurs
        ↓
response captured
```

Do not configure interception after the relevant browser traffic has already occurred.

Use the established ROA lifecycle behavior for interception setup.

## Captured Responses

Captured responses may be retained in UI-specific runtime storage.

Conceptually:

```text
browser response
        ↓
UI interception
        ↓
UI storage
        ↓
later extraction / validation / request
```

Use stored response data only when it needs to cross interaction, lifecycle, or Ring boundaries.

Do not copy response content into additional storage without a real need.

For shared storage concepts, see:

`roa-data-and-storage.md`

## Response Extraction

A captured response may contain a value needed later in the scenario.

For example:

```text
UI action
→ creates entity

captured response
→ contains entity id

JSONPath
→ extracts id

later step
→ uses id
```

Use response structure verified through actual network inspection.

Do not invent JSONPath expressions from assumptions.

## Extraction Is Not Validation

Extracting a value from intercepted traffic does not prove the UI behavior is correct.

```text
Extraction
→ obtains runtime information

Validation
→ proves the required behavior
```

If the requirement concerns visible application behavior, the test should still perform the appropriate UI validation.

If the requirement explicitly concerns network behavior, validate the relevant captured response deliberately.

## Interception and Runtime Data

Intercepted values can support runtime-dependent test data.

Conceptually:

```text
UI action
→ intercepted response

response value
→ stored in Quest/UI storage

Late<T> or later operation
→ consumes runtime value
```

Use the established ROA data and storage mechanisms when a later stage genuinely depends on captured information.

Do not introduce runtime coupling when a simpler local flow is sufficient.

## Interception and Synchronization

Network interception does not remove UI synchronization requirements.

A network response may arrive before or after the visible application reaches the state required by the next interaction.

Treat these as separate concerns:

```text
network response captured
→ network condition satisfied

UI ready
→ interaction condition satisfied
```

Use the appropriate ROA synchronization mechanism for the visible application state.

Do not replace deterministic UI synchronization with arbitrary waits around network activity.

## Multiple Requests

A UI action may trigger several requests.

When this occurs, establish:

* which request matters;
* whether multiple matching requests are expected;
* which response belongs to the scenario;
* how the project distinguishes them.

Do not assume that the first captured request is the correct one.

## Interception as Supporting Evidence

Network data may strengthen a UI scenario.

For example:

```text
UI
→ user submits form

visible application
→ displays successful result

intercepted response
→ provides created entity id for cleanup
```

This is a valid supporting use because the UI still proves the user-facing behavior.

## Do Not Bypass the UI

Invalid pattern:

```text
Requirement
→ verify UI displays generated result

UI action
→ triggers API response

Test
→ validates only intercepted response
→ never validates UI
```

The test has then validated backend traffic rather than the required UI behavior.

Use interception to support UI automation, not silently convert a UI test into an API test.

## Cleanup

Captured response data may contain identifiers required for cleanup.

Conceptually:

```text
UI action
→ creates state

interception
→ captures identifier

storage
→ retains identifier

@Ripper
→ cleanup
```

Reuse established Quest/storage and cleanup mechanisms.

Do not rediscover cleanup identifiers when the test already captured them reliably.

## Repository, Application, and Pandora

Use each source for its responsibility:

```text
Actual application / DevTools
→ real network traffic and response structures

Existing repository
→ current interception configuration and usage patterns

Pandora
→ exact ROA interception annotations, methods, options, and storage behavior
```

Do not use Pandora to infer application network traffic.

Do not use DevTools observations to invent unsupported ROA interception APIs.

## AI Teacher

When new Java interception-related implementation code must be created, use the `ai-teacher` skill before generating it.

AI Teacher provides project-approved Java patterns.

Pandora remains responsible for exact ROA framework contracts.

## Core Principles

* Use interception only when network data materially supports the scenario.
* Ground interception in actual DevTools network evidence.
* Configure interception before the action that triggers the request.
* Match requests narrowly enough to avoid unrelated traffic.
* Use established UI/Quest storage for captured runtime data when needed.
* Treat extraction and validation as separate responsibilities.
* Do not replace visible UI validation with backend-response validation.
* Keep network readiness and UI synchronization separate.
* Handle multiple similar requests deliberately.
* Use captured identifiers for later flow or cleanup only when they genuinely add value.
* Use AI Teacher before generating new Java interception-related code.
* Use Pandora rather than guessing exact ROA interception behavior.

## Further Reference

For the overall ROA UI architecture:

`ui-architecture.md`

For network and application discovery:

`ui-application-discovery.md`

For synchronization:

`ui-elements-and-synchronization.md`

For shared runtime storage and `Late<T>`:

`roa-data-and-storage.md`

For UI scenario design and validation:

`ui-test-design.md`
