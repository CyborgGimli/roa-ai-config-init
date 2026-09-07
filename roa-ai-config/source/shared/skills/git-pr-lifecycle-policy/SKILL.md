---
name: git-pr-lifecycle-policy
description: The rules governing branches, commits, and pull requests in ROA repositories. Reference before any git operation that changes history or remote state.
user-invocable: false
allowed-tools: Read
---

- Commit or push only when asked.
- Never force-push, skip hooks, or bypass signing unless explicitly requested.
  If a hook fails, fix the cause.
- Branch off the default branch; never commit directly to it.
- Keep unrelated changes out of a commit.
- Commit messages and PR descriptions state what changed, why, and how it was
  verified.
- A passing quality gate is required before opening or updating a PR.
- Generated output (`dist/`, `.claude-plugin/marketplace.json`) is never
  hand-edited. Change `source/` and the plugin configs; CI regenerates it.
- Before any destructive git operation, consider the safer alternative and
  prefer it unless told otherwise.
