# API — Authentication

Authentication is declarative. Repeating a login flow in every test means a login
change breaks every test at once.

## Two pieces

**Credentials** resolve from config-backed test data:

```java
public class AdminAuth implements Credentials {

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

**Auth client** performs the login, extracts the token, and returns the header to
attach:

```java
public class AppAuth extends BaseAuthenticationClient {
    // performs the login request, extracts the token,
    // returns e.g. Authorization: Bearer <token>
}
```

## Use

```java
@Test
@AuthenticateViaApi(credentials = AdminAuth.class,
                    type = AppAuth.class,
                    cacheCredentials = true)
void authenticatedCall(Quest quest) { }
```

## Rules

- No hardcoded credentials. Ever. They come from `Data.testData()`.
- Prefer the annotation over a login flow repeated per test.
- `cacheCredentials = true` only when reuse within a run is actually correct — a test
  that depends on a *fresh* session must not cache.
- `AuthenticationKey` is the cache key `BaseAuthenticationClient` builds from the
  username, password and client type. It is internal — never construct or pass one.

## Imports

```java
import io.cyborgcode.roa.api.annotations.AuthenticateViaApi;
import io.cyborgcode.roa.api.authentication.Credentials;
import io.cyborgcode.roa.api.authentication.BaseAuthenticationClient;
```
