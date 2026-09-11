<!-- BEGIN ROA AI CONFIG: ${plugin_name}/queries -->
# Query Rules

- Go through the query abstraction layer; no inline SQL in a test.
- Parameterise every value with `withParam` from controlled test data; it substitutes text, it does not escape.
- No SQL assembled by concatenation at a call site; the query enum is the single place to fix.
- Watch for N+1 access and unbounded result sets in helpers that look cheap.
<!-- END ROA AI CONFIG: ${plugin_name}/queries -->
