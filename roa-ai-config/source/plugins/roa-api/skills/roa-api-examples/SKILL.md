---
name: roa-api-examples
description: Index of the bundled API reference docs - points to the right single-topic chunk for the task at hand. Load before writing or reviewing API code.
user-invocable: false
allowed-tools: Read, Grep, Glob
---

Read the matching chunk under `${CLAUDE_PLUGIN_ROOT}/docs/` **before** writing or
reviewing code. Each file covers one topic; open only what you need.

| If you need | Read |
| --- | --- |
| Orientation / getting started | `api-usage.md` |
| The ring and its operations | `api-ring.md` |
| `RestService` — hooks, auth clients, `LogApi` | `api-rest-service.md` |
| Typed endpoints and parameterisation | `api-endpoints.md` |
| Where a class goes; constants discipline | `api-project-structure.md` |
| Request/response DTOs | `api-dtos.md` |
| Centralised JSONPaths | `api-extractors.md` |
| Response storage, `retrieve`, extractors | `api-storage.md` |
| `@AuthenticateViaApi` | `api-authentication.md` |
| Class-level `@ApiHook` flows | `api-hooks.md` |
| Retry and eventual consistency | `api-retry.md` |
| Targets, types, assertion patterns | `api-validation.md` |
| Required imports | `api-imports.md` |
| Non-negotiable rules and mistakes | `api-rules.md` |
| Test shape and structure | `api-test-basics.md` |
| Preconditions, auth, test data | `api-test-lifecycle.md` |
| Cross-ring verification | `api-test-cross-ring.md` |
| Anti-patterns to avoid | `api-test-antipatterns.md` |
| Quality-gate commands & evidence | `api-quality-gate.md` |
| Debugging a failure | `api-debugging.md` |
| What ROA is; reading order; precedence | `framework-overview.md` |
| Quest, base classes, `complete()` | `framework-quest.md` |
| Rings, `drop()`, custom rings | `framework-rings.md` |
| Storage, `retrieve`, extractors, indexes | `framework-storage.md` |
| `@Journey` / `@Ripper` / `@Craft` / `Late`, hooks, tags | `framework-lifecycle.md` |
| `DataCreator` / `Preconditions` / `DataCleaner` | `framework-registries.md` |
| Hard vs soft, `Assertion.builder()`, types | `framework-validation.md` |
| `retryUntil` and `RetryCondition` | `framework-retry.md` |
| Config, static data, project layout | `framework-config.md` |
| Code standards and the forbidden list | `code-standards.md` |
| Test shape and validation patterns | `testing-standards.md` |
| Gate commands and evidence format | `quality-gates.md` |
| Reading the generated framework contract | `pandora-metadata.md` |

Prefer the chunk that matches the change in front of you. These docs are reference,
not law — never apply a pattern that contradicts working code already in the repo.

For the authoritative class contract, load `roa-pandora-metadata` and read
`target/pandora/metadata/` directly. That is the source of truth when a signature is
unclear or something does not compile; module rules still outrank it.
