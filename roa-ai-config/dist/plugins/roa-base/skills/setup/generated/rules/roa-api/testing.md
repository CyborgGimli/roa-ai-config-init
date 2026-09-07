<!-- BEGIN ROA AI CONFIG: ${plugin_name}/testing -->
# API Testing Rules

- Create data through a `DataCreator`; remove it through a `DataCleaner`, including
  on the failure path.
- Each test sets up the state it needs; no test depends on another having run.
- Prefer one behaviour per test over a long sequence that hides which step failed.
<!-- END ROA AI CONFIG: ${plugin_name}/testing -->
