# DB — Hooks

`@DbHook` runs a class-level flow once before or after a test class. Use it for
schema reachability and class-scoped seed/cleanup — not per-test data, which belongs
in `@Journey` and `@Ripper`.

## Declaring flows

`DbHookFlows` implements `DbHookFlow`; implementations live beside it.

```java
public enum DbHookFlows implements DbHookFlow {

    PING_DATABASE(DbHookFunctions::pingDatabase),
    RESET_REFERENCE_DATA(DbHookFunctions::resetReferenceData);

    public static final class Data {
        public static final String PING_DATABASE = "PING_DATABASE";
        public static final String RESET_REFERENCE_DATA = "RESET_REFERENCE_DATA";

        private Data() {
        }
    }
}
```

## Use

```java
@DB
@DbHook(when = HookExecution.BEFORE, type = DbHookFlows.Data.PING_DATABASE)
@DbHook(when = HookExecution.AFTER,  type = DbHookFlows.Data.RESET_REFERENCE_DATA)
class AccountQueryTests extends BaseQuest { }
```

## What belongs in a hook

- **Yes**: connectivity checks, seeding reference data every test in the class reads,
  class-scoped teardown of data the class created.
- **No**: per-test rows — `@Ripper` cleans up on the failure path, a hook does not
  know which test failed.
- **No**: destructive statements against a shared environment.

A failing `BEFORE` hook should fail the class loudly, so every test reports as
blocked rather than each failing for a confusing reason.
