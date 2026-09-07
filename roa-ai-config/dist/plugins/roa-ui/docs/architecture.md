# ROA UI Testing Architecture

Split into single-topic chunks:

| Chunk | Covers |
| --- | --- |
| `ui-layers.md` | the three layers, why they are enforced, non-negotiables |
| `ui-types.md` | Layer 1 — component types |
| `ui-elements.md` | Layer 2 — locators and hooks |
| `ui-components.md` | Layer 3 — implementations |
| `ui-facade.md` | `AppUiService` and ring registration |
| `ui-services.md` | every service fluent, element interface and component |
| `ui-tables.md` | tables and `Assertion.builder()` |
| `ui-authentication.md` | `@AuthenticateViaUi`, credentials, login client |
| `ui-insertion.md` | `@InsertionElement` model-driven forms |
| `ui-interception.md` | `@InterceptRequests` and `DataIntercept` |

Framework fundamentals are in the `framework-*` chunks. Signatures are authoritative
in `target/pandora/metadata/` — load the `roa-pandora-metadata` skill.
