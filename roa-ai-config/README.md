# ROA AI Configuration Marketplace

Build system for Claude Code plugins for the ROA test automation framework.

## Overview

This repository generates and maintains four Claude Code plugins:

| Plugin | Purpose |
|--------|---------|
| **roa-base** | Setup/update machinery, shared agents and skills |
| **roa-ui** | UI testing with three-layer component architecture |
| **roa-api** | REST API testing with fluent patterns |
| **roa-db** | Database testing with query abstractions |

## Architecture

### Shared Sources (`source/shared/`)

**Agents** — Specialist AI agents for different domains:
- `roa-ui-specialist.md` — UI test expert
- `roa-api-specialist.md` — API test expert
- `roa-db-specialist.md` — Database test expert

**Skills** — Utility skills for common tasks
**Instructions** — Framework documentation
**Rules** — Coding standards

All shared sources are copied into every plugin's dist/ output, ensuring each plugin is self-contained.

### Plugin Sources (`source/plugins/`)

Each plugin directory contains:
- `plugin-config.json` — Metadata, dependencies, agents, skills
- `skills/` — Plugin-specific skills
- `agents/` — Plugin-specific agents (references to shared agents)

### Generated Plugins (`dist/plugins/`)

Build process generates each plugin with:
- `.claude/agents/` — Shared agents (copied from `source/shared/agents/`)
- `.claude/skills/` — Plugin skills
- `.claude/instructions/` — Framework documentation
- `.claude/rules/` — Coding standards
- `plugin-config.json` — Plugin metadata

**Key:** Each dist/ plugin is completely self-contained. No inter-plugin dependencies.

## Building

### Prerequisites
- Node.js 18+

### Commands

```bash
npm install              # Install dependencies (currently none)
npm run build            # Generate dist/plugins
npm run validate         # Validate plugin configs
npm run bump-version <type>  # Bump all versions (patch/minor/major)
```

### What Build Does

1. Reads `source/plugins/*/plugin-config.json`
2. Copies shared agents, skills, instructions, rules to each plugin
3. Copies plugin-specific skills
4. Writes each plugin's `.claude-plugin/plugin-config.json`
5. Outputs complete, self-contained plugins to `dist/plugins/`

## Dependencies

Each plugin declares dependencies in `plugin-config.json`:

```json
{
  "dependencies": ["roa-base"]
}
```

Current dependency tree:
- `roa-base` — no dependencies
- `roa-ui` → depends on `roa-base`
- `roa-api` → depends on `roa-base`
- `roa-db` → depends on `roa-base`

Build system validates and orders plugins correctly.

## Plugins in Target Projects

When users install these plugins in a target repository, they get:

**roa-base:**
- Agents: UI Specialist, API Specialist, DB Specialist
- Skills: `/roa-setup`, `/roa-update`
- Shared instructions and rules

**roa-ui:**
- Agent: UI Specialist (shared)
- Skills: `/roa-ui-architect`
- UI-specific instructions
- All shared rules and instructions

**roa-api:**
- Agent: API Specialist (shared)
- Skills: `/roa-api-architect`
- API-specific instructions
- All shared rules and instructions

**roa-db:**
- Agent: DB Specialist (shared)
- Skills: `/roa-db-architect`
- Database-specific instructions
- All shared rules and instructions

All are independent — install any combination.

## CI/CD

### GitHub Actions

**build-plugins.yml** — Triggered on PR and main branch:
1. Runs build and validate
2. Reports changes on PRs
3. Auto-commits artifacts to main after merge

**bump-plugin-version.yml** — Manual workflow:
1. Accepts `patch`, `minor`, or `major` increment
2. Bumps all plugin versions
3. Rebuilds and commits to main

## Versioning

Plugins use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** — Breaking changes to framework patterns
- **MINOR** — New features, backward compatible
- **PATCH** — Bug fixes, documentation

Root package.json version tracks overall marketplace version.

## Development Workflow

1. **Edit sources** — Modify files in `source/`
2. **Build** — `npm run build` generates `dist/plugins/`
3. **Validate** — `npm run validate` checks configs
4. **Commit** — Include both source and generated dist/
5. **CI handles publishing** — Automatic on main branch merge

## For Target Project Users

If setting up or updating an ROA test project:

1. Add this marketplace to Claude Code
2. Run `/roa-setup` for new projects
3. Or `/roa-update` to update existing projects

See individual plugin descriptions for what each provides.

## Contributing

When updating shared sources:

- Edit `source/shared/{agents|skills|instructions|rules}/`
- Run `npm run build` to regenerate plugins
- Commit both source and dist/
- CI publishes changes

Changes flow automatically to all plugins.

## License

UNLICENSED (Private marketplace)
