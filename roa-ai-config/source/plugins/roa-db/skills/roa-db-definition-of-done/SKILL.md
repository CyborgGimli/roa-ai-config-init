---
name: roa-db-definition-of-done
description: The concrete Database Definition of Done - the completion checklist for a Database change in an ROA repository. Consumed by definition-of-done.
user-invocable: false
allowed-tools: Read, Grep, Glob
---

The concrete Database DoD behind the generic `definition-of-done` contract.
A change is done only when every item is met **and demonstrated**:

1. **Builds** - `mvn clean compile` succeeds.
2. **Proven** - `roa-db-quality-gate` returns PASS, with commands and results shown.
3. **Layered** - the rules in `.claude/rules/queries.md`, `.claude/rules/test-data.md`, `.claude/rules/testing.md` hold.
4. **Clean data** - everything created is removed by a `DataCleaner`, failure paths included.
5. **No secrets** - no credentials, URLs, or environment specifics as literals.
6. **Consistent** - the new code reads like the code around it.
7. **Documented** - docs updated when behaviour or setup changed.
8. **Reported honestly** - what was done, what was skipped, what is uncertain.

Report the DoD as a checklist with each item marked met / not met and its evidence.
