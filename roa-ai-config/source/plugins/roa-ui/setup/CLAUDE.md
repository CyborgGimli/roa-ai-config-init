<!-- BEGIN ROA AI CONFIG: roa-ui -->

# Project Claude Code Guide

## ROA AI Config — ${plugin_name}

Configured for `${enabled_plugin}` (marketplace `${marketplace_name}`, ref `${marketplace_ref}`). This block is generated — put repository-specific guidance outside the managed markers so updates preserve it.

- **Work through the ROA workflows:** use `/${plugin_name}:plan-test-automation` when planning is needed, `/${plugin_name}:implement-test-automation` for implementation, `/${plugin_name}:run-tests` for targeted execution, `/${plugin_name}:debug-test-automation` or `/${plugin_name}:fix-tests` for failures, `/${plugin_name}:validate-test-automation` before completion, and `/${plugin_name}:review-test-automation` for independent review.
- **UI architecture:** use `/${plugin_name}:architect-ui-tests` when a task requires application investigation, component/element design, synchronization strategy, data insertion, interception, tables, authentication/session handling, or broader UI test-architecture decisions.
- **ROA framework truth:** Before planning, writing, or changing any code that uses an `io.cyborgcode.roa.*` type, invoke the `ai-compass` skill and read the metadata for every ROA type involved — always, even when the repository already contains a similar example. If `target/pandora/metadata/` is missing, regenerate it as the skill describes before continuing. Never guess ROA APIs.
- **Project Java patterns:** Before planning or creating any new Java code, invoke the `ai-teacher` skill and apply the relevant project-approved lessons — always, even when a similar class already exists in the repository. If `target/pandora/ai-teacher/` is missing, follow the skill’s generation-and-fallback steps. Prefer approved lessons and verified repository code over generic patterns.
- **Application truth:** derive selectors, elements, flows, browser state, synchronization, and network behavior from verified application evidence. Inspect the actual application, DOM, DevTools, and network activity through the project MCP tools (`chrome-devtools`, `browser`, `selenium`) when needed — the `roa-ui:ui-application-investigator` agent does this; do not invent UI details or substitute a raw `curl`/`WebFetch` of the page.
- **ROA UI abstractions:** prefer existing ROA components, element enums, typed services, insertion models, table abstractions, interception facilities, and synchronization mechanisms over raw Selenium interactions, duplicated selectors, or arbitrary waits.
- **Test shape and scope:** a new test is named `<subject>_<action>_<expectedOutcome>` (never `testScenario_N`, even beside numbered siblings), carries `@Test`, one suite marker and a one-phrase `@Description`, keeps single-use literals as local variables, and asserts the named outcome in the element that renders it. Implement exactly what the task asks — no extra assertions, constants holders, helpers, or annotations. Details in `.claude/rules/ui-testing.md`.
- **Definition of done:** do not claim completion until the relevant implementation compiles, meaningful validation has been performed, failures are resolved or explicitly reported as blocked, and the applicable ROA definition-of-done criteria are satisfied.
- **Validation integrity:** never skip, weaken, disable, or hide failing tests to obtain a green result. Report exactly what was executed and what remains unvalidated.
- **Rules and references:** persistent repository rules live in `.claude/rules/`; deeper ROA/UI reference material and examples ship with the installed plugin.
- **Repository conventions:** preserve established project structure and reusable abstractions when they are compatible with installed ROA guidance. Do not infer conventions that are not supported by repository or application evidence.
- **Update:** refresh this generated configuration with `/roa-base:update ${plugin_name} <version-or-ref>`.

<!-- END ROA AI CONFIG: roa-ui -->
