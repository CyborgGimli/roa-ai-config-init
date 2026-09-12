# ROA Base Plugin

Bootstrap plugin for ROA test automation. It configures a target repository to
use the ROA domain plugins; it ships no test-authoring guidance of its own.

## What is ROA?

**Ring of Automation** — a JUnit 5 test framework built around:

- **Quest** — the per-test execution context, injected as a test parameter
- **Rings** — capability boundaries (`RING_OF_UI`, `RING_OF_API`, `RING_OF_DB`, custom)
- **Fluent chaining** — a test reads as one chain and ends with `.complete()`
- **Storage** — test-scoped state, shared across Rings within one Quest
- **Lifecycle** — `@Journey` (preconditions), `@Craft` (generated data), `@Ripper` (cleanup)

## What this plugin provides

| Skill | Purpose |
| --- | --- |
| `/roa-base:setup <plugin>` | Configure the current repository for `roa-api`, `roa-ui`, or `roa-db` |
| `/roa-base:update <plugin> <version>` | Move an already-configured repository to a newer plugin release |

Both run the same deterministic setup engine, so setup and update cannot drift
apart. The engine owns plugin installation and enablement, `.claude/settings.json`,
the managed `CLAUDE.md` block, the generated files under `.claude/rules/`,
`ai-config.yaml`, and `.mcp.json`.

This plugin also carries the shared hooks — the destructive-command and Maven
guards, the generated-artifact guard, and the Stop-time Java validation gate.
They live here rather than in `roa-api` / `roa-ui` / `roa-db` so that a
repository configured for more than one ROA module runs each guard once, not
once per module.

The `repo-memory-architect` agent runs afterwards on an established repository to
write concise project memory into the managed `CLAUDE.md` block. On an empty or
sparse repository it deliberately writes nothing rather than inventing facts.

## First steps

1. Run `/roa-base:setup roa-api` (or `roa-ui`, or `roa-db`) in the target repository.
2. Run `/reload-plugins --force` so Claude Code picks up the newly enabled plugin.
3. Review the generated `.claude/rules/` files and commit them — they are meant to
   be read and adjusted by the owning team.
4. Fill in `ai-config.yaml`; setup creates it with placeholders on first run.

## Where the knowledge lives

| Source | Answers |
| --- | --- |
| `.claude/rules/` | The always-on rules for this repository |
| The installed plugin's `docs/` | Deep reference for the module you configured |
| `target/pandora/metadata/` | Exact ROA signatures, after `mvn pandora:navigation -U` |
| `target/pandora/ai-teacher/` | This team's approved code patterns, after `mvn pandora:teach` |

Load the `ai-compass` skill for the framework contract and `ai-teacher` for
project patterns rather than reading those directories directly.
