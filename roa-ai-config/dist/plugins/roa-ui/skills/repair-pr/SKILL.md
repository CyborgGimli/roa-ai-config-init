---
name: repair-pr
description: Address review feedback or a failing check on an existing pull request, then re-prove the change.
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, Bash, Edit, Write
---

1. Read the feedback or failing check and restate what is actually being asked.
2. Fix the cause. If you disagree with a comment, say so once with reasoning
   rather than silently ignoring it.
3. Re-run the quality gate and report fresh evidence - old evidence does not
   carry over.
4. Summarize what changed since the last review, comment by comment.
