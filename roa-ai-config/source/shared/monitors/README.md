# Monitors

Background monitors are a Claude Code plugin component. Each entry runs a
long-lived command and delivers every stdout line to Claude as a notification
during the session, so Claude sees events as they arrive instead of polling.

`monitors.json` is an array at the plugin root. Claude Code auto-discovers it at
`monitors/monitors.json`; no `plugin.json` field is required.

| Monitor | Trigger | Purpose |
| --- | --- | --- |
| `app-log` | `on-skill-invoke:debug` | Tails the application log named by `ROA_LOG_FILE` in `ai-config.yaml` so a failing test can be read against what the application actually logged. |

The `when` field controls when a monitor starts. Without it a monitor starts as
soon as the plugin is active, which is rarely what you want for anything
expensive — prefer scoping it to the skill that needs it.

Monitors are an experimental component and the schema may change.
