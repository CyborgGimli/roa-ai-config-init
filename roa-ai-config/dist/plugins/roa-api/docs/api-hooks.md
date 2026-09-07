# API — Hooks

Hooks are class-level flows that run once before or after a test class. Use them for
reachability checks and class-scoped cleanup — not for per-test setup, which belongs
in `@Journey`.

## Declaring flows

`ApiHookFlows` implements `ApiHookFlow`; the implementations live in
`ApiHookFunctions` and use `RestService`.

```java
public enum ApiHookFlows implements ApiHookFlow {

    PING_REQRES(ApiHookFunctions::pingReqres),
    DELETE_LEADER_USER(ApiHookFunctions::deleteLeaderUser);

    public static final class Data {
        public static final String PING_REQRES = "PING_REQRES";
        public static final String DELETE_LEADER_USER = "DELETE_LEADER_USER";

        private Data() {
        }
    }
}
```

## Use

```java
@API
@ApiHook(when = HookExecution.BEFORE, type = ApiHookFlows.Data.PING_REQRES)
@ApiHook(when = HookExecution.AFTER,  type = ApiHookFlows.Data.DELETE_LEADER_USER)
class ApiHooksExamplesTest extends BaseQuest { }
```

`HookExecution` is `BEFORE` or `AFTER`.

## What belongs in a hook

- **Yes**: health/reachability checks, class-scoped cleanup, seeding shared reference
  data that every test in the class reads.
- **No**: per-test data — use `@Journey` and `@Ripper`, which run per test and clean
  up on failure.
- **No**: anything that mutates a shared environment other classes depend on.

A hook that fails should fail loudly at class level, so every test in the class is
reported as blocked rather than each failing for a confusing reason.
