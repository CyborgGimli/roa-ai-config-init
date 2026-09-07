# ROA Quality Gates

The gates every change passes before it is called done, and the evidence format
that proves it.

## The three gates

```bash
mvn clean compile                      # 1. it builds
mvn test -Pe2e -Dtest=YourTestClass    # 2. the change passes
mvn clean install                      # 3. full quality checks pass
```

Prefer the repository's Maven wrapper (`./mvnw`, `mvnw.cmd`) when one exists, so the
gate runs the same Maven the project does.

Regenerate framework metadata when dependencies or the ROA version changed:

```bash
mvn pandora:navigation -U
```

## Evidence format

Every gate report states the exact command, its exit code, and the verdict. A
reviewer (or `/goal`) reads only the transcript, so the transcript has to carry the
proof:

```text
[gate] mvn clean compile              -> exit 0   PASS
[gate] mvn test -Dtest=LoginTests     -> exit 1   FAIL  (2 failures, 0 errors)
[gate] mvn clean install              -> skipped  (not reached; tests failing)
result: FAIL
```

State explicitly:

- every check that ran, with its command and exit code
- every check intentionally skipped, and why
- the failures, summarised — not the whole Maven log

## Result values

| Result | Meaning |
| --- | --- |
| `PASS` | Every applicable check ran and passed. |
| `FAIL` | At least one applicable check failed. |
| `INCONCLUSIVE` | A check could not run (environment, missing dependency). Say which, and what is therefore unverified. |

## Conditional check selection

Do not run every tool unconditionally. Choose from:

- repository config — `pom.xml` plugins and profiles, `ai-config.yaml`, `.claude/rules/`
- the changed files — run only what the change can affect
- CI conventions — mirror what CI actually enforces

## What is never acceptable

- Skipping or disabling tests to make the gate pass. The `maven-command-guard` hook
  blocks `-DskipTests`, `-Dmaven.test.skip`, and `-DskipITs` for exactly this reason.
- Reporting `PASS` without having run something.
- Reporting a green run of tests unrelated to the change as evidence for the change.

## If compilation fails

1. Read the compiler error rather than guessing.
2. Fix imports, types, and missing implementations.
3. Re-check the framework contract in `target/pandora/metadata/`.
4. Regenerate metadata if the contract looks stale.
