<!-- BEGIN ROA AI CONFIG: roa-api/api-architecture -->

# API Architecture Rules

- Call application APIs only through `quest.use(RING_OF_API)` and the project's typed endpoints. No raw URLs, Rest Assured, or HTTP clients in tests.
- Keep each contract detail in one place: path and method in the endpoint enum, payload shape in a request model, reusable response paths in the project's JSONPath definitions, contract values in enums or constants. None of them appear as literals in a test.
- Add a domain service only for a multi-request flow several tests reuse; never as a wrapper around a single call.
- Authentication that is setup uses the project's mechanism (`@AuthenticateViaApi` or the configured equivalent); authentication under test is exercised directly.

<!-- END ROA AI CONFIG: roa-api/api-architecture -->
