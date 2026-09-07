# API — Project Structure

The API layer has a fixed shape. Keeping it means a reviewer can find anything
without reading the whole module; collapsing it means every test grows its own
private copy of the same three constants.

| Area | Package | Contents |
| --- | --- | --- |
| Endpoints | `{project}.api` | `AppEndpoints` — the one typed endpoint registry |
| Auth | `{project}.api.authentication` | `Credentials` impl + `BaseAuthenticationClient` subclass |
| DTOs | `{project}.api.dto.request` / `.response` | data-only Jackson/Lombok models |
| Constants | `{project}.api.constants` | header keys, param keys, assertion messages, expected values |
| Extractors | `{project}.api.extractors` | `ApiResponsesJsonPaths` |
| Hooks | `{project}.api.hooks` | `ApiHookFlows` (wiring) + `ApiHookFunctions` (logic) |
| Rings | `{project}.common.base` | `Rings.RING_OF_API` |
| Test data | `{project}.common.data` | `DataCreator` / `DataCreatorFunctions`, `DataCleaner` / `DataCleanerFunctions` |
| Preconditions | `{project}.common.preconditions` | `Preconditions` / `PreconditionFunctions` |

Tests live under `src/test/java/{project}/api`. Do not invent a parallel `.test` or
`.tests` package. If the API package already exists, use it exactly as it is.

## The registry + functions split

`DataCreator`, `DataCleaner`, `Preconditions`, and `ApiHookFlows` are **wiring only**:
enum constants, a nested `Data` class of matching string keys, and the interface
methods. The behaviour lives in the paired `*Functions` final utility class. Keeping
logic out of the enum keeps the registry readable as an index of what exists.

## Constants

Split by category rather than into one bag:

| Need | Class |
| --- | --- |
| Header key or prefix | `Headers` |
| Query parameter key | `QueryParams` |
| Path variable key | `PathVariables` |
| Assertion message | `AssertionMessages` |
| Stable expected value, id, page size | `TestConstants` (nested by area) |

Constants are `public static final`, in stateless `final` classes with a private
constructor. Small deterministic formatter methods are fine; anything with a side
effect is not.

**Use the existing constant directly** — usually through a static import. Do not
wrap one in a local alias:

```java
// Wrong: an alias that hides where the value really lives
private static final String NAME = TestConstants.Users.CREATE_USER_NAME;

// Right
import static {project}.api.constants.TestConstants.Users.CREATE_USER_NAME;
```

Create a new local constant only when the value is genuinely test-specific, or is
derived from something that does not exist as a shared constant.

Two things never go in `api/constants`: **secrets** (they come from `Data.testData()`
or the environment) and **JSONPaths** (they belong in `ApiResponsesJsonPaths`).

## Adding an endpoint — the checklist

1. Add the constant to `AppEndpoints` with the right method and relative URL.
2. Use `{param}` placeholders for path parameters.
3. Add any new param or header key to `api/constants`.
4. Add any newly asserted response field to `ApiResponsesJsonPaths`.
5. Add request/response DTOs only if a meaningful body is involved.
6. Run `mvn pandora:open -U` — `Endpoint` implementations are on the regeneration
   list, and the metadata's `availableOptions` will not offer the new constant until
   you do.

## Generate only what is used

Every class, enum constant, DTO, hook, journey, cleaner, and auth component must be
referenced by a generated test, by another class those tests need, or by a framework
contract. Speculative scaffolding is the fastest way to make a suite look larger than
its coverage. Prefer the smallest correct implementation; add support code when it
becomes necessary, not before.
