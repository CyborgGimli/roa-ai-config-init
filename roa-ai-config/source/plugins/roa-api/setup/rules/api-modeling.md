<!-- BEGIN ROA AI CONFIG: roa-api/api-modeling -->

# API Modeling Rules

- Represent structured API request data with typed project models where appropriate.
- Reuse existing request, response, nested, enum, constant, and JSONPath abstractions before creating new ones.
- Keep models aligned with the authoritative Swagger/OpenAPI schema, including required and optional fields, nested structures, collections, and constrained values.
- Do not add fields, defaults, or model behavior merely to simplify a test when they are not supported by the contract or project conventions.
- Do not create duplicate models for the same contract shape without a justified architectural reason.
- Use typed constants or enums for reusable contract values when the project already follows that convention; avoid repeated magic strings.
- Keep reusable JSONPath expressions centralized according to project conventions and distinguish extraction from actual assertion logic.
- Create response models only when they provide real reuse or domain value; focused JSONPath-based validation may be sufficient for simple responses.
- Before generating new Java models or related classes, use the `ai-teacher` skill for relevant project-approved implementation patterns.
- Use the `ai-compass` skill when exact ROA framework types, serialization behavior, or supported API abstractions must be verified.

<!-- END ROA AI CONFIG: roa-api/api-modeling -->
