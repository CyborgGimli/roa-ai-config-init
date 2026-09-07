<!-- BEGIN ROA AI CONFIG: shared/engineering -->
# Engineering Rules

Applies to all ROA test-automation code in this repository. Module-specific rules
sit alongside this file in `.claude/rules/`.

- Reach capabilities only through a ring: `quest.use(RING_OF_X)`. Never instantiate
  a ROA service, and never bypass the ring with a raw driver, HTTP client, or JDBC
  connection.
- End every chain with `.complete()`. Soft assertions flush there; without it they
  are silently discarded.
- Keep environment specifics out of code. URLs, credentials, ports and hostnames
  come from configuration; a literal ties the suite to one machine.
- Every test that creates data removes it through a `DataCleaner`, including when
  the test fails partway.
- Wait on the condition you depend on. `Thread.sleep` is never an acceptable wait;
  where the delay is genuine eventual consistency, use `retryUntil`.
- Match the surrounding code's naming, structure, and comment density. New code
  should be hard to pick out from the code beside it.
- Reuse an existing element, endpoint, query or component before adding a
  near-duplicate.
- Run `mvn pandora:open -U` after changing dependencies, the framework version, or
  any class the metadata is generated from, so `target/pandora/metadata/` reflects
  reality before generating code against it.
<!-- END ROA AI CONFIG: shared/engineering -->
