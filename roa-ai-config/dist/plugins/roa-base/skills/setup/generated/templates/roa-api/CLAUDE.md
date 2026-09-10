<!-- BEGIN ROA AI CONFIG: ${plugin_name} -->
## ROA API Test Automation

This repository is configured for the ROA framework via `${enabled_plugin}`
(marketplace `${marketplace_name}`, ref `${marketplace_ref}`).

This block is generated. Put repository-specific guidance outside the markers so
`/roa-base:update` preserves it.

### Workflows

`/${plugin_name}:plan-task` to plan, `/${plugin_name}:implement-task` to build,
`/${plugin_name}:run-tests` to execute the narrowest sufficient scope,
`/${plugin_name}:validate-code` before claiming done, and
`/${plugin_name}:review-change` for an independent pass on anything substantial.
On a failure: `/${plugin_name}:debug` to find the cause, then
`/${plugin_name}:fix-tests` to repair it.

Use `/${plugin_name}:roa-api-architect` when a task needs new API coverage
rather than a change to an existing test.

### Non-negotiables

- **Contract first.** Endpoint paths, methods, parameter locations, status codes
  and schemas come from the authoritative Swagger/OpenAPI source. A `201` on
  create is a common convention, not a fact about this API — check it.
- **Framework truth.** When an `io.cyborgcode.roa.*` signature, annotation,
  overload or option is unclear, load `ai-compass` and read
  `target/pandora/metadata/`. Never guess a ROA API.
- **Project patterns.** Before writing a new Java class, load `ai-teacher` and
  follow the closest approved lesson.
- **The ring, not the client.** API calls go through `quest.use(RING_OF_API)`.
  RestAssured at a call site defeats the abstraction the repository is built on.
- **Assert the outcome.** Status alone is not evidence when the requirement
  depends on the payload or on resulting state.
- **Done means proven.** Compiled is not done. Validation that skipped, weakened
  or disabled a test is not evidence — report exactly what ran and what did not.

### Where things are

- Repository rules: `.claude/rules/` — start at `${plugin_name}.md`
- Repository configuration: `ai-config.yaml` (non-secret values only)
- Deep reference and examples ship inside the installed plugin's `docs/`

Build with `mvn clean compile`; regenerate framework metadata with
`mvn pandora:navigation -U` after changing dependencies or an `Endpoint`.

Refresh this block with `/roa-base:update ${plugin_name} <version-or-ref>`.
<!-- END ROA AI CONFIG: ${plugin_name} -->
