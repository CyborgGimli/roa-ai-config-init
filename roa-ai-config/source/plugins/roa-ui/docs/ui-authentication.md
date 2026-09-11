# ROA UI — Authentication

Signing in is a precondition, not a test — unless login, logout, session expiry or
access control *is* the behaviour under test. Push it into the lifecycle so tests
start where the behaviour under test begins; when authentication itself is the
requirement, drive the login flow in the test and do not let `@AuthenticateViaUi`
or cached credentials bypass what the test exists to prove.

## Credentials

```java
public class AdminCredentials implements LoginCredentials {

    @Override
    public String username() {
        return Data.testData().username();
    }

    @Override
    public String password() {
        return Data.testData().password();
    }
}
```

Values come from configuration (the OWNER-backed `DataProperties`), never from
literals. A credential in source is both a bug and a leak.

## Login client

```java
public class AppUiLogin extends BaseLoginClient {

    @Override
    protected <T extends UiServiceFluent<?>> void loginImpl(T uiService,
                                                           String username,
                                                           String password) {
        uiService
            .getNavigation().navigate(getUiConfig().baseUrl())
            .getInputField().insert(InputFields.USERNAME_FIELD, username)
            .getInputField().insert(InputFields.PASSWORD_FIELD, password)
            .getButtonField().click(ButtonFields.SIGN_IN_BUTTON);
    }

    @Override
    protected By successfulLoginElementLocator() {
        return By.tagName("app-layout");
    }
}
```

Inside `loginImpl` you get the raw service accessors (`getNavigation()`,
`getInputField()`, `getButtonField()`) rather than your project's facade
shorthands, because the login client is generic over any `UiServiceFluent`.

`successfulLoginElementLocator()` is how the framework knows the login finished.
Choose something that appears only once authentication has actually completed — a
spinner or a shell that renders before login is a false positive.

## Using it

```java
@Test
@AuthenticateViaUi(credentials = AdminCredentials.class, type = AppUiLogin.class)
void dashboard_whenSignedIn_showsDisplayName(Quest quest) {
    quest.use(RING_OF_UI)
         // the test starts already signed in
         .drop()
         .complete();
}
```

`@AuthenticateViaUi` also accepts `cacheCredentials()` — check the annotation's
metadata for the available options before setting it.

## Why not log in inside the test

A test that signs in as its first three steps fails at step two when the login page
changes, and reports that as a failure of whatever it was actually testing. Keeping
authentication in the lifecycle means a login regression fails the login test, and
only the login test.
