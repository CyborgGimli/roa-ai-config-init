# AI Teacher Overview

AI Teacher provides curated, project-approved Java implementation patterns for the consuming automation project.

Its purpose is to help Claude generate new Java code that follows patterns already reviewed and accepted for that specific project.

AI Teacher does not describe the ROA framework itself. It complements ROA documentation, Pandora, and repository investigation.

## Mental Model

```text
project Java code
        ↓
human-curated AI lessons
        ↓
AI Teacher catalog
        ↓
target/pandora/ai-teacher/
        ↓
Claude selects only relevant examples
        ↓
new Java code follows approved project patterns
```

AI Teacher should be consulted when Claude is about to create new Java implementation code.

## What AI Teacher Provides

The generated catalog organizes approved project examples into categories such as:

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

Each catalog item can identify:

* the source file containing the example;
* semantic tags;
* quality level;
* a description of the pattern;
* guidance about when the pattern should be used;
* related source files that provide necessary context.

The catalog is an index into real project code rather than a replacement for that code.

## When to Use AI Teacher

Use AI Teacher before generating new Java code, including new:

* tests;
* services;
* models or DTOs;
* configuration classes;
* utilities;
* repositories;
* controllers;
* filters;
* events;
* other Java implementation classes.

If the task only investigates, plans, validates, reviews, or debugs existing code without creating new Java code, AI Teacher does not need to be loaded automatically.

This keeps context focused and avoids unnecessary catalog retrieval.

## Curated Patterns

AI Teacher represents project-approved implementation patterns.

Relevant catalog items should guide:

* class structure;
* responsibilities;
* collaborator usage;
* naming and organization;
* implementation style;
* project conventions.

Use the pattern as guidance and adapt it to the current task.

Do not copy an example mechanically when the requirement or surrounding code differs.

## Quality

AI Teacher lessons have quality levels.

Prefer:

```text
EXCELLENT
    ↓
GOOD
```

Do not use a `BAD` lesson as a generation reference.

A `BAD` lesson may explain an anti-pattern or warning, but it should not become the model for new code.

## Focused Retrieval

AI Teacher is designed for targeted use.

Claude should select only the examples that materially match the Java code being created.

The operational skill limits retrieval to a small number of highly relevant lessons so that project examples improve implementation without flooding the context.

Conceptually:

```text
new Java code is required
        ↓
identify the semantic category
        ↓
select relevant project lessons
        ↓
read their source and related context
        ↓
implement using the approved pattern
```

The detailed selection procedure belongs to the `ai-teacher` skill.

## Existing Code Takes Priority

AI Teacher complements direct repository evidence.

When the current task already provides a directly relevant implementation or the repository contains a closer example, that evidence may be more appropriate than a broader catalog lesson.

Conceptually:

```text
directly relevant current code
→ strongest project-specific evidence

AI Teacher
→ curated patterns for how similar code should be implemented
```

Use both when they materially help.

## AI Teacher and Pandora

AI Teacher and Pandora solve different problems.

```text
Pandora
→ exact ROA framework metadata and usage

AI Teacher
→ curated project-approved Java implementation patterns
```

For example:

```text
Pandora
→ tells Claude which ROA method exists,
  how a type is created,
  which options are available,
  and how the framework type is used

AI Teacher
→ tells Claude how this project normally structures
  the Java code that uses those framework capabilities
```

Pandora should not be replaced by AI Teacher when exact `io.cyborgcode.roa.*` behavior matters.

AI Teacher should not be replaced by Pandora when project implementation style matters.

## Knowledge Model

Use each source for its intended responsibility:

```text
ROA documentation
→ framework concepts and architecture

Pandora
→ exact ROA framework metadata and usage

AI Teacher
→ curated project-approved Java implementation patterns

Existing repository
→ current project structure, abstractions, and conventions
```

Together they provide complementary evidence for implementation decisions.

## Catalog Location

AI Teacher catalogs are generated under:

```text
target/pandora/ai-teacher/
```

The operational `ai-teacher` skill defines how to locate the correct catalog, generate it when necessary, select lessons, and inspect the corresponding source files.

## Human-Owned Lessons

AI Teacher lessons are curated by humans.

Generated implementation code must not add:

```java
@AiLesson
```

That annotation is reserved for human-authored lesson curation and must not be introduced by Claude into newly generated code.

## Core Principles

* Use AI Teacher before creating new Java implementation code.
* Use only lessons relevant to the current task.
* Prefer high-quality curated patterns.
* Never use `BAD` lessons as generation templates.
* Read the real source associated with a selected lesson.
* Adapt patterns to the current requirement rather than copying mechanically.
* Prefer directly relevant existing project code when it provides stronger evidence.
* Use Pandora separately for exact ROA framework behavior.
* Do not add `@AiLesson` to generated code.
* Keep AI Teacher retrieval focused to avoid unnecessary context usage.

## Operational Skill

The detailed procedure for using AI Teacher belongs to the shared:

```text
ai-teacher
```

skill.

This document explains AI Teacher's role in the ROA knowledge model. The skill defines how Claude should perform catalog discovery, lesson selection, source inspection, and generation during an implementation task.
