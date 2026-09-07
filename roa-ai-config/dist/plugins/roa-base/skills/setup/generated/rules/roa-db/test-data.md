<!-- BEGIN ROA AI CONFIG: ${plugin_name}/test-data -->
# Database Test Data Rules

- Every row a test creates is removed by a `DataCleaner`, including when the test
  fails partway through.
- Test data must be unique per run; do not rely on a fixed id that another run may hold.
- Never run destructive or data-mutating statements against a shared environment.
- Connection strings come from the environment; never commit a DSN.
<!-- END ROA AI CONFIG: ${plugin_name}/test-data -->
