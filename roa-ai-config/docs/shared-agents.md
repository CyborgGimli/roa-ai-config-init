# Agents

Where agents live and what each one is for. Agent definitions are Markdown files
with frontmatter; the build copies `source/shared/agents/` into every domain plugin
and `source/plugins/<name>/agents/` into that plugin only.

## Shared (`source/shared/agents/`)

Ship into roa-ui, roa-api and roa-db. All are stack-agnostic; module specifics come
from the plugin's hidden profile skills, not from forking an agent.

| Agent | Role | Edits code |
| --- | --- | --- |
| `codebase-investigator` | Find what already exists and where; report `file_path:line` | no |
| `planner` | Short executable plan: affected layers, ordered steps, validation, risks | no |
| `implementation-engineer` | Implement an approved change bottom-up, matching surrounding code | yes |
| `validator` | Run the build and relevant tests; classify every failure | no |
| `test-debugger` | Root-cause a failing or flaky test; classify before concluding | no |
| `adversarial-reviewer` | Attack the change: false positives, flakiness, leaked data, layer violations | no |
| `security-reviewer` | Secrets in code or `ai-config.yaml`, unsafe fixtures, logged credentials | no |
| `researcher` | Sourced answers about framework or dependency behaviour | no |

## Plugin-specific (`source/plugins/<name>/agents/`)

| Plugin | Agent | Role |
| --- | --- | --- |
| roa-base | `repo-memory-architect` | Create or refresh the repository's `CLAUDE.md` memory after setup/update |
| roa-api | `roa-api-contract-investigator` | Establish the authoritative Swagger/OpenAPI contract for the operations a task touches |
| roa-api | `roa-api-contract-reviewer` | Review API tests against the contract they claim to exercise |
| roa-ui | `roa-ui-application-investigator` | Verify DOM, locators, readiness and network facts from the running application |
| roa-ui | `roa-ui-flakiness-reviewer` | Review UI changes for waits, locators and state that will fail intermittently |
| roa-db | `roa-db-data-reviewer` | Review DB changes for unbound SQL, unowned rows and missing cleanup |

## Conventions

- Review and investigation agents never edit; they declare `disallowedTools: Write,
  Edit, NotebookEdit` or a read-only `tools` list.
- Every finding cites `file_path:line`; an unlocated finding is not a finding.
- Framework signatures are verified through the `ai-compass` skill, never inferred
  from a method name.
