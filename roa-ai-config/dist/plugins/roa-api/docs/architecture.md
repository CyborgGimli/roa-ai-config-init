# ROA API Testing Architecture

The **roa-api** plugin covers REST API testing through ROA's endpoint abstractions
and the `RestServiceFluent` ring.

Split into single-topic chunks:

| Chunk | Covers |
| --- | --- |
| `api-ring.md` | `RING_OF_API`, every operation, when to use which |
| `api-endpoints.md` | `Endpoint<T>`, `defaultConfiguration()`, parameterisation |
| `api-dtos.md` | request/response models, Jackson tolerance |
| `api-extractors.md` | the `ApiResponsesJsonPaths` registry |
| `api-storage.md` | automatic response storage and request chaining |
| `api-authentication.md` | `@AuthenticateViaApi`, `Credentials`, auth client |
| `api-hooks.md` | class-level `@ApiHook` flows |
| `api-retry.md` | `retryUntil` and eventual consistency |
| `api-validation.md` | targets, types, and assertion patterns |
| `api-imports.md` | the import table |
| `api-rules.md` | non-negotiable rules and common mistakes |

Framework fundamentals are in the `framework-*` chunks. Signatures are authoritative
in `target/pandora/metadata/` — load the `roa-pandora-metadata` skill.
