# ROA UI Testing Architecture

The **roa-ui** plugin covers browser automation through ROA's three-layer component
architecture and the project's `AppUiService` ring.

Split into single-topic chunks:

| Chunk | Covers |
| --- | --- |
| `ui-usage.md` | orientation, first steps, which skill and agent to use |
| `ui-layers.md` | the three layers, why they are enforced |
| `ui-types.md` | Layer 1 — component types |
| `ui-elements.md` | Layer 2 — locators and sync hooks |
| `ui-components.md` | Layer 3 — implementations, overload pairs, inheritance |
| `ui-facade.md` | `AppUiService` and ring registration |
| `ui-services.md` | every service fluent and its methods; `Strategy` |
| `ui-tables.md` | table row model, `TableField`, reading and validating |
| `ui-tables-operations.md` | filter, sort, edit, click-in-cell, custom cell handlers |
| `ui-storage.md` | `DataExtractorsUi`, intercepted responses, table rows |
| `ui-authentication.md` | `@AuthenticateViaUi`, credentials, login client |
| `ui-insertion.md` | `@InsertionElement` model-driven forms |
| `ui-interception.md` | `@InterceptRequests` and `DataIntercept` |
| `ui-retry.md` | which wait to reach for, and `retryUntil` |
| `ui-imports.md` | the import table |
| `ui-rules.md` | non-negotiable rules and common mistakes |

Framework fundamentals are in the `framework-*` chunks. Signatures are authoritative
in `target/pandora/metadata/` — load the `roa-pandora-metadata` skill.
