# Pandora Overview

Pandora is ROA's machine-readable metadata layer.

It gives Claude exact information about the ROA framework types available in the current project without requiring the complete framework API to be permanently documented or loaded into context.

Use ROA documentation to understand framework concepts. Use Pandora when exact ROA framework usage matters.

## Mental Model

```text
ROA libraries
+
project-owned ROA implementations
        ↓
Pandora scan
        ↓
target/pandora/metadata/
        ↓
one JSON metadata file per discovered ROA type
        ↓
Claude reads only the metadata relevant to the task
```

Pandora applies across ROA capabilities, including API, UI, DB, lifecycle, annotations, extension points, and other `io.cyborgcode.roa.*` types.

## What Pandora Provides

A Pandora metadata file describes a specific ROA type and may include:

* fully qualified type identifier;
* type kind;
* description and tags;
* creation strategy;
* usage preference;
* fields;
* methods and parameters;
* annotations;
* available project-specific options;
* embedded usage examples.

The exact metadata depends on the type being described.

## Creation Strategy

Pandora can describe how a value or type is intended to be obtained.

Known creation strategies include:

```text
CONSTRUCTOR
BUILDER
STATIC_FACTORY
ENUM_CONSTANT
SINGLETON
PROVIDED
AUTO
```

Do not assume that a type should be instantiated directly when Pandora specifies another creation strategy.

## Usage Preference

Pandora can indicate which supported alternatives should be preferred or avoided.

Known preference values include:

```text
PREFER
AVOID
FORBID
AUTO
```

Use preference metadata when choosing between otherwise valid ROA approaches.

A technically working solution is not necessarily the preferred ROA solution.

## Available Options

Pandora can expose an options field, `aiCompassOptions`, where ROA expects or supports constrained or project-owned implementations.

Older Pandora releases name the same field `availableOptions` and generate metadata with `mvn pandora:open -U` instead of `mvn pandora:navigation -U`. Read whichever field the project actually emits; the semantics are identical.

Interpret it carefully.

### `aiCompassOptions: null`

No constrained project-specific option list is being provided.

### `aiCompassOptions: []`

Project-owned options are relevant, but no matching implementation was discovered.

A project implementation may need to be created before the capability can be used as intended.

### Populated `aiCompassOptions`

The listed implementations or values were discovered for the current project.

Prefer an appropriate existing option over creating a duplicate implementation.

## Project-Owned Implementations

Pandora can reflect implementations supplied by the consuming ROA project.

Conceptually:

```text
ROA extension point
        ↓
project implementation
        ↓
Pandora scan
        ↓
aiCompassOptions
        ↓
Claude sees what this project actually provides
```

This is important for ROA extension points such as project-defined elements, component types, endpoints, queries, and other supported implementations.

Do not generalize one extension mechanism to another. Inspect the relevant metadata when exact behavior matters.

## Methods and Parameters

Pandora can describe exact methods, overloads, parameters, return types, annotations, preferences, and supported options.

When methods share the same name, identify the correct overload from its parameter types rather than intuition.

Do not invent ROA methods, parameters, annotation attributes, or supported options.

## Usages

Pandora metadata can contain real usage examples for the corresponding ROA type.

These usages help show how the framework type is intended to be used in practice.

Treat them as ROA framework guidance, while still respecting the conventions and abstractions already established by the current project.

## Pandora, Documentation, AI Teacher, and the Repository

These sources have different responsibilities:

```text
ROA documentation
→ explains framework concepts and architecture

Pandora
→ provides exact ROA framework metadata and usage

AI Teacher
→ provides curated project-approved Java implementation patterns

Existing repository
→ shows what the current project already contains and how it is structured
```

Use them together rather than treating any one source as a replacement for the others.

For example:

```text
ROA documentation
→ explains what a Ring is

Pandora
→ explains the exact ROA types, methods, options,
  creation strategies, and usages involved

AI Teacher
→ shows approved project patterns for the Java code being created

Existing repository
→ shows which Rings, services, and conventions
  this project already uses
```

## When to Use Pandora

Use Pandora when exact ROA framework information materially affects the task, especially when:

* using an unfamiliar `io.cyborgcode.roa.*` type;
* determining how a ROA type should be created;
* resolving an overloaded method;
* interpreting a ROA annotation;
* selecting between discovered project implementations;
* understanding `aiCompassOptions`;
* diagnosing compilation errors involving ROA framework usage;
* verifying remembered framework behavior against the installed ROA version.

Do not load Pandora metadata unnecessarily when the repository already demonstrates the exact required pattern and there is no ambiguity.

## Token-Efficient Use

Pandora is designed for targeted lookup.

```text
identify the relevant ROA type
        ↓
open its metadata JSON
        ↓
understand the relevant metadata and embedded usages
        ↓
continue the task
```

Read only the metadata files required by the current task rather than loading the complete metadata directory.

## Operational Usage

The detailed procedure for locating, generating, regenerating, and interpreting Pandora metadata belongs to the shared:

```text
ai-compass
```

skill.

This document explains what Pandora is and how it fits into the ROA knowledge model. The skill defines how Claude should actually use it during a task.

## Core Principles

* Use ROA documentation for concepts and architecture.
* Use Pandora for exact ROA framework metadata and usage.
* Use AI Teacher for curated project-approved Java patterns.
* Use repository inspection for existing project structure and conventions.
* Read only the Pandora metadata relevant to the task.
* Respect creation and preference metadata.
* Interpret `aiCompassOptions` correctly.
* Prefer appropriate discovered project implementations over unnecessary duplication.
* Resolve overloaded methods from actual parameter metadata.
* Use embedded usages as framework evidence.
* Never invent ROA framework behavior when exact metadata is required.
