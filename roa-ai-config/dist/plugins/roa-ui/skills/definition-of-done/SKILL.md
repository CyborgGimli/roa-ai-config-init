---
name: definition-of-done
description: The completion checklist for an ROA change. Reference before reporting any task as finished.
user-invocable: false
allowed-tools: Read
---

Done means all of the following, not some:

1. **Builds** - `mvn clean compile` succeeds.
2. **Proven** - the relevant tests pass; commands and results reported.
3. **Layered** - the module's architecture respected: no raw driver, HTTP client
   or JDBC in a test, and nothing reaching past the abstraction that owns it.
4. **Clean data** - everything created is removed by a `DataCleaner`, including
   on failure paths.
5. **No secrets** - no credentials, URLs, or environment specifics as literals.
6. **Consistent** - the new code reads like the code around it.
7. **Documented** - if behavior or setup changed, docs were updated.
8. **Reported honestly** - what was done, what was skipped, what is uncertain.
