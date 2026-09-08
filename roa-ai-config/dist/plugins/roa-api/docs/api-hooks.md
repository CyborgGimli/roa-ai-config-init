# API — Hooks

Hooks are class-level flows that run once before or after a test class. Use them for
reachability checks and class-scoped cleanup — not for per-test setup, which belongs
in `@Journey`.

## Two parts

**`ApiHookFlows`** is wiring only. It implements `ApiHookFlow<ApiHookFlows>`, whose
contract is `flow()` returning a `TriConsumer<RestService, Map<Object, Object>, String[]>`
plus `enumImpl()`.

```java
public enum ApiHookFlows implements ApiHookFlow<ApiHookFlows> {

    PING_REQRES(ApiHookFunctions::pingReqres),
    DELETE_LEADER_USER(ApiHookFunctions::deleteLeaderUser);

    public static final class Data {

        public static final String PING_REQRES = "PING_REQRES";
        public static final String DELETE_LEADER_USER = "DELETE_LEADER_USER";

        private Data() {
        }
    }

    private final TriConsumer<RestService, Map<Object, Object>, String[]> flow;

    ApiHookFlows(final TriConsumer<RestService, Map<Object, Object>, String[]> flow) {
        this.flow = flow;
    }

    @Override
    public TriConsumer<RestService, Map<Object, Object>, String[]> flow() {
        return flow;
    }

    @Override
    public ApiHookFlows enumImpl() {
        return this;
    }
}
```

The nested `Data` class exists because `@ApiHook(type = ...)` takes a `String`, and
an annotation cannot reference an enum constant's name. The constant name and the
string must match — the framework resolves the flow by name.

**`ApiHookFunctions`** holds the logic. A hook has no Quest chain, so it uses
`RestService` directly — see `api-rest-service.md`.

```java
public final class ApiHookFunctions {

    private ApiHookFunctions() {
    }

    public static void pingReqres(RestService service, Map<Object, Object> storage, String[] args) {
        service.requestAndValidate(
            GET_ALL_USERS.withQueryParam(PAGE_PARAM, PAGE_ONE),
            Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build());
    }
}
```

`TriConsumer` is `org.apache.logging.log4j.util.TriConsumer`.

## Use

```java
@API
@ApiHook(when = HookExecution.BEFORE, type = ApiHookFlows.Data.PING_REQRES)
@ApiHook(when = HookExecution.AFTER,  type = ApiHookFlows.Data.DELETE_LEADER_USER)
class ApiHooksExamplesTest extends BaseQuest { }
```

`@ApiHook` is class-level (`@Target(TYPE)`) and repeatable — Java wraps multiple
occurrences into the container `@ApiHooks` for you, so never write `@ApiHooks`
yourself.

| Attribute | Meaning |
| --- | --- |
| `when` | `HookExecution.BEFORE` or `HookExecution.AFTER` |
| `type` | the flow's string key, e.g. `ApiHookFlows.Data.PING_REQRES` |
| `order` | among hooks with the same `when`, lower runs first |
| `arguments` | `String[]` passed through to the flow's third parameter |

## Passing data out of a hook

The flow's second parameter is a shared map. Write into it, then read it back in a
test with `hookData(key, type)`:

```java
public static void pingReqres(RestService service, Map<Object, Object> storage, String[] args) {
    Response response = service.request(GET_ALL_USERS.withQueryParam(PAGE_PARAM, PAGE_ONE));
    storage.put(ApiHookKeys.PING_STATUS, response.getStatusCode());
}
```

```java
Integer pingStatus = hookData(ApiHookKeys.PING_STATUS, Integer.class);
```

Hook responses are **not** written into `StorageKeysApi.API` — `RestService` does not
store, only the ring does. `hookData` is the only way back out.

## What belongs in a hook

- **Yes**: health/reachability checks, class-scoped cleanup, seeding shared reference
  data that every test in the class reads.
- **No**: per-test data — use `@Journey` and `@Ripper`, which run per test and clean
  up on failure.
- **No**: anything that mutates a shared environment other classes depend on.

A hook that fails should fail loudly at class level, so every test in the class is
reported as blocked rather than each failing for a confusing reason.

## Rules

- Keep `ApiHookFlows` as wiring; put the logic in `ApiHookFunctions`.
- Use typed endpoints and constants inside hook functions, exactly as in tests.
- Adding a flow means adding both the enum constant and the matching `Data` string.
