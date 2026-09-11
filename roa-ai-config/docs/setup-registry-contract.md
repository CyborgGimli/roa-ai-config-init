# Generated-asset contract for `setup.mjs`

`setup.mjs` carries no build-time knowledge. Everything it needs is read from
`<skill root>/generated/`, which `scripts/build.mjs` must produce and the build
must copy into `dist/plugins/roa-base/skills/setup/generated/`.

At runtime:

```
SCRIPT_DIR    = .../skills/setup/scripts
SKILL_ROOT    = .../skills/setup
REGISTRY_PATH = .../skills/setup/generated/setup-registry.json
```

**Every path inside the registry is resolved relative to `SKILL_ROOT`**, except
`ruleFile`, `rules[].target` and `extraDirectories`, which are resolved relative
to the **target repository** and are rejected if they escape it.

## `generated/setup-registry.json`

```json
{
  "generatedAt": "2026-09-06T10:00:00.000Z",
  "plugins": {
    "roa-ui": {
      "marketplaceName": "roa-ai",
      "marketplaceRepo": "your-org/roa-ai-config",
      "marketplaceRef": "v0.1.0",
      "enabledPlugin": "roa-ui@roa-ai",
      "pluginVersion": "0.1.0",

      "claudeTemplate": "generated/templates/roa-ui/CLAUDE.md",
      "ruleTemplate": "generated/templates/roa-ui/rules.md",
      "ruleFile": ".claude/rules/roa-ui.md",
      "aiConfigTemplate": "generated/templates/roa-ui/ai-config.yaml",

      "rules": [
        {
          "to": "generated/rules/roa-ui/three-layer.md",
          "target": ".claude/rules/three-layer.md",
          "marker": "roa-ui-three-layer"
        }
      ],

      "settingsFragments": [
        "generated/settings/shared/project-settings.json",
        "generated/settings/roa-ui/settings.json"
      ],

      "mcpTemplates": ["generated/mcp/shared.json"],

      "extraDirectories": [
        "src/test/java",
        "src/test/resources"
      ],

      "templateValues": {
        "plugin_name": "roa-ui",
        "plugin_display_name": "ROA UI Testing",
        "marketplace_name": "roa-ai",
        "marketplace_repo": "your-org/roa-ai-config",
        "marketplace_ref": "v0.1.0",
        "enabled_plugin": "roa-ui@roa-ai"
      },

      "install": { "enabled": true, "scope": "project" }
    }
  }
}
```

### Field reference

| Field | Required | Meaning |
| --- | --- | --- |
| `marketplaceName` | yes | key written under `extraKnownMarketplaces` |
| `marketplaceRepo` | yes | `owner/repo` for the GitHub marketplace source |
| `marketplaceRef` | yes | pinned ref, `v{version}`, identical for every plugin; overridden by `/roa-base:update <version>` |
| `enabledPlugin` | yes | must look like `plugin-name@marketplace-name` |
| `pluginVersion` | no | when set and it differs from the installed version, `claude plugin update` runs |
| `claudeTemplate` | yes | template for the `CLAUDE.md` managed block |
| `ruleTemplate` | yes | template for the plugin's own rule file |
| `ruleFile` | yes | where that rule file lands in the target repo |
| `aiConfigTemplate` | no | starter `ai-config.yaml`; without it no starter is written |
| `rules[]` | no | extra rule files: `{ to, target, marker? }`; `marker` defaults to `target` |
| `settingsFragments[]` | no | JSON fragments merged into `.claude/settings.json`, in order |
| `mcpTemplates[]` | no | MCP catalogs; when empty, `.mcp.json` generation is skipped entirely |
| `extraDirectories[]` | no | directories created in the target repo |
| `templateValues` | no | `${key}` substitutions for every template; the build fills in `plugin_name`, `plugin_display_name`, `marketplace_name`, `marketplace_repo`, `marketplace_ref` and `enabled_plugin` |
| `install.enabled` | no | `false` skips install and reports `skipped plugin install` |
| `install.scope` | no | defaults to `project` |

## Templates — `generated/templates/**`

Plain text with `${key}` placeholders drawn from `templateValues`. **Templates
rendered through `upsertManagedBlock` must contain both markers** or setup fails:

```markdown
<!-- BEGIN ROA AI CONFIG: ${plugin_name} -->
Configured for `${enabled_plugin}` (marketplace `${marketplace_name}`, ref `${marketplace_ref}`).
<!-- END ROA AI CONFIG: ${plugin_name} -->
```

That applies to `claudeTemplate`, `ruleTemplate` and every `rules[].to`.
`aiConfigTemplate` is written whole, so it needs no markers.

## Settings fragments — `generated/settings/**`

Each is a JSON object merged into `.claude/settings.json`:

- objects merge recursively
- arrays append with duplicate removal (`JSON.stringify` identity)
- primitives from later fragments override earlier ones

`extraKnownMarketplaces` and `enabledPlugins` are written by setup itself and do
not belong in a fragment.

## MCP catalogs — `generated/mcp/**`

```json
{
  "servers": {
    "postgresql": {
      "enabledByDefault": true,
      "instancePath": "databases",
      "serverNameTemplate": "postgresql-${name}",
      "required": ["name", "dsnEnv"],
      "config": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-postgres", "${env:dsnEnv}"]
      }
    },
    "sonarqube": {
      "required": ["projectKey", "hostUrl"],
      "envFromConfig": { "SONARQUBE_TOKEN": "${env:tokenEnv}" },
      "config": { "type": "stdio", "command": "npx", "args": ["-y", "sonarqube-mcp"] }
    }
  }
}
```

| Field | Meaning |
| --- | --- |
| `enabledByDefault` | default when neither the server config nor `mcp.defaults` says otherwise |
| `instancePath` | dotted path into the server config that fans one definition out into one entry per item |
| `serverNameTemplate` | rendered, then split on `/`, slugified per segment and rejoined with `-` |
| `required[]` | dotted paths that must be present, else the entry is skipped with a warning |
| `config` | the `.mcp.json` server body, rendered with the merged values |
| `envFromConfig` | extra `env` entries, rendered and dropped when they render empty |

### Placeholder rendering inside `config`

| Form | Result |
| --- | --- |
| `${field}` | value from the merged server config / instance |
| `${field\|csv}` | array joined with `,` |
| `${field\|json}` | `JSON.stringify` of the value |
| `${env:tokenEnv}` | literal `${SONAR_TOKEN}` — the secret is never written to disk |
| `${UPPER_CASE}` | left untouched, so shell-style env refs survive |

A repository can adapt a generic catalog entry without touching the plugin by
adding `overrides:` under its server in `ai-config.yaml`; those are rendered and
deep-merged last.

## Repository-side `ai-config.yaml`

```yaml
logs:
  file: logs/roa.log

mcp:
  defaults:
    timeout: 600000
  servers:
    postgresql:
      enabled: true
      databases:
        - name: app
          dsnEnv: APP_POSTGRES_DSN
```

`logs.file` becomes `env.ROA_LOG_FILE` in `.claude/settings.json`. Keys matching
`password|secret|token|apikey|api_key|privatekey|private_key` are rejected when
they hold an inline value; names ending in `Env` are references and are allowed.
