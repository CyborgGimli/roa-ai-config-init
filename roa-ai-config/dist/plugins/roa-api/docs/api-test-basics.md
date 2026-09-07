# API — Test Basics

```java
@API
class ProfileApiTests extends BaseQuest {

    @Test
    @DisplayName("Fetching a profile returns the stored display name")
    void getProfile_whenUserExists_returnsDisplayName(Quest quest) {
        quest
            .use(RING_OF_API)
            .requestAndValidate(GET_USER.withPathParam(ID_PARAM, ID_THREE),
                Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build(),
                Assertion.builder().target(BODY).key(USER_ID.getJsonPath(0))
                         .type(NOT_NULL).expected(true).build())
            .complete();
    }
}
```

## What each part is doing

| Part | Why |
| --- | --- |
| `@API` | enables the API ring |
| `extends BaseQuest` | parallel-safe, independent tests |
| `Quest quest` first parameter | injected by JUnit 5 |
| `requestAndValidate` | send and assert in one step — preferred |
| two assertions | status **and** payload |
| `.complete()` | mandatory; soft assertions flush here |

## One behaviour per test

```java
// Avoid: five behaviours, one opaque failure
void profileApi_worksEndToEnd(Quest quest) { … }

// Prefer: each failure names itself
void getProfile_whenUserExists_returnsDisplayName(Quest quest) { … }
void getProfile_whenUserUnknown_returns404(Quest quest) { … }
void updateProfile_whenNameBlank_returns422(Quest quest) { … }
```

Operations: `api-ring.md`. Endpoints: `api-endpoints.md`. Assertions:
`api-validation.md`.
