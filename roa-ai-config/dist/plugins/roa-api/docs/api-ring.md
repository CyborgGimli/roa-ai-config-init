# API — The Ring

`RING_OF_API` resolves to `RestServiceFluent`. Tests never call RestAssured directly.

```java
public class Rings {
    public static final Class<RestServiceFluent> RING_OF_API = RestServiceFluent.class;
}
```

`quest.use(...)` takes the class, so the ring constant is a `Class<?>`, declared once
in the project's `common/base/Rings`.

## Operations

| Call | Use |
| --- | --- |
| `request(endpoint)` | send; response stored, validate later |
| `request(endpoint, body)` | send with a body |
| `requestAndValidate(endpoint, assertions...)` | send and assert in one step — **preferred** |
| `requestAndValidate(endpoint, body, assertions...)` | same, with a body |
| `validateResponse(response, assertions...)` | assert a response you already hold |
| `validate(Runnable)` | hard assertion — plain JUnit, fails immediately |
| `validate(Consumer<SoftAssertions>)` | soft assertion — AssertJ, collected until `complete()` |
| `authenticate(String username, String password, Class<? extends BaseAuthenticationClient>)` | explicit auth when the annotation does not fit |
| `retryUntil(condition, maxWait, retryInterval)` | eventual consistency — see `api-retry.md` |
| `drop()` | return to the Quest so another ring can be entered |

Every one of these returns the ring, so the chain reads as one expression. The HTTP
verb is not a method — it comes from the endpoint constant.

There is no `post()`, `get()`, `body()`, `expectStatus()`, `expectJsonPath()`,
`mapTo()`, or `extractJson()`. Values come back out of storage, not out of the chain.

## Shape

```java
@API
class ApiExampleTests extends BaseQuest {

    @Test
    void getUsers_whenPageTwo_returnsUsers(Quest quest) {
        quest
            .use(RING_OF_API)
            .requestAndValidate(GET_ALL_USERS.withQueryParam(PAGE_PARAM, PAGE_TWO),
                Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build())
            .complete();
    }
}
```

Prefer `requestAndValidate`. Reach for `request` + `validate` only when the check
needs custom logic over the stored response.

## `validate(Runnable)` vs `validate(Consumer<SoftAssertions>)`

```java
.validate(() -> {                        // hard: first failure stops the test
    GetUsersDto users = retrieve(StorageKeysApi.API, GET_ALL_USERS, Response.class)
            .getBody().as(GetUsersDto.class);
    assertEquals(PAGE_SIZE, users.getData().size());
})

.validate(softAssertions -> {            // soft: all failures reported at complete()
    UserDto user = retrieve(StorageKeysApi.API, GET_USER, Response.class)
            .getBody().as(UserDto.class);
    softAssertions.assertThat(user.getData().getEmail()).isEqualTo(USER_FOUR_EMAIL);
    softAssertions.assertThat(user.getData().getFirstName()).isEqualTo(USER_FOUR_FIRST_NAME);
})
```

Reach for the soft form when checking several fields of one response — one run then
tells you every field that is wrong, not just the first.

## Not the ring

`RestService` is the non-Quest executor used by hook flows and authentication
clients. It does not store responses and does not chain. See `api-rest-service.md`.

## Rules

- `quest.use(RING_OF_API)` only — no direct RestAssured in a test.
- Typed endpoints only — no raw method/URL at a call site.
- `.drop()` before entering another ring; exactly one `.complete()` at the end.
- Always `.complete()`; soft assertions flush there.
