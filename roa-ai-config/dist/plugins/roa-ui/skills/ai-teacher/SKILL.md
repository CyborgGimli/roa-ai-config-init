---
name: ai-teacher
description: Find curated project-approved Java implementation patterns before creating new Java code. ALWAYS use before planning, writing, or implementing any tests, services, models, DTOs, configuration, utilities, or other Java classes - even when a similar class already exists in the repository.
user-invocable: false
allowed-tools: Read, Glob, Grep, Bash
---

Ground new Java code in the project's curated AI Teacher lessons before implementation.

## Procedure

1. Determine the Java code being created and the closest semantic AI Teacher category.

2. Locate the catalog in this order:

   ```text
   <module-being-modified>/target/pandora/ai-teacher/
   <project-root>/target/pandora/ai-teacher/
   ```

3. If no AI Teacher catalog is available, check the `<plugins>` section of the `pom.xml`. Only when it declares the plugin that provides the `teach` goal, generate the catalog:

   ```bash
   mvn pandora:teach
   ```

   When the pom does not declare it, or generation fails, do not retry and do not stall: say once that the catalog is unavailable, then continue with the baseline below, the repository, and `ai-compass` rather than inventing a project pattern.

   **Baseline when no lesson applies.** These are the patterns to apply whenever the catalog is missing or holds nothing relevant:

   * Choose the template by what the new code handles, not by where it sits: existing code for the same kind of control, contract operation, or query. Take only its form from it — naming, location, constructor, annotations, formatting. Behavior — how state is read, how a control is located or driven, how a request or query is built — comes from `ai-compass` and the verified evidence. A class beside it that handles a different kind of thing is not a template.
   * When implementing an ROA interface, implement every method it declares with the parameter names `ai-compass` shows.
   * Naming, imports, constants, environment values, single-use literals, and scope follow `.claude/rules/roa-engineering.md` and the domain rules beside it.

4. Select the closest semantic category when available:

   ```text
   service
   repository
   controller
   test
   config
   util
   dto
   model
   filter
   event
   ```

   For another kind of Java code, use the closest meaningful category. If none applies, continue without forcing an unrelated lesson.

5. Match lessons primarily by semantic tags and relevance to the code being created.

   Select at most **3** highly relevant lessons.

   Prefer quality in this order:

   ```text
   EXCELLENT
   GOOD
   ```

   Never use a `BAD` lesson as a generation reference. Treat it only as anti-pattern guidance.

6. For every selected lesson:

    * read its referenced `path`;
    * read all available `related` files;
    * understand the surrounding implementation rather than copying an isolated fragment;
    * skip missing referenced files gracefully and continue with the evidence that is available.

7. Apply the selected lessons as project-pattern guidance:

    * follow the structural approach where appropriate;
    * respect the lesson's description and `whenToUse`;
    * reuse similar collaborators when they fit the current task;
    * adapt the pattern to the current requirement;
    * do not copy code mechanically.

8. Prefer directly relevant code already supplied by the user or discovered in the current repository when it is a closer match than a catalog lesson.

9. Use AI Teacher only for project implementation patterns.

   Always use the `ai-compass` skill separately for the exact `io.cyborgcode.roa.*` framework methods, annotations, creation strategies, available options, and usages involved; lessons show style, not the contract.

10. Never add `@AiLesson` to generated code. Lesson curation is human-owned.

## Return

Provide the caller with:

* the selected lesson ids and categories;
* the source and related files inspected;
* the project patterns that materially apply to the implementation;
* any missing catalog, configuration, or source information that could not be verified.

Keep the result focused. Do not load unrelated lessons or turn the catalog into general repository documentation.

