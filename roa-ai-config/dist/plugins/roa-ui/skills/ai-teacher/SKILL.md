---
name: ai-teacher
description: Find curated project-approved Java implementation patterns before creating new Java code. Use when writing or implementing tests, services, models, DTOs, configuration, utilities, or other Java classes.
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

3. If no AI Teacher catalog is available, generate it with:

   ```bash
   mvn pandora:teach
   ```

   The consuming project must configure the `ai-teacher-plugin` packages to scan.

   If generation fails because the required configuration is missing, report the missing configuration and continue using the repository, ROA documentation, and Pandora rather than inventing a project pattern.

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

   Use the `ai-compass` skill separately when exact `io.cyborgcode.roa.*` framework methods, annotations, creation strategies, available options, or usages need verification.

10. Never add `@AiLesson` to generated code. Lesson curation is human-owned.

## Return

Provide the caller with:

* the selected lesson ids and categories;
* the source and related files inspected;
* the project patterns that materially apply to the implementation;
* any missing catalog, configuration, or source information that could not be verified.

Keep the result focused. Do not load unrelated lessons or turn the catalog into general repository documentation.

