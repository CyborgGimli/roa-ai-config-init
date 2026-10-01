<!-- BEGIN ROA AI CONFIG: roa-ui -->

# Project Claude Code Guide

## ROA AI Config — ${plugin_name}

Configured for `${enabled_plugin}` (marketplace `${marketplace_name}`, ref `${marketplace_ref}`). This block is generated — put repository-specific guidance outside the managed markers so updates preserve it.

- **Workflows:** `/${plugin_name}:plan-test-automation` to plan, `/${plugin_name}:implement-test-automation` to build, `/${plugin_name}:run-tests` to execute, `/${plugin_name}:debug-test-automation` or `/${plugin_name}:fix-tests` for failures, `/${plugin_name}:validate-test-automation` before claiming done, `/${plugin_name}:review-test-automation` for an independent review. Use `/${plugin_name}:architect-ui-tests` when a task needs application investigation or new components, elements, synchronization, insertion, tables, interception, or session handling.
- **Three sources of truth:** the live application through the MCP browser tools for anything about the UI; `ai-compass` (Pandora metadata) for every `io.cyborgcode.roa.*` API; the repository for project conventions. `app-knowledge` files and documentation are leads to verify, not evidence.
- **Rules:** `.claude/rules/` holds the binding rules — `roa-engineering.md` for how code is built, `ui-elements.md` for controls and components, `ui-testing.md` for test shape. Deeper reference and worked examples ship in the plugin's `docs/`.
- **Done:** the change compiles and the tests that prove it ran and passed; report exactly what ran and what remains unvalidated.
- **Update:** refresh this block with `/roa-base:update ${plugin_name} <version-or-ref>`.

<!-- END ROA AI CONFIG: roa-ui -->
