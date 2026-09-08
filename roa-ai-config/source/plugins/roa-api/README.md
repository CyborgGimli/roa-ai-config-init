# ROA API Plugin

AI-assisted REST API test development for the ROA framework.

## What it does

Guides API test creation through ROA's API ring:

1. **Typed endpoints** — one `AppEndpoints` enum implementing `Endpoint<T>`
2. **DTOs** — Lombok request models, extra-field-tolerant response models
3. **The ring** — `quest.use(RING_OF_API)`, which is `RestServiceFluent`
4. **Assertions** — `Assertion.builder()` over `STATUS`, `BODY`, `HEADER`

## Using this plugin

1. `/roa-base:setup roa-api`, then `/reload-plugins --force`
2. `/roa-api-architect` to generate tests
3. Read the single-topic chunks in `docs/` — start at `api-architecture.md`
4. Load `ai-compass` for any signature that is unclear

## Core concepts

- **Endpoints as enum constants** — HTTP method + relative URL, parameterised per
  call with `withPathParam` / `withQueryParam` / `withHeader`
- **Automatic response storage** — every ring call stores its `Response` under
  `StorageKeysApi.API`, keyed by the endpoint constant
- **`retrieve(...)` for chaining** — read a stored response, map it to a DTO, feed
  it into the next call or into a cross-ring check
- **Declarative auth** — `@AuthenticateViaApi(credentials = ..., type = ...)` over a
  `Credentials` implementation and a `BaseAuthenticationClient` subclass
- **Class-level hooks** — `@ApiHook(when = BEFORE/AFTER, type = ...)` running
  `ApiHookFlow` flows through `RestService`

## Key constraints

- ✓ `quest.use(RING_OF_API)` only — no RestAssured in a test
- ✓ Typed endpoints only — no raw method or URL at a call site
- ✓ JSONPaths live in `ApiResponsesJsonPaths`; params, ids and headers in `api/constants/`
- ✓ No hardcoded credentials, base URLs, or API keys
- ✓ Mandatory headers go in `defaultConfiguration()`, not per call
- ✓ Every chain ends with `.complete()`

The nested `Data` class of string keys belongs to `DataCreator`, `DataCleaner`,
`Preconditions`, and `ApiHookFlows` — the registries annotations reference by
name. `AppEndpoints` is referenced as a constant and has none.

---

Reference docs ship in `docs/`; skills in `skills/`; the contract reviewer in
`agents/roa-api-contract-reviewer.md`.
