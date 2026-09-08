# ROA Framework — Overview

ROA (Ring of Automation) is a test automation framework on top of JUnit 5.

- **Fluent chained syntax** — test code flows as method chains.
- **Quest-centric orchestration** — every test receives a `Quest`.
- **Ring-based capabilities** — services ("rings") provide domain actions.
- **Annotation-driven lifecycle** — setup, cleanup and data injection.
- **Per-test isolation** — independent state via storage.

## Reading order

1. `framework-quest.md` — the test entry point
2. `framework-rings.md` — how capabilities are reached
3. `framework-storage.md` — how data moves between steps
4. `framework-lifecycle.md` — preconditions, cleanup, data injection
5. `framework-registries.md` — the enum registries those annotations reference
6. `framework-validation.md` — assertions
7. `framework-config.md` — configuration and project layout

Then the module chunk for what you are working on (`ui-*`, `api-*`, `db-*`).

## Source of truth

`target/pandora/metadata/` is authoritative for signatures. Load the
`ai-compass` skill before writing `io.cyborgcode.roa` code, and whenever
something does not compile.

## Precedence

Specificity wins: directory-specific guidance → module instructions → Pandora
metadata → examples → best practices → general rules.

A module rule outranks the metadata. `Assertion.builder()` exists for many targets
and is still wrong for ordinary UI components.
