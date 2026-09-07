<!-- BEGIN ROA AI CONFIG: ${plugin_name} -->
## ROA Database Test Automation

This repository is configured for the ROA framework via `${enabled_plugin}`
(marketplace `${marketplace_name}`, ref `${marketplace_ref}`).

- Framework rules: `.claude/rules/${plugin_name}.md`
- Repository configuration: `ai-config.yaml` (non-secret values only)

Database connections are declared in `ai-config.yaml` as environment-variable
references; the generated `.mcp.json` never contains a DSN.
<!-- END ROA AI CONFIG: ${plugin_name} -->
