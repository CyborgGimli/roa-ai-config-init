---
name: roa-db-validation-profile
description: The Database "flavour" for the generic ROA validation workflow - what must be verified in a database change and how failures are classified. Loaded by validate-test-automation and review-test-automation.
user-invocable: false
allowed-tools: Read, Grep, Glob, Bash
---

This hidden skill injects Database specifics into the shared, stack-agnostic
validation workflow so that workflow is not duplicated per stack.

## Verify

1. **Parameterised queries** — every value reaches SQL through `withParam` from
   controlled test data. String concatenation at a call site is a blocker.
   `withParam` substitutes text, so a string placeholder must be quoted in the
   template and the value must not contain a quote.
2. **Query placement** — SQL lives in the `DbQuery` enum, not inline in a test
   method.
3. **Bounded reads** — queries that could scan a whole table are constrained.
   A result-set assertion that silently depends on total row count will break the
   first time someone else adds data.
4. **Result access** — rows come from `QueryResponse.getRows()` or a JSONPath
   extraction; a JSONPath that matches nothing throws, so the path must match the
   selected columns.
5. **No destructive statements outside cleanup** — `DELETE`, `TRUNCATE`, `DROP`,
   and unqualified `UPDATE` belong in a registered `DataCleaner`, scoped to rows
   this test created. An unscoped destructive statement is a blocker.
6. **Row ownership** — rows are created uniquely per run so parallel execution
   and reruns do not collide, and every created row has cleanup registered.
7. **Isolation** — the test does not depend on rows another test created, on
   execution order, or on a database left in a particular state.
8. **Assertion strength** — the test proves the data invariant the requirement
   names. A non-zero row count is not sufficient when the requirement concerns
   the content of those rows. Chains end with `.complete()`.

## Evidence

Compilation is required for any Java change. Run the affected database tests
through `run-tests` against a real database; a compile does not prove a query is
valid SQL for the target dialect.

## Classify failures

Before calling anything an automation defect, separate: automation defect, query
or dialect error, schema or migration drift, application defect, test-data
collision from a previous run, connection or credentials failure, and
pre-existing unrelated failure.

## Result

`PASS`, `FAIL`, or `BLOCKED`, with the commands run, what was verified, and the
smallest remaining change or missing evidence. Never `PASS` on inspection alone.
