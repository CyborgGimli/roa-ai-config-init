---
name: roa-api-architect
description: Generate ROA API tests - typed endpoints, DTOs, and RING_OF_API chains with Assertion.builder() validation
user-invocable: true
allowed-tools: Read, Glob, Bash, Write, Edit, PowerShell
---

# ROA API Architect

Generate REST API tests against the ROA API ring.

## Usage

```bash
/roa-api-architect
```

Describe the operations to cover:
- "Test user creation and the 400 on a missing field"
- "Login, then use the token to fetch the profile"
- "Cover the paginated user list"

## Before generating

1. Load `ai-compass` and read `target/pandora/metadata/` for any ROA
   signature you are about to use. Never guess a method name.
2. Read the closest existing test and follow its shape.
3. Read `${CLAUDE_PLUGIN_ROOT}/docs/api-ring.md` and `api-validation.md`.

Generate only what the requested tests need — no speculative endpoints, DTOs,
constants, or hooks. If nothing references it, do not create it.

## What it generates

| Layer | Location | Contents |
| --- | --- | --- |
| Endpoints | `api/AppEndpoints.java` | enum implementing `Endpoint<AppEndpoints>` |
| Request DTOs | `api/dto/request/` | Lombok `@Data @Builder` models |
| Response DTOs | `api/dto/response/` | `@JsonIgnoreProperties(ignoreUnknown = true)` models |
| JSONPaths | `api/extractors/ApiResponsesJsonPaths.java` | one registry enum |
| Constants | `api/constants/` | `Headers`, `QueryParams`, `PathVariables`, `TestConstants` |
| Tests | `src/test/java/.../api/` | `@API` classes extending `BaseQuest` |

## The generated shape

```java
@API
class UserApiTests extends BaseQuest {

    @Test
    @DisplayName("POST /users with a valid body returns 201 and echoes the name")
    void createUser_whenBodyValid_returnsCreated(
            Quest quest,
            @Craft(model = DataCreator.Data.CREATE_USER) CreateUserDto createUser) {

        quest
            .use(RING_OF_API)
            .requestAndValidate(
                POST_CREATE_USER,
                createUser,
                Assertion.builder().target(STATUS).type(IS).expected(SC_CREATED).build(),
                Assertion.builder().target(BODY).key(RESPONSE_NAME.getJsonPath())
                         .type(IS).expected(CREATE_USER_NAME).soft(true).build())
            .complete();
    }
}
```

## The real ring operations

There is no `.post()`, `.body()`, `.expectStatus()`, `.expectJsonPath()`,
`.mapTo()`, or `.extractJson()`. The HTTP verb comes from the endpoint constant.
`RestServiceFluent` offers exactly:

```java
.request(endpoint)                                  // send; response stored
.request(endpoint, body)                            // send with a body
.requestAndValidate(endpoint, assertions...)        // preferred
.requestAndValidate(endpoint, body, assertions...)
.validateResponse(response, assertions...)
.validate(() -> { ... })                            // hard, plain JUnit
.validate(softAssertions -> { ... })                // soft, AssertJ
.authenticate(username, password, AppAuth.class)
.retryUntil(condition, maxWait, interval)
.drop()                                             // back to the Quest
```

Values come back out of storage, not out of the chain:

```java
Response response = retrieve(StorageKeysApi.API, GET_ALL_USERS, Response.class);
GetUsersDto users = response.getBody().as(GetUsersDto.class);
```

## Endpoint enum

```java
public enum AppEndpoints implements Endpoint<AppEndpoints> {

    GET_ALL_USERS(Method.GET, "/users"),
    GET_USER(Method.GET, "/users/{id}"),
    POST_CREATE_USER(Method.POST, "/users");

    private final Method method;
    private final String url;

    AppEndpoints(final Method method, final String url) {
        this.method = method;
        this.url = url;
    }

    @Override public Method method()         { return method; }
    @Override public String url()            { return url; }
    @Override public AppEndpoints enumImpl() { return this; }

    @Override
    public RequestSpecification defaultConfiguration() {
        RequestSpecification spec = Endpoint.super.defaultConfiguration();
        spec.contentType(ContentType.JSON);
        spec.header(API_KEY_HEADER, Data.testData().apiKey());
        return spec;
    }
}
```

`AppEndpoints` has **no** nested `Data` class — it is referenced directly as a
constant. The nested `Data` class of string keys belongs to the registries that
annotations reference by name: `DataCreator`, `DataCleaner`, `Preconditions`,
`ApiHookFlows`.

Changing an `Endpoint` implementation means regenerating metadata:
`mvn pandora:navigation -U`.

## Validation

Generated code must:

- ✓ Compile — `mvn -q test-compile` succeeds
- ✓ Use `quest.use(RING_OF_API)` — never RestAssured directly in a test
- ✓ Use typed endpoints with `withPathParam` / `withQueryParam` / `withHeader`
- ✓ Assert status **and** payload
- ✓ Take every JSONPath from `ApiResponsesJsonPaths`
- ✓ Take every param key, id, header and expected value from `api/constants/`
- ✓ Clean up what it creates, via `@Ripper`
- ✓ End every chain with `.complete()`

Then run `mvn test -Pe2e -Dtest=YourTestClass`.

Deep reference: `${CLAUDE_PLUGIN_ROOT}/docs/` — start at `api-architecture.md`.
