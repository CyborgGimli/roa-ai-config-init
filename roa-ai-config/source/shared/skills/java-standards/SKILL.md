---
name: java-standards
description: The Java authoring rules for ROA code - naming, structure, null safety, collections, exceptions, and the forbidden list. Load before writing or reviewing any Java in an ROA repository.
user-invocable: false
allowed-tools: Read, Grep, Glob
---

Java 17+. The full reference is `${CLAUDE_PLUGIN_ROOT}/docs/code-standards.md` —
read it when a specific rule is in question. This is what to check on every file
you touch.

## Before writing

1. Open the closest existing file of the same kind and match it. Consistency with
   the neighbour beats consistency with this list.
2. Check whether the thing already exists. A near-duplicate element, endpoint,
   query or helper is the most common review rejection.

## While writing

- `final` for anything that does not change. `var` only where the type is obvious.
- Methods under 30 lines, at most 4 parameters, classes under 300 lines.
- Return early; brace every `if` / `for` / `while`.
- Interface types in signatures (`List<String>`, never `ArrayList<String>`), never
  a raw type.
- Never return `null` from a public method — `Optional<T>`, or an empty collection.
- `Objects.requireNonNull` on parameters that must not be null.
- Records for data carriers; defensive copies of mutable fields.
- Catch specific exceptions with context in the message; try-with-resources for
  anything closeable. Never an empty catch.
- SLF4J for logging. Never `System.out.println`.
- Comment the *why*. A comment restating the code is noise someone must maintain.

## The forbidden list

These fail review every time:

hardcoded credentials · wildcard imports · raw types · unused code kept "for later" ·
empty catch blocks · `Thread.sleep()` in a test · `System.out.println` · reaching
into Quest internals · a chain without `.complete()`

Each module adds its own — read `ui-rules.md`, `api-rules.md` or `db-rules.md` for
the one you are in.

## Before reporting done

Re-read the diff as a reviewer would. Anything you would have to explain in a PR
comment is something to fix now, not defend later.
