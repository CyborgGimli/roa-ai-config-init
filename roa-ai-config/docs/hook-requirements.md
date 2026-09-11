# Claude Code Hook Requirements

What the ROA plugin hooks must satisfy. Written as requirements so a change to a
hook can be checked against them.

## Hook events used

| Event | Matcher | Hook | Purpose |
| --- | --- | --- | --- |
| `PreToolUse` | `Bash\|PowerShell` | `dangerous-command-guard.mjs` | Block high-confidence destructive shell commands |
| `PreToolUse` | `Bash\|PowerShell` | `maven-command-guard.mjs` | Block Maven runs that skip tests |
| `PreToolUse` | `Write\|Edit\|MultiEdit` | `generated-artifact-guard.mjs` | Refuse hand edits to generated Pandora output |
| `PostToolUse` | `Write\|Edit\|MultiEdit` | `stop-validation-gate.mjs` | Record touched `.java` / `pom.xml` files in session state |
| `Stop` | — | `stop-validation-gate.mjs` | `test-compile` the recorded changes before the session ends; block with the compiler output on failure |

Both shell guards must match `PowerShell` as well as `Bash`. Matching only
`Bash` leaves every PowerShell call ungated on Windows, which is where most of
this team works.

## Exit-code contract

| Exit | Meaning |
| --- | --- |
| `0` | Success, or no decision. The tool call proceeds. |
| `2` | **Blocking feedback.** The message on stderr is shown to the model. |

Exit `1` is *not* the blocking path — it reads as a crashed hook. Always use `2` to
block, with an explanation the model can act on.

## Functional requirements

- **F1** — A `Stop` hook MUST honour `stop_hook_active`: when it is set and no
  relevant file changed since the last failed attempt, exit `0`. Without this the
  hook re-enters itself forever.
- **F2** — A hook MUST exit `0` quickly when the change is irrelevant to it.
  `stop-validation-gate` records nothing when no `.java` or `pom.xml` file was
  touched, and its `Stop` branch returns immediately when the state is empty.
- **F3** — A hook MUST fail safe. If its own logic throws, or the payload cannot be
  parsed, it exits `0` rather than blocking ordinary work.
- **F4** — A hook MUST NOT push, deploy, alter migrations, change secrets, or touch
  a real environment. Hooks run unattended and frequently.
- **F5** — A blocking message MUST say what was blocked and what to do instead.
  "Blocked" with no reason trains people to disable the hook.

## Cross-cutting requirements

- **X1** — Deterministic: the same input produces the same verdict.
- **X2** — Side-effect bounded: a hook may read the repo and run the project's own
  build; it may not mutate source.
- **X3** — Concurrency safe: two `PostToolUse` handlers can overlap. Maven work is
  serialised through `withWorkspaceLock`, which reclaims a stale lock rather than
  deadlocking.
- **X4** — Bounded runtime: every spawned command carries a timeout. The Stop gate
  reports a timeout explicitly ("timed out while running …") and blocks, so a hung
  Maven run is never mistaken for a passing one.
- **X5** — Cheapest check first. The Stop gate runs `test-compile` once per
  reactor (or per touched module when the session runs below the reactor root),
  and only after Java or a POM was touched. Test execution stays with the
  `run-tests` / `validate-test-automation` workflows, not with hooks.

## Platform notes

- On Windows the Maven entry point is `mvn.cmd` / `mvnw.cmd`, which Node refuses to
  spawn directly (CVE-2024-27980 mitigation). `runCommand` in `java-hook-utils.mjs`
  switches to `shell: true` for `.cmd`/`.bat` wrappers and for a bare `mvn`, and
  `findMavenCommand` prefers `mvnw.cmd` there.
- The Stop gate runs Maven with `-q`; compiler `[ERROR]` lines still reach stderr
  and are forwarded in the block reason through `formatCommandFailure`.

## Testing a hook

Feed it a payload on stdin and check the exit code:

```bash
printf '{"tool_input":{"command":"mvn install -DskipTests"}}' \
  | node hooks/scripts/maven-command-guard.mjs; echo "exit=$?"
```
