# ROA Framework Foundation

This reference is split into single-topic chunks. Read them in this order:

| Chunk | Covers |
| --- | --- |
| `framework-overview.md` | what ROA is, reading order, precedence |
| `framework-quest.md` | Quest, base classes, test anatomy, `complete()` |
| `framework-rings.md` | rings, `drop()`, custom rings, module annotations |
| `framework-storage.md` | storage, `retrieve`, extractors, index semantics |
| `framework-lifecycle.md` | `@Journey`, `@Ripper`, `@Craft`, `@StaticTestData`, hooks, tags |
| `framework-registries.md` | `DataCreator`, `Preconditions`, `DataCleaner` |
| `framework-validation.md` | hard/soft assertions, `Assertion.builder()`, targets and types |
| `framework-retry.md` | `retryUntil`, `RetryCondition`, custom-ring wrappers |
| `framework-config.md` | OWNER config, static data, project layout, gates |

Module detail lives in the `ui-*`, `api-*` and `db-*` chunks in this same folder.
Anything specific to one module — the three UI layers, `Endpoint`, `DbQuery` — is
documented there, not here.

`target/pandora/metadata/` is the authority for signatures — load the
`ai-compass` skill before writing `io.cyborgcode.roa` code. For the shape a new
class should take, load `ai-teacher` and read the curated lessons in
`target/pandora/ai-teacher/`.
