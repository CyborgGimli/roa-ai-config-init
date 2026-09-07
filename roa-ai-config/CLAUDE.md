# ROA AI Configuration Marketplace

Private Claude Code plugin marketplace for the **ROA** (Ring of Automation) test automation framework.

## Repository Purpose

This repository builds Claude Code plugins that provide AI assistance for writing ROA tests:

- **roa-base** — Setup and update machinery
- **roa-ui** — UI testing with three-layer component architecture
- **roa-api** — API testing with fluent patterns
- **roa-db** — Database testing with query abstractions

**This is a build system**, not a target repository. Don't write tests here.

## Quick Start

```bash
npm install
npm run build      # Generate dist/plugins
npm run validate   # Validate plugins
```

## Using in Target Projects

1. Add this marketplace to Claude Code settings
2. Run `/roa-setup` in a new project
3. Or `/roa-update` to update existing projects

## Structure

- `source/shared/` — Shared agents, skills, instructions, rules
- `source/plugins/` — Plugin definitions
- `dist/plugins/` — Generated plugin packages (self-contained)
- `scripts/` — Build, validate, version bump
- `.github/workflows/` — CI/CD

## Key Architectural Insight

**Each plugin in `dist/` is completely self-contained.** Shared sources are copied into every plugin's output so:
- Plugins don't depend on each other at install time
- Target projects get complete, independent plugins
- Single source of truth in `source/shared/` for maintainability

## For Maintainers

- Edit source files in `source/`
- Run `npm run build` to generate plugins
- Run `npm run validate` to check configs
- Run `npm run bump-version <patch|minor|major>` for releases
- CI automatically commits generated artifacts

## Reference

See `README.md` for detailed architecture and workflows.
