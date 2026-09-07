# ROA Base Plugin

Foundation plugin for ROA test automation.

## What is ROA?

**Ring of Automation** - A JUnit 5-based test framework with:
- **Quest** — Central test orchestrator (JUnit 5 parameter injection)
- **Rings** — Capability boundaries (UI, API, DB, custom)
- **Fluent chaining** — All code flows as readable method chains
- **Storage** — Per-test data isolation and cross-ring sharing
- **Lifecycle** — @Journey (setup), @Ripper (cleanup), @Craft (data)

## This Plugin Provides

- Project initialization with `/roa-setup`
- Dependency updates with `/roa-update`
- Reference documentation links
- Pandora metadata guidance

## First Steps

1. Read `.claude/NAVIGATION.md`
2. Run `/roa-setup` in your project
3. Review `.codex/instructions/` after setup
4. Check target project's `.claude/examples/` for working patterns

## Further Documentation

- Framework core concepts: `.codex/instructions/core-framework-instructions.md`
- UI testing: `.codex/instructions/ui-framework-instructions.md`
- Code standards: `.codex/rules/rules.md`
- Metadata: `target/pandora/metadata/` (after `mvn pandora:open -U`)
