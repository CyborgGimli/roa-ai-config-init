<!-- BEGIN ROA AI CONFIG: ${plugin_name}/assertions -->
# API Assertion Rules

- Assert status **and** payload. A status-only assertion passes for the wrong reasons.
- Assert the fields the behaviour depends on, not the whole body by equality -
  brittle full-body matches fail on unrelated additions.
- Verify error paths explicitly: the status, the error code, and the message shape.
- Never assert on a field the API does not guarantee (ordering, timestamps, ids)
  without normalising it first.
<!-- END ROA AI CONFIG: ${plugin_name}/assertions -->
