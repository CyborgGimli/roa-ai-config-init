# ROA API Plugin

AI-assisted REST API test development for ROA framework.

## What It Does

Guides API test creation using fluent patterns with:

1. **Endpoint Enums** — Define API endpoints with HTTP methods
2. **DTO Classes** — Type-safe request/response objects
3. **Fluent APIs** — Readable, chainable API test syntax
4. **Assertions** — Response validation patterns

## Using This Plugin

1. Start with `/roa-api-architect` to generate API tests
2. Reference `.codex/instructions/` for patterns
3. Check examples for endpoint and DTO patterns
4. Verify against `.codex/rules/rules.md`

## Core Concepts

- **Endpoints as enums** — HTTP method + URL path
- **DTOs for safety** — Request/response type definitions
- **Fluent validation** — `.expectStatus()`, `.expectJsonPath()`
- **Data extraction** — `.extractJson()` for cross-ring sharing
- **Storage sharing** — Store API responses for DB/UI verification

## Key Constraints

- ✓ Endpoints defined in enums with nested Data class
- ✓ DTOs for all request/response shapes
- ✓ Parameterized queries (no string interpolation)
- ✓ Tests end with `.complete()`

---

See `.claude/AGENTS.md` for AI orchestration details.
