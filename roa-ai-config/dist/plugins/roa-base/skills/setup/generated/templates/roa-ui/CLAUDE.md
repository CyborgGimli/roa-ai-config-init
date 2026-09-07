<!-- BEGIN ROA AI CONFIG: ${plugin_name} -->
## ROA UI Test Automation

This repository is configured for the ROA framework via `${enabled_plugin}`
(marketplace `${marketplace_name}`, ref `${marketplace_ref}`).

- Framework rules: `.claude/rules/${plugin_name}.md`
- Three-layer component rules: `.claude/rules/three-layer.md`
- Repository configuration: `ai-config.yaml` (non-secret values only)

Build with `mvn clean compile`; regenerate framework metadata with
`mvn pandora:navigation -U` before generating page objects or components.
<!-- END ROA AI CONFIG: ${plugin_name} -->
