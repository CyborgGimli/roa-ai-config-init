# UI — Test Basics

The shape of a UI test. Rules are in `testing-standards.md`; this is them applied.

```java
@UI
class LoginTests extends BaseQuest {

    @Test
    @Tag("Smoke")
    @DisplayName("User can sign in with valid credentials")
    void login_withValidCredentials_succeeds(Quest quest) {
        quest
            .use(RING_OF_UI)
            .browser().navigate(getUiConfig().baseUrl())
            .input().insert(InputFields.USERNAME_FIELD, VALID_USER)
            .input().insert(InputFields.PASSWORD_FIELD, VALID_PASSWORD)
            .button().click(ButtonFields.LOGIN_BUTTON)
            .alert().validateValue(AlertFields.SUCCESS, "Signed in")
            .drop()
            .complete();
    }
}
```

## What each part is doing

| Part | Why |
| --- | --- |
| `@UI` | enables the UI ring for the class |
| `extends BaseQuest` | parallel-safe, independent tests |
| `Quest quest` first parameter | injected by JUnit 5 |
| `login_withValidCredentials_succeeds` | `action_condition_result` |
| `@DisplayName` | the human-readable intent, as a real sentence |
| `.drop()` then `.complete()` | exit the ring, then finalise — `complete()` is mandatory |

## One behaviour per test

A chain that exercises five behaviours fails as one opaque unit. Several short tests
name their own failure:

```java
void login_withValidCredentials_succeeds(Quest quest) { … }
void login_withWrongPassword_showsError(Quest quest) { … }
void login_withLockedAccount_showsLockedMessage(Quest quest) { … }
```

Next: `ui-test-preconditions.md` for pushing setup out of the test body.
