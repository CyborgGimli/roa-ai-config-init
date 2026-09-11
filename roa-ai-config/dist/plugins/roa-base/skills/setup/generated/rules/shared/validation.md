<!-- BEGIN ROA AI CONFIG: shared/validation -->

# Validation Rules

- "Done" means verified: perform the compilation, tests, and checks that are relevant to the change before claiming completion.
- Prefer the narrowest validation that provides sufficient evidence; do not run expensive full-suite checks when targeted validation is enough.
- When Java automation code changes, confirm that the affected code compiles before reporting success.
- Run relevant tests when execution is required to prove the requested behavior; compilation alone does not prove test correctness.
- Report validation evidence accurately, including commands executed, outcomes, and any remaining gaps or blockers.
- Never report PASS or completion without evidence that supports it.
- Do not make validation pass by skipping tests, weakening assertions, deleting coverage, suppressing failures, or disabling required checks.
- Investigate failures and distinguish automation defects from application, environment, data, contract, configuration, or pre-existing issues.
- Do not treat flaky or unrelated failures as proof that the implemented change is incorrect; report them separately when evidence supports that classification.
- If required validation cannot be performed, report the work as BLOCKED or incomplete rather than assuming it is correct.

<!-- END ROA AI CONFIG: shared/validation -->
