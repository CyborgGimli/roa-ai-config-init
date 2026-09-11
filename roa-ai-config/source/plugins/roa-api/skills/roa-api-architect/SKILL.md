---
name: roa-api-architect
description: Design and generate ROA API tests - typed endpoints, DTOs, and RING_OF_API chains with Assertion.builder() validation. Use when a task needs new API test coverage rather than a change to an existing test.
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, Task, Skill
---

# ROA API Architect

Design and generate REST API tests against the ROA API ring for:

```text
$ARGUMENTS
```

Invoked as `/roa-api:roa-api-architect <what to cover>`, for example:

- "Test user creation and the 400 on a missing field"
- "Login, then use the token to fetch the profile"
- "Cover the paginated user list"

## Before generating

1. Load `roa-api-task-profile` for the rules and task sequence that apply here.
2. Establish the contract — path, method, request and response shape, status
   codes, auth — from the authoritative Swagger/OpenAPI source. Never infer an
   endpoint from a REST convention or a similarly named one.
3. Find what already exists. Delegate to the `codebase-investigator` agent when
   the current endpoints, DTOs, constants, or JSONPaths are not obvious. Extend
   what is there rather than adding a second representation of the same shape.
4. Load `ai-compass` and read `target/pandora/metadata/` for any ROA signature
   you are about to use. Never guess a method name.
5. Load `ai-teacher` before writing a new class and follow the closest
   `EXCELLENT` lesson's shape.
6. Read the closest existing test and follow its structure.
7. Deep reference: `${CLAUDE_PLUGIN_ROOT}/docs/api-ring.md` and
   `api-validation.md`.

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

- ✓ Compile — `mvn test-compile` succeeds
- ✓ Use `quest.use(RING_OF_API)` — never RestAssured directly in a test
- ✓ Use typed endpoints with `withPathParam` / `withQueryParam` / `withHeader`
- ✓ Assert status **and** payload
- ✓ Take every JSONPath from `ApiResponsesJsonPaths`
- ✓ Take every param key, id, header and expected value from `api/constants/`
- ✓ Clean up what it creates, via `@Ripper`
- ✓ End every chain with `.complete()`

Then execute the new tests through `run-tests`, and confirm the change against
`roa-api-definition-of-done` with `validate-code` before reporting it complete.
Generated code that has only compiled is not finished work.

Deep reference: `${CLAUDE_PLUGIN_ROOT}/docs/` — start at `api-architecture.md`.
