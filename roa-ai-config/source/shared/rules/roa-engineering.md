<!-- BEGIN ROA AI CONFIG: shared/roa-engineering -->

# ROA Engineering Rules

- Prefer the smallest complete change that satisfies the task; follow existing project structure and conventions.
- Reuse existing ROA and project abstractions before creating new services, Rings, models, helpers, lifecycle components, or configuration.
- Treat the Quest as the test execution context and access supported automation capabilities through the appropriate Rings.
- Do not bypass established ROA capabilities with independent clients, drivers, state mechanisms, or lower-level alternatives without a justified requirement.
- When exact `io.cyborgcode.roa.*` behavior, construction, methods, annotations, or available options matter, use the `ai-compass` skill rather than guessing.
- Before creating new Java code, use the `ai-teacher` skill to consult relevant project-approved implementation patterns.
- Preserve established lifecycle, storage, data, authentication, cleanup, and Ring boundaries when modifying automation.
- Keep code cohesive and readable; avoid speculative abstractions, duplicate infrastructure, and unrelated refactoring.
- If repository evidence, Pandora metadata, or required external information is insufficient to implement something correctly, report the missing information instead of inventing it.

<!-- END ROA AI CONFIG: shared/roa-engineering -->
