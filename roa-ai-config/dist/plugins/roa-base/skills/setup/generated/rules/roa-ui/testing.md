<!-- BEGIN ROA AI CONFIG: ${plugin_name}/testing -->
# UI Testing Rules

- Assert the outcome a user would observe, not merely that an element exists.
- An assertion that would still pass with the feature removed is not an assertion.
- Create data through a `DataCreator`; remove it through a `DataCleaner`, including
  on the failure path.
- Tests must not depend on data another test created, or on execution order.
<!-- END ROA AI CONFIG: ${plugin_name}/testing -->
