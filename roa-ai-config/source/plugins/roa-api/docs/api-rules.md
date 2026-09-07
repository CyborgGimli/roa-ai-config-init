# API — Non-Negotiable Rules

| Rule | Why |
| --- | --- |
| **ROA ring only** | `quest.use(RING_OF_API)` — direct RestAssured breaks the abstraction and the reporting |
| **Typed endpoints only** | no raw method/URL in a test; all calls go through `AppEndpoints` |
| **No hardcoded secrets** | credentials and API keys come from config, env, or test data |
| **Mandatory headers centrally** | put `x-api-key` in `defaultConfiguration()`, not per call |
| **Centralise JSONPaths** | `ApiResponsesJsonPaths`, never a raw string in a test |
| **Use constants** | params, ids, headers and expected values come from constants classes |
| **No wildcard imports** | import only what is used |
| **Always `complete()`** | soft assertions flush there; the lifecycle finalises there |

## Common mistakes

| Mistake | Instead |
| --- | --- |
| RestAssured called directly in a test | `quest.use(RING_OF_API)` |
| Hardcoded full URL | `getApiConfig().baseUrl()` |
| Query string built by hand | `withQueryParam` / `withPathParam` / `withHeader` |
| Missing `.complete()` | soft assertions never report |
| JSONPath strings scattered | `ApiResponsesJsonPaths` |
| Login flow repeated per test | `@AuthenticateViaApi`, `@Journey`, or a custom ring |
| Hardcoded credentials | `Data.testData().username()` / `.password()` |
| Status asserted, payload ignored | assert both |
