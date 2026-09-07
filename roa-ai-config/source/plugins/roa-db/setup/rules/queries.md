<!-- BEGIN ROA AI CONFIG: ${plugin_name}/queries -->
# Query Rules

- Go through the query abstraction layer; no inline SQL in a test.
- Parameterise every value. String-concatenated SQL is an injection bug even in tests.
- Keep transactions small and explicitly scoped; never leave one open across a test.
- Watch for N+1 access and unbounded result sets in helpers that look cheap.
<!-- END ROA AI CONFIG: ${plugin_name}/queries -->
