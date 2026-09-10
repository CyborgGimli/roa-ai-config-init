# AI Teacher Lessons

> The full procedure — catalog discovery, lesson selection, quality ordering —
> lives in the `ai-teacher` skill. This page is the short orientation.

AI Teacher is the curated catalog of code patterns a human engineer on this team
has already approved. It answers *what good looks like here*, which is a
different question from the one Pandora answers.

```text
Pandora      -> what the framework can do        (generated, authoritative)
AI Teacher   -> what this team accepts           (curated by humans)
Repository   -> what already exists              (evidence)
```

Neither substitutes for the other. Pandora will happily tell you a method exists
that this team has decided never to use.

## Generating

```bash
mvn pandora:teach
```

Output lands in:

```text
target/pandora/ai-teacher/
```

The consuming project configures which packages the `ai-teacher-plugin` scans. If
generation fails because that configuration is missing, say so and fall back to
repository evidence rather than inventing a house style.

## What a lesson carries

- The source file the pattern lives in, and related files that give it context.
- A semantic category — `service`, `repository`, `controller`, `test`, `config`,
  `util`, `dto`, `model`, `filter`, `event`.
- Tags, a description, and guidance on when the pattern applies.
- A quality level: `EXCELLENT`, `GOOD`, or `BAD`.

## Using it

1. Identify the kind of class being created and its closest category.
2. Take at most three genuinely relevant lessons. More is noise.
3. Prefer `EXCELLENT` over `GOOD`.
4. Read the referenced source, not just the lesson summary — the pattern is in
   the code, and a fragment without its collaborators is easy to misread.
5. Adapt the pattern to the requirement. Copying it mechanically produces code
   that looks right and does the wrong thing.

A `BAD` lesson is an anti-pattern record. It is there to be recognised and
avoided, never used as a template.

## Precedence

Directly relevant code already in the repository beats a catalog lesson when it
is a closer match — the lesson is a pointer to good practice, not a rule that
overrides working local evidence.

When a lesson and Pandora disagree about a signature, Pandora wins; it is
generated from the framework on the classpath.

## Lessons are human-owned

Never add `@AiLesson` to generated code. Curation is a human judgement about what
this team endorses, and code that nominates itself as exemplary defeats the
purpose of the catalog.
