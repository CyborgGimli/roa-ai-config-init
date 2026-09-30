<!-- BEGIN ROA AI CONFIG: shared/roa-engineering -->

# ROA Engineering Rules

- Prefer the smallest complete change that satisfies the task; follow existing project structure and conventions.
- Keep a value where it is used: a literal that one method needs stays a local variable there. Do not add constants classes, holder types, helpers, extra assertions, or annotations that the requested change does not need.
- When creating a new class, mirror the closest sibling in the same package family for project form — its structure, member order, helper naming, formatting, and how it declares and references constants — and change only what the new behavior requires. Take framework behavior from `ai-compass` and verified application evidence, not from the sibling: when the sibling's logic (how it reads state, locates or drives a control) contradicts the metadata usages or the new control's verified DOM, follow those.
- Reuse existing ROA and project abstractions before creating new services, Rings, models, helpers, lifecycle components, or configuration.
- Treat the Quest as the test execution context and access supported automation capabilities through the appropriate Rings.
- Do not bypass established ROA capabilities with independent clients, drivers, state mechanisms, or lower-level alternatives without a justified requirement.
- Before planning, writing, or changing any code that uses an `io.cyborgcode.roa.*` type, invoke the `ai-compass` skill and read the metadata for every ROA type involved — always, even when the repository already contains a similar example. If `target/pandora/metadata/` is missing, regenerate it as the skill describes before continuing. Never guess ROA APIs.
- Before planning or creating any new Java code, invoke the `ai-teacher` skill and apply the relevant project-approved lessons — always, even when a similar class already exists in the repository. If `target/pandora/ai-teacher/` is missing, follow the skill’s generation-and-fallback steps.
- Preserve established lifecycle, storage, data, authentication, cleanup, and Ring boundaries when modifying automation.
- Keep code cohesive and readable; avoid speculative abstractions, duplicate infrastructure, and unrelated refactoring.
- If repository evidence, Pandora metadata, or required external information is insufficient to implement something correctly, report the missing information instead of inventing it.

<!-- END ROA AI CONFIG: shared/roa-engineering -->
