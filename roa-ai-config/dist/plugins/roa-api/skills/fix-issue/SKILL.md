---
name: fix-issue
description: Work a reported issue end to end - reproduce, locate, fix, and prove. Use when handed a bug report or ticket.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write, Task, Skill
---

1. **Reproduce** - confirm the reported behavior before touching code. If you
   cannot reproduce it, say so and state what you tried.
2. **Locate** - find the responsible code and cite `file_path:line`.
3. **Fix** - the narrowest change that addresses the cause.
4. **Prove** - a test that fails before the fix and passes after it.
5. **Report** - cause, fix, evidence, and any related risk you noticed but did
   not address.
