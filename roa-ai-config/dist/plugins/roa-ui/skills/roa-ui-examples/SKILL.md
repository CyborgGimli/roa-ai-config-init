---
name: roa-ui-examples
description: Index of the bundled UI reference docs - points to the right single-topic chunk for the task at hand. Load before writing or reviewing UI code.
user-invocable: false
allowed-tools: Read, Grep, Glob
---

Read the matching chunk under `${CLAUDE_PLUGIN_ROOT}/docs/` **before** writing or
reviewing code. Each file covers one topic; open only what you need.

| If you need | Read |
| --- | --- |
| Orientation / getting started | `ui-usage.md` |
| The three layers, what a component costs | `ui-layers.md` |
| Layer 1 — component types | `ui-types.md` |
| Layer 2 — locators and hooks | `ui-elements.md` |
| Layer 3 — implementations, overload pairs, inheritance | `ui-components.md` |
| `AppUiService` facade | `ui-facade.md` |
| Which service method to call; `Strategy` | `ui-services.md` |
| Table row model, `TableField`, reading, validating | `ui-tables.md` |
| Filtering, sorting, editing, clicking in cells | `ui-tables-operations.md` |
| Reading stored rows and intercepted responses | `ui-storage.md` |
| Login as a precondition | `ui-authentication.md` |
| Model-driven form filling | `ui-insertion.md` |
| Capturing network requests | `ui-interception.md` |
| Which wait to use; `retryUntil` | `ui-retry.md` |
| Required imports | `ui-imports.md` |
| Non-negotiable rules and mistakes | `ui-rules.md` |
| Test shape and structure | `ui-test-basics.md` |
| Preconditions, auth, test data | `ui-test-preconditions.md` |
| Soft vs hard, meaningful assertions | `ui-test-assertions.md` |
| Cross-ring verification | `ui-test-cross-ring.md` |
| Anti-patterns to avoid | `ui-test-antipatterns.md` |
| Quality-gate commands & evidence | `ui-quality-gate.md` |
| Debugging a failure | `ui-debugging.md` |
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
