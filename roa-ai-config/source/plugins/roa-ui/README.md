# ROA UI

Claude Code capability plugin for UI test automation projects built with ROA.

ROA UI provides the ROA-specific knowledge, workflows, tooling, and project configuration needed to work effectively in an existing Java UI automation repository.

## What it provides

The plugin includes support for:

- ROA UI architecture and conventions
- application and browser investigation
- component and element modeling
- synchronization strategy
- UI test implementation workflows
- test execution and debugging
- review and definition-of-done checks
- Pandora framework metadata
- AI Teacher project-pattern guidance
- repository and Maven safety guardrails
- Selenium MCP integration
- Puppeteer/browser MCP integration
- Chrome DevTools MCP integration

Shared ROA engineering capabilities are bundled together with the UI-specific functionality so the installed plugin is self-contained.

## Requirements

The target repository should have:

- Claude Code
- Node.js 20 or newer
- Git
- Java 17 or newer
- Maven Wrapper or a globally available Maven installation

The project is expected to use ROA through its Maven configuration.

## Setup

ROA UI is configured through the `roa-base` bootstrap plugin.

From the target UI automation repository, run:

```text
/roa-base:setup roa-ui
```

The setup process installs and enables `roa-ui` at project scope and creates or updates the ROA-managed Claude Code configuration for the repository.

## Files created or updated

Setup may create or update:

```text
CLAUDE.md
.claude/settings.json
.claude/rules/
ai-config.yaml
.mcp.json
```

These files connect the repository with the ROA UI capability and its project-specific configuration.

## Project configuration

`ai-config.yaml` is the human-editable configuration used by ROA setup.

For UI projects, it can contain repository-specific MCP settings and other non-secret values required by the configured browser tooling.

Secrets should not be stored directly in `ai-config.yaml`.

Use environment variables or the authentication mechanism supported by the relevant service.

After changing `ai-config.yaml`, rerun:

```text
/roa-base:setup roa-ui
```

to regenerate the project-level MCP configuration when needed.

## Browser and application tooling

ROA UI includes MCP integrations for browser and application investigation.

The V1 configuration includes:

* Selenium MCP
* Puppeteer/browser MCP
* Chrome DevTools MCP

These integrations allow Claude Code to inspect and interact with the actual application when browser-level evidence is required.

The generated MCP configuration is written to:

```text
.mcp.json
```

## Pandora

ROA can expose machine-readable framework metadata under:

```text
target/pandora/metadata/
```

Metadata can be generated or refreshed with:

```bash
mvn pandora:navigation -U
```

Older Pandora releases name this goal `pandora:open`; the `ai-compass` skill carries the fallback.

Pandora provides exact information about available ROA framework types, methods, creation patterns, options, and usages.

## AI Teacher

Project-specific implementation examples and approved patterns can be generated with:

```bash
mvn pandora:teach
```

Generated lessons are normally available under:

```text
target/pandora/ai-teacher/
```

These lessons provide examples from the actual project that can be used together with the existing repository code and ROA metadata.

## Typical usage

After setup, the plugin can support work such as:

* investigating an existing UI flow
* inspecting DOM and browser behavior
* designing UI test coverage
* modeling ROA UI elements and components
* implementing ROA UI tests
* defining synchronization behavior
* debugging failed or unstable tests
* reviewing existing automation
* validating changes before completion

The existing repository structure and project conventions remain the primary source for project-specific organization.

## Updating

For an already configured repository, use:

```text
/roa-base:update
```

The update workflow refreshes ROA-managed configuration from the installed marketplace version while preserving supported user-owned content.

## Scope

ROA V1 supports one capability plugin per consumer repository.

Use `roa-ui` for UI-focused ROA automation projects and `roa-api` for API-focused ROA automation projects.

