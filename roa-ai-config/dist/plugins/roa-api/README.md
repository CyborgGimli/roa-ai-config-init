# ROA API

Claude Code capability plugin for API test automation projects built with ROA.

ROA API provides the ROA-specific knowledge, workflows, tooling, and project configuration needed to work effectively in an existing Java API automation repository.

## What it provides

The plugin includes support for:

- ROA API architecture and conventions
- API contract investigation
- endpoint and model design
- request and response validation
- test implementation workflows
- test execution and debugging
- review and definition-of-done checks
- Pandora framework metadata
- AI Teacher project-pattern guidance
- repository and Maven safety guardrails
- Swagger/OpenAPI MCP integration

Shared ROA engineering capabilities are bundled together with the API-specific functionality so the installed plugin is self-contained.

## Requirements

The target repository should have:

- Claude Code
- Node.js 20 or newer
- Git
- Java 17 or newer
- Maven Wrapper or a globally available Maven installation

The project is expected to use ROA through its Maven configuration.

## Setup

ROA API is configured through the `roa-base` bootstrap plugin.

From the target API automation repository, run:

```text
/roa-base:setup roa-api
```

The setup process installs and enables `roa-api` at project scope and creates or updates the ROA-managed Claude Code configuration for the repository.

## Files created or updated

Setup may create or update:

```text
CLAUDE.md
.claude/settings.json
.claude/rules/
ai-config.yaml
.mcp.json
```

These files connect the repository with the ROA API capability and its project-specific configuration.

## Project configuration

`ai-config.yaml` is the human-editable configuration used by ROA setup.

For API projects, it can contain repository-specific values such as:

* API base URL
* Swagger/OpenAPI document URL
* MCP enablement
* environment-variable names used for authentication

Secrets should not be stored directly in `ai-config.yaml`.

Use environment variables or the authentication mechanism supported by the relevant service.

After changing `ai-config.yaml`, rerun:

```text
/roa-base:setup roa-api
```

to regenerate the project-level MCP configuration when needed.

## Swagger/OpenAPI integration

ROA API includes Swagger/OpenAPI MCP support.

This allows Claude Code to inspect the actual API contract associated with the repository rather than relying only on manually provided endpoint information.

The API base URL and API documentation URL are configured per consumer repository through `ai-config.yaml`.

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

* investigating an API contract
* designing new API test coverage
* creating or updating endpoint definitions
* creating request and response models
* implementing ROA API tests
* adding validation
* debugging failed tests
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

Use `roa-api` for API-focused ROA automation projects and `roa-ui` for UI-focused ROA automation projects.

