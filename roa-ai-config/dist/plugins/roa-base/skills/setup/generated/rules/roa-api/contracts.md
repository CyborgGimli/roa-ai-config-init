<!-- BEGIN ROA AI CONFIG: ${plugin_name}/contracts -->
# API Contract Rules

- Build requests through the fluent service layer, never a raw HTTP client in a test.
- Endpoint paths, base URLs, and credentials come from configuration, not literals.
- Model the request and response as types; do not pass untyped maps around.
- When the contract changes, update the service wrapper first, then the tests.
<!-- END ROA AI CONFIG: ${plugin_name}/contracts -->
