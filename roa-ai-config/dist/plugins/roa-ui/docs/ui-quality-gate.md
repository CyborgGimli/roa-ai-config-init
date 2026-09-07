# ROA UI Testing — Quality Gate Examples

Worked examples of the gate defined in `quality-gates.md`, as `roa-ui-quality-gate`
runs it.

## A passing change

```text
[gate] mvn clean compile                        -> exit 0   PASS
[gate] mvn test -Pe2e -Dtest=LoginTests   -> exit 0   PASS  (7 tests, 0 failures)
[gate] mvn clean install                        -> exit 0   PASS
result: PASS
```

## A failing change

```text
[gate] mvn clean compile                        -> exit 0   PASS
[gate] mvn test -Pe2e -Dtest=LoginTests   -> exit 1   FAIL
         2 failures, 0 errors
         LoginTests.searchByName_withNoMatch_showsEmptyState
           expected: <"No results"> but was: <"">
[gate] mvn clean install                        -> skipped (not reached; tests failing)
result: FAIL
```

Report the failing assertion, not the whole Maven log. The reviewer needs to know
what broke, not how verbose Maven is.

## An inconclusive run

```text
[gate] mvn clean compile                        -> exit 0   PASS
[gate] mvn test -Pe2e -Dtest=LoginTests   -> exit 1   FAIL
         1 error: could not reach https://staging.internal — connection refused
result: INCONCLUSIVE  (environment issue; the change itself is unverified)
```

An environment failure is not a code failure. Say which it was, and say plainly that
the change remains unproven.

## Scoping the gate

Run only what the change can affect. A change to one component does not need the
whole suite on every iteration — but the full suite runs before the change is
called done.

```bash
mvn test -Pe2e -Dtest=LoginTests          # during the change
mvn clean install                                # before declaring done
```

## Never

```bash
mvn clean install -DskipTests     # blocked by maven-command-guard
```

Skipping tests to reach a green build produces a result that proves nothing. The
hook blocks it; do not work around the hook.
