# ROA Database Testing Architecture

The **roa-db** plugin covers database testing through ROA's query abstractions and
the `DatabaseServiceFluent` ring.

Split into single-topic chunks:

| Chunk | Covers |
| --- | --- |
| `db-ring.md` | `RING_OF_DB`, every operation, cross-ring verification |
| `db-queries.md` | `DbQuery<T>`, `withParam`, placeholder rules |
| `db-types.md` | `DbType<T>` — driver, protocol, multi-database |
| `db-config.md` | connection configuration and MCP-facing `ai-config.yaml` |
| `db-storage.md` | `QueryResponse` storage, JSONPath extraction, chaining |
| `db-hooks.md` | class-level `@DbHook` flows |
| `db-retry.md` | `retryUntil` and eventual consistency (mechanism: `ai-compass` metadata for `RetryCondition`) |
| `db-validation.md` | `DbAssertionTarget`, types, assertion patterns |
| `db-rules.md` | non-negotiable rules, mistakes, performance traps |

Framework fundamentals are in the `framework-*` chunks. Signatures are authoritative
in `target/pandora/metadata/` — load the `ai-compass` skill.
