<!-- BEGIN ROA AI CONFIG: roa-api/api-contracts -->

# API Contract Rules

- Treat the configured Swagger/OpenAPI source as the authority for application API contract details.
- Never guess endpoint paths, HTTP methods, parameters, schemas, authentication requirements, status codes, headers, or response structures.
- Preserve exact contract-defined parameter names, locations, types, required/optional semantics, and constrained values.
- Base endpoint definitions and request/response models on the actual contract rather than repository naming or general REST conventions.
- Reuse existing project representations only when they still match the current contract.
- If the repository and Swagger/OpenAPI disagree, investigate and report the discrepancy instead of silently choosing one.
- Negative-test expectations must come from the contract or another explicit requirement source; do not invent error codes or payloads.
- Keep application-contract discovery separate from ROA framework discovery: use Swagger/OpenAPI for the application contract and Pandora for exact ROA framework usage.

<!-- END ROA AI CONFIG: roa-api/api-contracts -->
