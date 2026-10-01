---
name: api-task-profile
description: Apply API-specific implementation requirements when shared ROA automation workflows are planning or implementing API automation.
user-invocable: false
allowed-tools: Read, Glob, Grep, Skill
---

Apply this profile to API automation tasks. The binding rules are the ones in `.claude/rules/` — `roa-engineering.md`, `test-automation.md`, `validation.md`, `api-architecture.md`, `api-contracts.md`, `api-modeling.md`, `api-testing.md`. This profile adds the order of work.

## Procedure

1. State the behavior the test proves and the outcome it asserts.

2. Read the operation in the configured Swagger/OpenAPI source through the `swagger` MCP server, normally via the `roa-api:api-contract-investigator` agent: path and method, every parameter with its location, the request and response schemas, authentication, and the documented error responses. A contract fact without that evidence is `UNVERIFIED`; do not implement against it.

3. Map the operation to the repository: endpoint constant, request model, JSONPath definitions, and authentication mechanism. Reuse each only when it matches the same contract shape.

4. Load `ai-compass` for every `io.cyborgcode.roa.*` type involved and `ai-teacher` before creating a class.

5. Implement in order, skipping what already exists: endpoint constant → request model → JSONPath definitions → test.

6. Compile, run the test, and report as `validation.md` requires.

## Reference

For depth on one concern, read only the matching plugin doc: `${CLAUDE_PLUGIN_ROOT}/docs/api-contract-discovery.md`, `api-endpoints-and-modeling.md`, `api-authentication-and-requests.md`, `api-architecture.md`, `api-test-design.md`, `api-examples.md`. Framework-wide concepts: `roa-core-architecture.md`, `roa-test-lifecycle.md`, `roa-data-and-storage.md`, `roa-custom-services-and-rings.md`.
