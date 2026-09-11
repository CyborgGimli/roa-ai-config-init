<!-- BEGIN ROA AI CONFIG: roa-ui -->

# Project Claude Code Guide

## ROA AI Config — ${plugin_name}

Configured for `${enabled_plugin}` (marketplace `${marketplace_name}`, ref `${marketplace_ref}`). This block is generated — put repository-specific guidance outside the managed markers so updates preserve it.

- **Work through the ROA workflows:** use `/${plugin_name}:plan-test-automation` when planning is needed, `/${plugin_name}:implement-test-automation` for implementation, `/${plugin_name}:run-tests` for targeted execution, `/${plugin_name}:debug-test-automation` or `/${plugin_name}:fix-tests` for failures, `/${plugin_name}:validate-test-automation` before completion, and `/${plugin_name}:review-test-automation` for independent review.
- **UI architecture:** use `/${plugin_name}:architect-ui-tests` when a task requires application investigation, component/element design, synchronization strategy, data insertion, interception, tables, authentication/session handling, or broader UI test-architecture decisions.
- **ROA framework truth:** when exact `io.cyborgcode.roa.*` usage, annotations, methods, overloads, lifecycle behavior, component types, or available options are uncertain, inspect Pandora metadata. Never guess ROA APIs.
- **Project Java patterns:** before generating new Java code, consult relevant AI Teacher lessons when available. Prefer verified repository code and approved lessons over generic patterns.
- **Application truth:** derive selectors, elements, flows, browser state, synchronization, and network behavior from verified application evidence. Inspect the actual application, DOM, DevTools, and network activity when needed; do not invent UI details.
- **ROA UI abstractions:** prefer existing ROA components, element enums, typed services, insertion models, table abstractions, interception facilities, and synchronization mechanisms over raw Selenium interactions, duplicated selectors, or arbitrary waits.
- **Definition of done:** do not claim completion until the relevant implementation compiles, meaningful validation has been performed, failures are resolved or explicitly reported as blocked, and the applicable ROA definition-of-done criteria are satisfied.
- **Validation integrity:** never skip, weaken, disable, or hide failing tests to obtain a green result. Report exactly what was executed and what remains unvalidated.
- **Rules and references:** persistent repository rules live in `.claude/rules/`; deeper ROA/UI reference material and examples ship with the installed plugin.
- **Repository conventions:** preserve established project structure and reusable abstractions when they are compatible with installed ROA guidance. Do not infer conventions that are not supported by repository or application evidence.
- **Update:** refresh this generated configuration with `/roa-base:update ${plugin_name} <version-or-ref>`.

<!-- END ROA AI CONFIG: roa-ui -->
