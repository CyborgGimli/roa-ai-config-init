---
name: create-documentation
description: Create or update documentation for an ROA change - README, architecture notes, and code-level docs. Use when behavior or setup changed.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

Update documentation for:

```text
$ARGUMENTS
```

1. Determine what the change actually affects, and update only the docs now
   stale or missing.
2. Keep documentation truthful to the code - never invent behavior, commands,
   or diagrams.
3. Prefer updating an existing document over adding a new one.
4. Report which documents were created or updated, and what was intentionally
   left unchanged.

`definition-of-done` treats "documentation updated" as a completion item.
