<!-- BEGIN ROA AI CONFIG: shared/validation -->
# Validation Rules

Nothing is "done" without evidence.

- A change is complete when `mvn clean compile` succeeds and the relevant tests
  pass. Report the exact command and its result.
- Never claim success without having run something. "Should work" is not a
  result, and it is the single most expensive thing to get wrong.
- If tests fail, say so plainly and include the relevant part of the output -
  not the whole log.
- Classify every failure: **code issue**, **test issue**, **environment issue**,
  **flaky**, or **unknown cause**. A flaky call needs a differing re-run as
  evidence.
- If part of the work was skipped or left incomplete, say which part and why.
- When the build fails before the target test runs, report that, rather than
  reporting the test as failed.
<!-- END ROA AI CONFIG: shared/validation -->
