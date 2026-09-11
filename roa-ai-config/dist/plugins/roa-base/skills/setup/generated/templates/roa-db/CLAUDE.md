<!-- BEGIN ROA AI CONFIG: ${plugin_name} -->
## ROA Database Test Automation

This repository is configured for the ROA framework via `${enabled_plugin}`
(marketplace `${marketplace_name}`, ref `${marketplace_ref}`).

This block is generated. Put repository-specific guidance outside the markers so
`/roa-base:update` preserves it.

### Workflows

`/${plugin_name}:plan-test-automation` to plan, `/${plugin_name}:implement-test-automation` to build,
`/${plugin_name}:run-tests` to execute the narrowest sufficient scope,
`/${plugin_name}:validate-test-automation` before claiming done, and
`/${plugin_name}:review-test-automation` for an independent pass on anything substantial.
On a failure: `/${plugin_name}:debug-test-automation` to find the cause, then
`/${plugin_name}:fix-tests` to repair it.

Use `/${plugin_name}:roa-db-architect` when a task needs new database coverage
rather than a change to an existing test.

### Non-negotiables

- **Every value through `withParam`.** SQL is never assembled by concatenation at
  a call site. `withParam` is text substitution, not a bound parameter, so only
  controlled test data goes in and string placeholders are quoted in the template.
- **SQL lives in the `DbQuery` enum.** Never inline at a call site. Explicit column
  lists, never `SELECT *`.
- **Framework truth.** When an `io.cyborgcode.roa.*` signature, annotation or
  option is unclear, load `ai-compass` and read `target/pandora/metadata/`.
  Never guess a ROA API.
- **Project patterns.** Before writing a new Java class, load `ai-teacher` and
  follow the closest approved lesson.
- **Own your rows.** Create them uniquely per run so reruns and parallel
  execution do not collide, and register cleanup for every one.
- **Destructive statements only in a cleaner.** `DELETE`, `TRUNCATE`, `DROP` and
  unqualified `UPDATE` belong in a registered `DataCleaner`, scoped to rows this
  test created.
- **Assert the invariant.** A non-zero row count is not evidence when the
  requirement concerns what is in those rows.
- **Done means proven.** A compile does not prove the SQL is valid for the target
  dialect — the tests have to run against a real database.

### Where things are

- Repository rules: `.claude/rules/` — start at `${plugin_name}.md`
- Repository configuration: `ai-config.yaml` (non-secret values only)
- Deep reference and examples ship inside the installed plugin's `docs/`

Build with `mvn clean compile`; regenerate framework metadata with
`mvn pandora:navigation -U` after changing a `DbQuery` enum.

Refresh this block with `/roa-base:update ${plugin_name} <version-or-ref>`.
<!-- END ROA AI CONFIG: ${plugin_name} -->
