---
name: update
description: Update an already-configured repository to a specific ROA plugin version. Use when the user runs /roa-base:update with a plugin name and version, or asks to move this repository to a newer ROA plugin release.
allowed-tools: Bash(node *), Read, Glob, Grep, Edit, Write, Task
---

Update the requested ROA plugin in the current target repository and refresh the
generated project files.

The user arguments are:

```text
$ARGUMENTS
```

## Procedure

1. Determine the plugin name and the requested version/ref from `$ARGUMENTS`.
   Accept `roa-ui 1.3.0`, `roa-ui ref=roa-ui--v1.3.0`, or `version=1.3.0`.
   A bare version is normalized to the release convention (`roa-ui--v1.3.0`).
   A version is **required** for update; without one the script exits 2.

2. Before changing files, inspect the current target repo files when present:
   - `CLAUDE.md`
   - `.claude/settings.json`
   - `.claude/rules/<plugin-name>.md`
   - `ai-config.yaml`
   - `.mcp.json`

3. Treat content between `<!-- BEGIN ROA AI CONFIG: <marker> -->` and
   `<!-- END ROA AI CONFIG: <marker> -->` as generated. Treat everything outside
   those markers as user-owned.

4. Run this command from the current target repository:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/skills/setup/scripts/setup.mjs" --update $ARGUMENTS
   ```

5. Read the updated files and verify:
   - the requested marketplace ref is present in `.claude/settings.json`
   - `<plugin-name>@roa-ai` is enabled
   - generated blocks were updated
   - `.mcp.json` reflects `ai-config.yaml` and the plugin's MCP defaults
   - user-owned content outside generated blocks was preserved

6. Use the `repo-memory-architect` agent to refresh root and subdirectory
   `CLAUDE.md` files when the repository has meaningful source and build files.
   The agent must read `.claude/settings.json` and `.claude/rules/<plugin-name>.md`
   first, keep memory concise and best-practice based, and must not copy poor repo
   habits into project guidance.

7. If the user had clearly intentional manual edits inside a generated block, do
   not silently discard them. Move any still-relevant content outside the block
   and say what you moved.

8. Report the changed files and remind the user to run `/reload-plugins --force`
   or restart Claude Code if plugin state does not refresh automatically.

This skill updates project-level files only, installs or updates the requested
plugin at project scope if needed, and explicitly enables it.

---

Use `/roa-base:setup` for a repository that has not been configured yet.
