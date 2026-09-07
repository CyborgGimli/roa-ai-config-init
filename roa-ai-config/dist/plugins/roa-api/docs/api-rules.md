# API — Non-Negotiable Rules

| Rule | Why |
| --- | --- |
| **ROA ring only** | `quest.use(RING_OF_API)` — direct RestAssured breaks the abstraction and the reporting |
| **Typed endpoints only** | no raw method/URL in a test; all calls go through `AppEndpoints` |
| **No hardcoded secrets** | credentials and API keys come from config, env, or test data |
| **Mandatory headers centrally** | put `x-api-key` in `defaultConfiguration()`, not per call |
| **Centralise JSONPaths** | `ApiResponsesJsonPaths`, never a raw string — in tests *or* in auth clients, hooks, and retry conditions |
| **Use constants** | params, ids, headers and expected values come from `api/constants/`; use them directly, never via a local alias |
| **No wildcard imports** | import only what is used |
| **Always `complete()`** | soft assertions flush there; the lifecycle finalises there |
| **Regenerate after an `Endpoint` change** | `mvn pandora:navigation -U`, or the metadata's options go stale |

## Common mistakes

| Mistake | Instead |
| --- | --- |
| RestAssured called directly in a test | `quest.use(RING_OF_API)` |
| `RestService` used in a `@Test` | the ring; `RestService` is for hooks and auth clients |
| Invented fluent calls (`.post()`, `.expectStatus()`, `.extractJson()`) | the real surface in `api-ring.md`; the verb comes from the endpoint |
| Hardcoded full URL | `getApiConfig().baseUrl()` |
| Query string built by hand | `withQueryParam` / `withPathParam` / `withHeader` |
| Missing `.complete()` | soft assertions never report |
| JSONPath strings scattered | `ApiResponsesJsonPaths` |
| A local constant wrapping a shared one | static-import the shared constant |
| Login flow repeated per test | `@AuthenticateViaApi`, `@Journey`, or a custom ring |
| Hardcoded credentials | `Data.testData().username()` / `.password()` |
| Status asserted, payload ignored | assert both |
| Expecting a hook's response in `StorageKeysApi.API` | `hookData(key, type)` — `RestService` does not store |
| Logic inside `ApiHookFlows` / `DataCreator` / `Preconditions` | the paired `*Functions` class; the enum is wiring |
