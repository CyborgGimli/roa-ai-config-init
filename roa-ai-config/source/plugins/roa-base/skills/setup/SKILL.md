---
name: setup
description: Configure the current target repository to use an ROA Claude Code plugin. Use when the user runs /roa-base:setup with a plugin name, or asks to wire an ROA plugin into this repository.
allowed-tools: Bash(node *skills/setup/scripts/setup.mjs*), Bash(node *skills/setup/scripts/install-prereqs.mjs*), Read, Glob, Grep, Edit, Write, Agent
---

Configure the requested ROA plugin, then create concise Claude Code project memory
when this is an existing repository.

The user arguments are:

```text
$ARGUMENTS
```

## Procedure

1. Determine the requested plugin name from `$ARGUMENTS`. Accept `roa-ui`,
   `roa-api`, `roa-db`, or `type=<plugin-name>`.

2. Check toolchain prerequisites. The check is a deterministic script and changes
   nothing on the machine:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/skills/setup/scripts/install-prereqs.mjs"
   ```

   Act on its exit code:

   - **Exit 0** - all prerequisites present. Continue.
   - **Exit 2** - one or more tools are missing. Installing a JDK or Maven is a
     machine-wide change, so ask the user first (list exactly what is missing).
     Only if they agree, rerun the script with `--install` (winget on Windows,
     Homebrew on macOS). Otherwise, or if that still fails, relay the printed
     MANUAL INSTALLATION block and stop. Never improvise another install method.
   - **Exit 1** - Node.js is missing or too old. Relay the fix and stop; setup
     itself needs Node.js.

   If the script reports that a tool was just installed and PATH changed, tell the
   user to open a new terminal (or restart Claude Code) before continuing.

3. Run this command from the current target repository:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/skills/setup/scripts/setup.mjs" $ARGUMENTS
   ```

   The script reads `${CLAUDE_PLUGIN_ROOT}/skills/setup/generated/setup-registry.json`,
   registers the `roa-ai` marketplace on this machine if it is not registered yet,
   installs or updates the requested plugin at project scope, reads the target repo's
   `ai-config.yaml`, and generates the project `.mcp.json` from bundled ROA MCP
   defaults. If `ai-config.yaml` is missing it writes a starter and stops before
   generating `.mcp.json`.

   The marketplace is resolved from the **user-scope** registry, not from the target
   repo's `extraKnownMarketplaces` — that block only records which ref the repo
   expects. On a machine that has never seen it, the script adds it for you and
   reports `registered marketplace (user scope)`. If that step fails, the error
   carries the command to run by hand:

   ```bash
   claude plugin marketplace add CyborgGimli/roa-ai-config-init
   ```

   Set `ROA_SETUP_NO_MARKETPLACE_ADD=1` to make setup refuse instead of registering
   it, on a machine where that has to be done deliberately.

4. Read the files created or updated by the script:
   - `.claude/settings.json`
   - `.claude/rules/<plugin-name>.md` and the other generated rule files
   - `CLAUDE.md`
   - `ai-config.yaml`
   - `.mcp.json`

5. Decide whether this is an existing repository or an empty/new one.
   - Treat it as **existing** when it has source files, build files, tests, or
     meaningful project docs.
   - Treat it as **new** when it has no meaningful project structure yet.

6. For a **new** repository, stop after the generated template files. Do not invent
   architecture, commands, or module layout.

7. For an **existing** repository, use the `roa-base:repo-memory-architect` agent (launch it with the `Agent` tool, `subagent_type: roa-base:repo-memory-architect`) to update
   the root `CLAUDE.md` and create subdirectory `CLAUDE.md` files where they help.
   - The agent must read the generated plugin settings and rules first.
   - It must write best-practice guidance, not copy bad habits from the repo.
   - It must keep files short.
   - It must preserve user-owned content outside ROA managed blocks.

8. Report the setup summary, any memory files changed by the agent, and tell the
   user to run `/reload-plugins --force` or restart Claude Code.

9. If the script printed a "Trust this workspace" note, pass it on rather than
   dropping it. Claude Code ignores `permissions.allow` until the repository is
   trusted, so until the user opens Claude Code interactively here and accepts
   the trust prompt, they keep being prompted for the very commands setup just
   allowed — and nothing on screen connects the two. Skills, agents, rules and
   hooks are unaffected; only the permission allowlist is withheld.

## Notes

- Set `ROA_SETUP_SKIP_INSTALL=1` to generate all project files without invoking
  the Claude CLI (used by CI and by this repository's own tests).
- Expected problems exit with code `2` and a readable `setup failed: ...` message;
  unexpected programming errors are rethrown rather than swallowed.
- Setup writes project-level files. The only machine-level effects are the ones
  named above: registering the `roa-ai` marketplace at user scope when it is
  missing, and installing a JDK or Maven when the user explicitly agreed. It never
  installs managed settings or changes machine-wide Claude Code policy.
- Fill `security.allowedOrigins` in `ai-config.yaml` with the application under
  test; the browser MCP tools ask before navigating anywhere else.

---

Use `/roa-base:update` to move an already-configured repository to a new version.
