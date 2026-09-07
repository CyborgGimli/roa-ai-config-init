# API — The Ring

`RING_OF_API` resolves to `RestServiceFluent`. Tests never call RestAssured directly.

## Operations

| Call | Use |
| --- | --- |
| `request(endpoint)` | send; response stored, validate later |
| `request(endpoint, body)` | send with a body |
| `requestAndValidate(endpoint, assertions...)` | send and assert in one step — **preferred** |
| `requestAndValidate(endpoint, body, assertions...)` | same, with a body |
| `validateResponse(response, assertions...)` | assert a response you already hold |
| `validate(Runnable)` | hard assertion |
| `validate(Consumer<SoftAssertions>)` | soft assertion |
| `authenticate(username, ...)` | explicit auth when the annotation does not fit |
| `retryUntil(condition, maxWait, interval)` | eventual consistency — see `api-retry.md` |

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

## Rules

- `quest.use(RING_OF_API)` only — no direct RestAssured in a test.
- Typed endpoints only — no raw method/URL at a call site.
- Always `.complete()`; soft assertions flush there.
