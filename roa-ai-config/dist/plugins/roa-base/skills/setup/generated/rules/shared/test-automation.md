<!-- BEGIN ROA AI CONFIG: shared/test-automation -->
# Test Automation Rules

How a test is designed, as distinct from how ROA is used (`engineering.md`) and
what counts as proof it works (`validation.md`).

- Assert the outcome the requirement names. A passing status code, a present
  element, a non-zero row count, or the absence of an exception is not evidence
  when the requirement is about what the system actually did.
- A test that cannot fail is worse than no test, because it reports safety that
  does not exist. Before accepting one, ask what would have to break for it to go
  red — if there is no clear answer, the assertion is wrong.
- Setup prepares prerequisites; it never performs the behaviour under test. A UI
  test whose entity is created over the API and then only checked in the UI has
  stopped testing creation.
- Never make a test pass by weakening an assertion, deleting coverage, disabling
  or skipping the test, or changing a correct expectation. If that is the only
  way to green, the cause has not been found yet.
- Keep tests independently executable. No dependence on execution order, on data
  another test created, or on state left behind by a previous run.
- Create data uniquely per run so reruns and parallel execution do not collide,
  and design the cleanup at the same time as the setup rather than afterwards.
- Cleanup must be safe when the expected state is already missing — a test that
  failed halfway still has to clean up after itself.
- Treat a failing test as evidence to investigate, not as an automation defect by
  default. It may have found a real product bug, which is the system working.
- Keep negative scenarios deliberate. One invalid condition per test, grounded in
  a contract or an explicit requirement, not in an assumption about what the
  application probably rejects.
<!-- END ROA AI CONFIG: shared/test-automation -->
