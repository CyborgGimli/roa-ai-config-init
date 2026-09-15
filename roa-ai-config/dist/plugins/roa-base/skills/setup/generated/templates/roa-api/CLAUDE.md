<!-- BEGIN ROA AI CONFIG: roa-api -->

# Project Claude Code Guide

## ROA AI Config — ${plugin_name}

Configured for `${enabled_plugin}` (marketplace `${marketplace_name}`, ref `${marketplace_ref}`). This block is generated — put repository-specific guidance outside the managed markers so updates preserve it.

- **Work through the ROA workflows:** use `/${plugin_name}:plan-test-automation` when planning is needed, `/${plugin_name}:implement-test-automation` for implementation, `/${plugin_name}:run-tests` for targeted execution, `/${plugin_name}:debug-test-automation` or `/${plugin_name}:fix-tests` for failures, `/${plugin_name}:validate-test-automation` before completion, and `/${plugin_name}:review-test-automation` for independent review.
- **API architecture:** use `/${plugin_name}:architect-api-tests` when a task requires API contract investigation, endpoint/model design, or broader test-architecture decisions.
- **ROA framework truth:** Before planning, writing, or changing any code that uses an `io.cyborgcode.roa.*` type, invoke the `ai-compass` skill and read the metadata for every ROA type involved — always, even when the repository already contains a similar example. If `target/pandora/metadata/` is missing, regenerate it as the skill describes before continuing. Never guess ROA APIs.
- **Project Java patterns:** Before planning or creating any new Java code, invoke the `ai-teacher` skill and apply the relevant project-approved lessons — always, even when a similar class already exists in the repository. If `target/pandora/ai-teacher/` is missing, generate it as the skill describes before continuing. Prefer approved lessons and verified repository code over generic patterns.
- **API contract truth:** derive endpoints, payloads, authentication, status expectations, and response behavior from authoritative Swagger/OpenAPI or verified project evidence. Do not invent missing contract details.
- **Definition of done:** do not claim completion until the relevant implementation compiles, meaningful validation has been performed, failures are resolved or explicitly reported as blocked, and the applicable ROA definition-of-done criteria are satisfied.
- **Validation integrity:** never skip, weaken, disable, or hide failing tests to obtain a green result. Report exactly what was executed and what remains unvalidated.
- **Rules and references:** persistent repository rules live in `.claude/rules/`; deeper ROA/API reference material and examples ship with the installed plugin.
- **Repository conventions:** preserve established project structure and reusable abstractions when they are compatible with installed ROA guidance. Do not infer conventions that are not supported by repository evidence.
- **Update:** refresh this generated configuration with `/roa-base:update ${plugin_name} <version-or-ref>`.

<!-- END ROA AI CONFIG: roa-api -->
