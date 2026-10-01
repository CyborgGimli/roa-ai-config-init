<!-- BEGIN ROA AI CONFIG: shared/roa-engineering -->

# ROA Engineering Rules

- Before writing code that uses an `io.cyborgcode.roa.*` type, load `ai-compass` and read the metadata for every ROA type involved, even when the repository has a similar example; if `target/pandora/metadata/` is missing, regenerate it as the skill describes. Before creating new Java code, load `ai-teacher`. Never guess an ROA API.
- Pick the template by what the code handles, then copy only its form. First establish from evidence what the new thing is: a UI control's real technology and where it keeps its state, an API operation's contract and authentication, a query's kind and the rows it touches. The template is existing code that handles the same kind of thing; take only its form from it — naming, location, constructor, annotations, formatting. A class that sits next to it but handles a different kind of thing is not a template. When nothing in the repository handles the same kind, follow the `ai-compass` usages and the verified evidence.
- Name a new test method, enum constant, or model the way existing ones of the same kind are named, including their prefix scheme.
- Write simple class names and add the imports the file needs. Never inline a fully qualified name in code, including when the output format cannot carry imports.
- Reference constants instead of repeating them as strings: a name an annotation needs is the constant the project declares for it, imported — never a string literal copy.
- Credentials, URLs, keys, and other environment values come from the project's configuration and test-data classes, never from literals — even when an existing test, a knowledge file, or a document shows the literal.
- A scenario value only one test uses (an input, the message derived from it) stays a local variable there; promote only values several tests share.
- Add nothing the task does not need: no constants holders, helpers, extra assertions, annotations, or refactoring.
- Reuse existing Rings, services, models, and lifecycle components; register a new Ring in the project's Rings class; never bypass ROA with an independent driver, HTTP client, or JDBC connection.
- When evidence or metadata is insufficient, report the gap instead of inventing the missing fact.

<!-- END ROA AI CONFIG: shared/roa-engineering -->
