# ROA AI Configuration Marketplace

Build system for the Claude Code plugins that support the ROA (Ring of Automation)
test-automation framework.

## Overview

This repository generates and maintains four plugins:

| Plugin | Purpose |
|--------|---------|
| **roa-base** | Bootstrap and hooks: `/roa-base:setup`, `/roa-base:update`, the `repo-memory-architect` agent, and the shared guard and validation hooks. Carries no test-authoring payload. |
| **roa-ui** | UI test automation — application investigation, component/element model, synchronisation, insertion, tables, interception |
| **roa-api** | API test automation — Swagger/OpenAPI contract investigation, typed endpoints and models, request/response validation |
| **roa-db** | Database testing — `DbQuery` enums, `withParam` placeholders, `DataCleaner`-owned cleanup |

## Architecture

### Shared sources (`source/shared/`)

Everything here ships verbatim into each domain plugin (roa-ui, roa-api, roa-db).
A file belongs here only if an API-only or DB-only reader would find it correct and
complete; module-specific material lives in that plugin's own folder.

| Folder | Contents |
| --- | --- |
| `agents/` | `codebase-investigator`, `test-automation-planner`, `implementation-engineer`, `validator`, `test-debugger`, `adversarial-test-reviewer` |
| `skills/` | Stack-agnostic workflows (`plan-test-automation`, `implement-test-automation`, `run-tests`, `debug-test-automation`, `fix-tests`, `validate-test-automation`, `review-test-automation`) and the hidden policy skills (`ai-compass`, `ai-teacher`, `definition-of-done`, `validation-policy`) |
| `docs/` | Framework reference (`roa-core-architecture.md`, `roa-test-lifecycle.md`, `roa-data-and-storage.md`, `roa-custom-services-and-rings.md`, `pandora-overview.md`, `ai-teacher-overview.md`) |
| `rules/` | Always-on repository rules delivered to the target's `.claude/rules/` |
| `hooks/` | `hooks.json` plus the guard and validation scripts, shipped by `roa-base` alone |
| `lsp/`, `scripts/` | The Java LSP declaration and its `jdtls` launcher, shipped by `roa-base` alone |
| `settings/`, `mcp/`, `output-styles/`, `themes/`, `templates/` | Remaining plugin payload and build templates |

### Plugin sources (`source/plugins/<name>/`)

| Item | Purpose |
| --- | --- |
| `plugin-config.json` | Metadata, `copy`/`render`/`mergeHooks` rules, and the `setup` block that drives `/roa-base:setup` |
| `agents/` | Module-specific agents, e.g. `api-contract-investigator`, `api-test-architect`, `ui-application-investigator`, `ui-test-architect`, `roa-db-data-reviewer` |
| `skills/` | `architect-<module>-tests` plus the hidden profile skills the shared workflows apply (`<module>-task-profile`, `<module>-validation-profile`) |
| `docs/` | Module reference chunks |
| `setup/` | The `CLAUDE.md` and `rules.md` managed-block templates, per-module rules, and settings fragment |
| `mcp/` | Module MCP catalog |

### Generated plugins (`dist/plugins/<name>/`)

Each generated plugin is self-contained and laid out at the plugin root:

```text
.claude-plugin/plugin.json   agents/   skills/   docs/   mcp/
output-styles/   themes/   README.md
```

Shared sources are copied into every domain plugin, so installed plugins never
depend on a sibling `shared/` folder. **Hooks and the LSP server are the
exception**: they ship in `roa-base` only. Claude Code runs every enabled plugin's
hooks and registers every plugin's LSP servers, so a repository with both `roa-api`
and `roa-ui` would otherwise fire each guard twice per tool call and register two
`jdtls` servers for `.java`. `roa-base` is installed and enabled as their declared
dependency, so one copy is always present and never more than one.

`roa-base`'s manifest must not point at `hooks/hooks.json`: Claude Code loads that
path by convention and reports a duplicate-hooks error when it is declared again.
`.lsp.json` does need its `lspServers` entry. The generated `.claude-plugin/marketplace.json`
is written to the repository root (one level above this directory).

Rules are **not** plugin payload: they reach the target repository through each
plugin's `setup.rules[]` and land in the target's `.claude/rules/`.

## Building

Requires Node.js 20+.

```bash
npm install
npm run build            # generate dist/plugins and the marketplace manifest
npm run validate         # validate plugin configs and generated output
npm run bump-version -- <patch|minor|major>
```

### What the build does

1. Reads `source/plugins/*/plugin-config.json` and orders plugins by local dependencies.
2. Applies each plugin's `copy`, `render` and `mergeHooks` rules.
3. Renders `.claude-plugin/plugin.json` from the shared templates.
4. Produces the setup registry and generated templates under
   `dist/plugins/roa-base/skills/setup/generated/` (see `docs/setup-registry-contract.md`).
5. Writes the marketplace manifest.

## Dependencies and versioning

`roa-ui`, `roa-api` and `roa-db` declare `"dependencies": ["roa-base"]`; `roa-base`
has none. All plugins share one version and one release tag (`v{version}`), because a
target repository pins a marketplace ref, not a plugin. Details, including
cross-marketplace dependencies, are in `docs/plugin-dependencies.md`.

## Plugins in target projects

1. Add this marketplace to Claude Code.
2. Run `/roa-base:setup <roa-ui|roa-api|roa-db>` in the target repository, then
   `/reload-plugins --force`.
3. Run `/roa-base:update <plugin> <version-or-ref>` to move an existing repository
   forward.

Setup writes the managed `CLAUDE.md` block, `.claude/settings.json`,
`.claude/rules/`, and (when configured) `ai-config.yaml` / `.mcp.json`.

## CI/CD

Workflows live at the repository root in `.github/workflows/`:

- **build-plugins.yml** — on PRs and pushes touching `roa-ai-config/**`: builds,
  validates, reports changes on PRs, and commits regenerated artifacts on `main`.
- **bump-plugin-version.yml** — manual: bumps every plugin version together,
  rebuilds, and commits to `main`.

## Development workflow

1. Edit files under `source/`.
2. `npm run build`, then `npm run validate`.
3. Commit both `source/` and the regenerated `dist/`; never hand-edit `dist/` or
   `.claude-plugin/marketplace.json`.

Maintainer references: `docs/hook-requirements.md`, `docs/plugin-dependencies.md`,
`docs/setup-registry-contract.md`, `docs/shared-agents.md`.

## License

UNLICENSED (private marketplace)
