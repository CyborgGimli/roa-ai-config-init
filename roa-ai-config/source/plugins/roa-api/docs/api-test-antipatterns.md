# API — Test Anti-Patterns

```java
// Raw HTTP client, bypassing the ring
HttpClient.newHttpClient().send(request, ofString());

// Hardcoded environment and credentials
.baseUri("https://staging.internal").header("Authorization", "Bearer eyJ...");

// Status-only assertion on a payload-bearing endpoint
.expectStatus(200);
```

| Anti-pattern | Why it hurts | Instead |
| --- | --- | --- |
| RestAssured called directly | breaks the abstraction and the reporting | `quest.use(RING_OF_API)` |
| Hardcoded full URL | not portable across environments | `getApiConfig().baseUrl()` |
| Query string built by hand | error-prone, unreadable | `withQueryParam` / `withPathParam` / `withHeader` |
| Path id concatenated into the constant | the constant becomes a literal again | pass it as a path parameter |
| JSONPath strings scattered | nothing tells you what to fix when the shape changes | `ApiResponsesJsonPaths` |
| Hardcoded credentials | secrets leak; tests break per environment | `Data.testData()` |
| Mandatory header per call | one forgotten call is a confusing 401 | `defaultConfiguration()` |
| Missing `.complete()` | soft assertions never report | always finish the chain |
| Login flow repeated per test | one login change breaks everything | `@AuthenticateViaApi` |
| Retry around a flaky assertion | hides the race, costs `maxWait` every run | fix the cause |

## Assertion anti-patterns

```java
// A 200 with an empty body satisfies this
.requestAndValidate(GET_PROFILE,
    Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build())

// Whole-body equality: an unrelated additive field breaks this
.expectBody(equalTo(fullExpectedJson))

// Asserting a field the API does not guarantee
.expectBodyField("createdAt", "2026-09-07T10:00:00Z")
```

Assert status **and** the fields the behaviour depends on. Normalise ids, timestamps
and ordering, or assert a property (`NOT_NULL`, `MATCHES_REGEX`) rather than a value.

## Coverage

Cover the documented error cases — status, error code, message shape. The happy path
is the easy half.
