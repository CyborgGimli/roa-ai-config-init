<!-- BEGIN ROA AI CONFIG: roa-api/api-architecture -->

# API Architecture Rules

- Access application APIs through the established ROA API Ring and project abstractions.
- Reuse existing typed endpoints, models, services, authentication, lifecycle components, and configuration before creating new ones.
- Keep application contract details represented through established project abstractions rather than scattering raw paths, parameters, headers, JSONPaths, or payload structures through tests.
- Do not bypass the ROA API capability with direct Rest Assured, HTTP clients, or equivalent lower-level request code unless the required behavior cannot be supported through the established architecture.
- Keep API interaction, reusable domain behavior, lifecycle setup, test data, and cleanup in their appropriate architectural responsibilities.
- Introduce reusable API services only when they represent meaningful domain behavior or orchestration; avoid trivial wrappers around individual framework calls.
- Supporting API operations may prepare prerequisites or perform independent verification, but must not replace the behavior the test is intended to prove.
- Use Swagger/OpenAPI for application contract truth and the `ai-compass` skill for exact ROA framework usage; do not guess either.

<!-- END ROA AI CONFIG: roa-api/api-architecture -->
