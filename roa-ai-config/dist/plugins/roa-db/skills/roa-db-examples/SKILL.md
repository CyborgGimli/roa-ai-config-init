---
name: roa-db-examples
description: Index of the bundled Database reference docs - points to the right single-topic chunk for the task at hand. Load before writing or reviewing Database code.
user-invocable: false
allowed-tools: Read, Grep, Glob
---

Read the matching chunk under `${CLAUDE_PLUGIN_ROOT}/docs/` **before** writing or
reviewing code. Each file covers one topic; open only what you need.

| If you need | Read |
| --- | --- |
| Orientation / getting started | `db-usage.md` |
| The ring and its operations | `db-ring.md` |
| `DbQuery` and `withParam` | `db-queries.md` |
| `DbType` — driver and protocol | `db-types.md` |
| Connection configuration | `db-config.md` |
| Response storage and extraction | `db-storage.md` |
| Class-level `@DbHook` flows | `db-hooks.md` |
| Retry and eventual consistency | `db-retry.md` |
| Targets, types, assertion patterns | `db-validation.md` |
| Non-negotiable rules and mistakes | `db-rules.md` |
| Test shape and structure | `db-test-basics.md` |
| Preconditions and cleanup | `db-test-lifecycle.md` |
| Cross-ring verification | `db-test-cross-ring.md` |
| Testing migrations | `db-test-migrations.md` |
| Anti-patterns to avoid | `db-test-antipatterns.md` |
| Quality-gate commands & evidence | `db-quality-gate.md` |
| Debugging a failure | `db-debugging.md` |
| What ROA is; reading order; precedence | `framework-overview.md` |
| Quest, base classes, `complete()` | `framework-quest.md` |
| Rings, `drop()`, custom rings | `framework-rings.md` |
| Storage, `retrieve`, extractors, indexes | `framework-storage.md` |
| `@Journey` / `@Ripper` / `@Craft` / `Late`, hooks, tags | `framework-lifecycle.md` |
| `DataCreator` / `Preconditions` / `DataCleaner` | `framework-registries.md` |
| Hard vs soft, `Assertion.builder()`, types | `framework-validation.md` |
| `retryUntil` and `RetryCondition` | `framework-retry.md` |
| POM setup, property files, environments, layout | `framework-config.md` |
| Code standards and the forbidden list | `code-standards.md` |
| Test shape and validation patterns | `testing-standards.md` |
| Gate commands and evidence format | `quality-gates.md` |
| Reading the generated framework contract | `pandora-metadata.md` |

Prefer the chunk that matches the change in front of you. These docs are reference,
not law — never apply a pattern that contradicts working code already in the repo.

For the authoritative class contract, load `ai-compass` and read
`target/pandora/metadata/` directly. That is the source of truth when a signature is
unclear or something does not compile; module rules still outrank it.
