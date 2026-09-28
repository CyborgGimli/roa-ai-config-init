# Agents

Where agents live and what each one is for. Agent definitions are Markdown files
with frontmatter; the build copies `source/shared/agents/` into every domain plugin
and `source/plugins/<name>/agents/` into that plugin only.

## Shared (`source/shared/agents/`)

Ship into roa-ui, roa-api and roa-db. All are stack-agnostic; module specifics come
from the plugin's hidden profile skills and its own architect agent, not from forking a shared agent.

| Agent | Role | Edits code |
| --- | --- | --- |
| `codebase-investigator` | Map the task-relevant structure, conventions and reusable abstractions | no |
| `test-automation-planner` | Ordered implementation and validation plan from investigated requirements | no |
| `implementation-engineer` | Implement the approved change using existing abstractions and `ai-teacher` patterns | yes |
| `validator` | Verify the change is complete, correct and backed by execution evidence | no |
| `test-debugger` | Root-cause a failing test; classify automation vs application/environment/data | no |
| `adversarial-test-reviewer` | Attack the change: weak assertions, hidden coupling, false positives | no |

## Plugin-specific (`source/plugins/<name>/agents/`)

| Plugin | Agent | Role |
| --- | --- | --- |
| roa-base | `repo-memory-architect` | Create or refresh the repository's `CLAUDE.md` memory after setup/update |
| roa-api | `api-contract-investigator` | Establish the authoritative Swagger/OpenAPI contract for the operations a task touches |
| roa-api | `api-contract-reviewer` | Review API automation against the contract it claims to exercise |
| roa-api | `api-test-architect` | Design the API automation solution from verified contract and repository facts |
| roa-ui | `ui-application-investigator` | Verify DOM, locators, readiness and network facts from the running application |
| roa-ui | `ui-architecture-reviewer` | Review UI automation for architectural correctness and application fidelity |
| roa-ui | `ui-test-architect` | Design the UI automation solution from verified application and repository facts |
| roa-db | `roa-db-data-reviewer` | Review DB changes for unbound SQL, unowned rows and missing cleanup |

## Conventions

- Review and investigation agents never edit through the file tools: they declare
  either a read-only `tools` list or `disallowedTools: Write, Edit, NotebookEdit`.
  The second form is used by agents that need the project MCP servers (browser,
  DevTools, Swagger), because a subagent only receives MCP tools when it inherits
  the tool set. Both forms keep `Bash`, which can still write; the agent prompt
  restricts it to read-only commands, and the roa-base hooks guard the dangerous
  ones. This is an instruction, not a sandbox.
- Delegation is explicit: workflow skills launch agents with the `Agent` tool and
  a fully qualified `subagent_type` (`<plugin>:<agent>`), rendered at build time
  from the plugin `placeholders`.
- Every agent returns an **Evidence** entry and labels unsourced facts `UNVERIFIED`.
- Every review finding cites `file_path:line`; the review skill drops unlocated findings.
- Framework signatures are verified through the `ai-compass` skill, never inferred
  from a method name.
