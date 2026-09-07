<!-- BEGIN ROA AI CONFIG: shared/git-pr -->
# Git and Pull Request Rules

- Commit or push only when asked; never force-push or skip hooks/signing unless
  explicitly requested.
- Work on a branch off the default branch; keep unrelated changes out of a commit.
- Write clear commit messages and PR descriptions: what changed, why, and how it
  was verified.
- Require a passing quality gate before opening or updating a PR.
- Generated output under `dist/` and `.claude-plugin/marketplace.json` is never
  hand-edited in a PR. Change `source/` and the plugin configs; CI regenerates
  the rest on merge to `main`.
<!-- END ROA AI CONFIG: shared/git-pr -->
