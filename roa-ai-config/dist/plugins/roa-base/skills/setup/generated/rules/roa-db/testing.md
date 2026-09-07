<!-- BEGIN ROA AI CONFIG: ${plugin_name}/testing -->
# Database Testing Rules

- Assert against the result set, not the row count alone.
- Verify the invariant the schema is supposed to enforce, not just the happy path.
- A migration change needs a test that would fail without it.
<!-- END ROA AI CONFIG: ${plugin_name}/testing -->
