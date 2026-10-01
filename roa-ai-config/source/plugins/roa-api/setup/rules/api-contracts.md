<!-- BEGIN ROA AI CONFIG: roa-api/api-contracts -->

# API Contract Rules

- The configured Swagger/OpenAPI source is the authority for paths, methods, parameters, schemas, authentication, status codes, and error payloads. Read it through the `swagger` MCP server, normally via the `roa-api:api-contract-investigator` agent; when it is unavailable, mark the fact UNVERIFIED.
- Keep parameter names, locations (path, query, header, body), types, and required or optional status exactly as the contract defines them; general REST conventions and repository naming are not evidence.
- Negative expectations — status codes and error bodies — come from the contract or an explicit requirement, never from guessing.
- When the repository and the contract disagree, report the discrepancy instead of silently choosing one.
- Use Swagger/OpenAPI for the application contract and `ai-compass` for the ROA API; one never substitutes for the other.

<!-- END ROA AI CONFIG: roa-api/api-contracts -->
