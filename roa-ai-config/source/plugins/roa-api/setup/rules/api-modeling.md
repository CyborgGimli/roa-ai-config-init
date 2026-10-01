<!-- BEGIN ROA AI CONFIG: roa-api/api-modeling -->

# API Modeling Rules

- Model a request body as a typed request model that mirrors the contract schema: required and optional fields, nesting, collections, and constrained values. Add no field, default, or behavior the contract does not define.
- Reuse an existing model when it matches the same schema; never create a second model for the same shape.
- Add a response model only when several tests read the same structure; a focused check through a JSONPath definition is enough for one field.
- A new endpoint constant follows the naming of its neighbors in the endpoint enum (method and resource); request configuration the project already centralizes, such as shared headers, is reused, not repeated per test.

<!-- END ROA AI CONFIG: roa-api/api-modeling -->
