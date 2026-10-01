<!-- BEGIN ROA AI CONFIG: shared/validation -->

# Validation Rules

- Done means the change compiles and the tests that prove it ran and passed. Compilation alone proves nothing about behavior, and a run that executed zero tests is not evidence.
- Run the narrowest scope that proves the change; a full suite is not needed when a targeted run is enough.
- Report the commands, the executed-test count, the results, and what remains unvalidated. When validation could not run, report the work as BLOCKED, not done.
- Report unrelated or pre-existing failures separately, with the evidence for that classification.

<!-- END ROA AI CONFIG: shared/validation -->
