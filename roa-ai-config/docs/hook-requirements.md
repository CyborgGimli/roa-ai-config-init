# Claude Code Hook Requirements

What the ROA plugin hooks must satisfy. Written as requirements so a change to a
hook can be checked against them.

## Hook events used

| Event | Matcher | Hook | Purpose |
| --- | --- | --- | --- |
| `SessionStart` | `startup\|resume\|clear` | `check-doc-currency.mjs` | Warn when the project's ROA version has moved away from the one the bundled docs describe |
| `PreToolUse` | `Bash\|PowerShell` | `dangerous-command-guard.mjs` | Block destructive shell commands |
| `PreToolUse` | `Bash\|PowerShell` | `maven-command-guard.mjs` | Block Maven runs that skip tests |
| `PreToolUse` | `Write\|Edit\|MultiEdit\|NotebookEdit` | `generated-artifact-guard.mjs` | Refuse hand edits to generated Pandora output |
| `PostToolUse` | `Write\|Edit\|MultiEdit` | `validate-java-edit.mjs` | Compile the changed modules, and mark the session as having touched Java |
| `Stop` | — | `stop-test-gate.mjs` | Run the suite before the session ends, but only if Java changed |

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

- **F1** — A `Stop` hook MUST check `stop_hook_active` and exit `0` when it is set.
  Without this the hook re-enters itself forever.
- **F2** — A hook MUST exit `0` quickly when the change is irrelevant to it.
  `validate-java-edit` exits before doing any work when no `.java` or `pom.xml`
  file was touched.
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
- **X4** — Bounded runtime: every spawned command carries a timeout, and a timeout
  is treated as "cannot determine", not as failure.
- **X5** — Cheapest check first. `validate-java-edit` runs `compile`, and reaches
  for `test-compile` only when a test source changed; the Stop gate runs the
  tests only after Java was touched.

## Platform notes

- On Windows the Maven entry point is `mvn.cmd` / `mvnw.cmd`, which Node refuses to
  spawn directly (CVE-2024-27980 mitigation). `runCommand` goes through the shell as
  a single command string, quoting only when the command is a path — quoting a bare
  name loses all output.
- `-q` suppresses the compiler and test errors these hooks exist to surface. Run
  without it and filter the output instead.

## Testing a hook

Feed it a payload on stdin and check the exit code:

```bash
printf '{"tool_input":{"command":"mvn install -DskipTests"}}' \
  | node hooks/scripts/maven-command-guard.mjs; echo "exit=$?"
```
