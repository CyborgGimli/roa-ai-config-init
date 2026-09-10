<!-- BEGIN ROA AI CONFIG: ${plugin_name} -->
## ROA UI Test Automation

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
`/${plugin_name}:fix-tests` to repair it. Use `/${plugin_name}:flaky-triage`
when a test passed on re-run — prove it before calling it flaky.

Use `/${plugin_name}:roa-ui-architect` when a task needs new UI coverage rather
than a change to an existing test.

### Non-negotiables

- **Three layers, always.** Component type, element definition, component
  implementation. A locator in a test is a layering bug, not a shortcut.
- **Application truth.** Locators, component behaviour, readiness conditions and
  network activity come from the rendered application. A guessed selector is a
  defect — it fails intermittently, or passes against the wrong element.
- **Framework truth.** When an `io.cyborgcode.roa.*` signature, annotation,
  component type or option is unclear, load `ai-compass` and read
  `target/pandora/metadata/`. Never guess a ROA API.
- **Project patterns.** Before writing a new Java class, load `ai-teacher` and
  follow the closest approved lesson.
- **Wait on conditions, not clocks.** No `Thread.sleep`, no inflated timeout to
  make a test pass. Readiness is not an assertion.
- **Assert the outcome.** A successful click, a present element, or the absence
  of an exception is not proof the user-facing behaviour worked.
- **Setup must not replace the behaviour under test.** API or DB preparation,
  Journeys, authentication and interception establish prerequisites only.
- **Done means proven.** A UI test that has never executed is not validated —
  locator and timing defects do not appear at compile time.

### Where things are

- Repository rules: `.claude/rules/` — start at `${plugin_name}.md`
- Repository configuration: `ai-config.yaml` (non-secret values only)
- Deep reference and examples ship inside the installed plugin's `docs/`

Build with `mvn clean compile`; regenerate framework metadata with
`mvn pandora:navigation -U` after changing a component type or element enum.

Refresh this block with `/roa-base:update ${plugin_name} <version-or-ref>`.
<!-- END ROA AI CONFIG: ${plugin_name} -->
