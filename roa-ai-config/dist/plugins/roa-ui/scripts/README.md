# Scripts

Runtime helpers that ship inside every domain plugin and run in the **target**
repository, not in this one. Build-time scripts live in `roa-ai-config/scripts/`
instead.

| Script | Used by | Purpose |
| --- | --- | --- |
| `tail-logs.mjs` | `shared/monitors/monitors.json` | Streams the application log named by `ROA_LOG_FILE` in `ai-config.yaml` while `/debug` is running. |

Anything added here is copied to `<plugin>/scripts/` by every plugin whose
`plugin-config.json` copies the shared scripts directory. A script invoked by a
hook, a monitor, or an LSP config must also be listed in that plugin's
`executable` array, or it will not have the execute bit on Unix.

Node.js built-ins only — plugins are installed without a dependency step.
