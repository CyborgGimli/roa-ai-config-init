# ROA DB Plugin

AI-assisted database test development for ROA framework.

## What It Does

Guides database test creation using SQL query patterns with:

1. **Query Enums** — Define SQL queries with parameterized statements
2. **Result Mappers** — Type-safe result object mapping
3. **Fluent Assertions** — Readable result validation patterns
4. **Transaction Control** — Test isolation and cleanup

## Using This Plugin

1. Start with `/roa-db-architect` to generate DB tests
2. Reference `.codex/instructions/` for patterns
3. Check examples for query and mapper patterns
4. Verify against `.codex/rules/rules.md`

## Core Concepts

- **Queries as enums** — Parameterized SQL with ? placeholders
- **Result mappers** — Type-safe row→object mapping
- **Fluent validation** — `.hasColumn()`, `.expectRowCount()`
- **Transactions** — @Transactional for automatic rollback
- **Data cleanup** — @Ripper lifecycle for test isolation

## Key Constraints

- ✓ Always use parameterized queries (no string interpolation)
- ✓ Queries defined in enums with nested Data class
- ✓ Result mappers handle null safely
- ✓ Tests end with `.complete()`
- ✓ Transactions ensure test isolation

---

See `.claude/AGENTS.md` for AI orchestration details.
