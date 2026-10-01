<!-- BEGIN ROA AI CONFIG: roa-api -->

# Project Claude Code Guide

## ROA AI Config — ${plugin_name}

Configured for `${enabled_plugin}` (marketplace `${marketplace_name}`, ref `${marketplace_ref}`). This block is generated — put repository-specific guidance outside the managed markers so updates preserve it.

- **Workflows:** `/${plugin_name}:plan-test-automation` to plan, `/${plugin_name}:implement-test-automation` to build, `/${plugin_name}:run-tests` to execute, `/${plugin_name}:debug-test-automation` or `/${plugin_name}:fix-tests` for failures, `/${plugin_name}:validate-test-automation` before claiming done, `/${plugin_name}:review-test-automation` for an independent review. Use `/${plugin_name}:architect-api-tests` when a task needs contract investigation or new endpoints and models.
- **Three sources of truth:** Swagger/OpenAPI through the `swagger` MCP server for the application contract; `ai-compass` (Pandora metadata) for every `io.cyborgcode.roa.*` API; the repository for project conventions. Documentation and knowledge files are leads to verify, not evidence.
- **Rules:** `.claude/rules/` holds the binding rules — `roa-engineering.md` for how code is built, `api-contracts.md` and `api-modeling.md` for endpoints and models, `api-testing.md` for assertions. Deeper reference and worked examples ship in the plugin's `docs/`.
- **Done:** the change compiles and the tests that prove it ran and passed; report exactly what ran and what remains unvalidated.
- **Update:** refresh this block with `/roa-base:update ${plugin_name} <version-or-ref>`.

<!-- END ROA AI CONFIG: roa-api -->
