<!-- BEGIN ROA AI CONFIG: ${plugin_name}/contracts -->
# API Contract Rules

- Build requests through the fluent service layer (`quest.use(RING_OF_API)`), never a
  raw HTTP client and never `RestService` inside a test.
- Every call goes through a typed endpoint constant; parameterise with
  `withPathParam` / `withQueryParam` / `withHeader` rather than building URLs.
- Endpoint paths, base URLs, and credentials come from configuration, not literals.
- Model the request and response as types; do not pass untyped maps around.
- JSONPaths live in the project's registry enum; param keys, header keys, ids, and
  expected values live in the constants classes. Use them directly - no local aliases.
- When the contract changes, update the endpoint and the registries first, then the
  tests, then regenerate metadata with `mvn pandora:open -U`.
<!-- END ROA AI CONFIG: ${plugin_name}/contracts -->
