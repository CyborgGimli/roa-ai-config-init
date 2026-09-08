# Pandora Metadata

> The full contract — JSON schema, options semantics, the regeneration trigger
> list, and the rules — lives in the `ai-compass` skill. This page is the short
> orientation.

Pandora is the generated description of the ROA framework contract. It is the
authority when the correct API is unclear — prefer it over guessing from a method
name.

## Generating

```bash
mvn pandora:navigation -U
```

Older Pandora releases name this goal `pandora:open` and call the options field
`availableOptions` rather than `aiCompassOptions`. If the goal above fails as
unknown, try `mvn pandora:open -U`. The plugin is normally also bound to
`process-classes`, so a plain `mvn compile` refreshes metadata as well.

Output lands in:

```text
target/pandora/metadata/{package}.{Class}.json
```

## What a metadata file contains

- Type information: methods, parameters, fields, annotations.
- `creation` — how an instance is meant to be produced (`BUILDER`, `CONSTRUCTOR`, …).
- `preference` — `PREFER`, `AVOID`, or `FORBID` for a given member.
- Usage examples, with the path of the example file.
- Available options and values, and tags.

`preference` is the field worth reading first. A member marked `AVOID` or `FORBID`
compiles perfectly well and is still wrong; the compiler will not tell you.

## When to regenerate

- After changing dependencies or the ROA framework version.
- After adding or changing `Endpoint`, `DbQuery`, or UI element implementations.
- Whenever generated code fails to compile against an API you expected to exist —
  stale metadata is a common cause.

## How to use it

1. Find the class you are working against.
2. Check `creation` before constructing it.
3. Check `preference` before calling a member.
4. Follow the example path when one is given — a worked example in the repository
   beats an invented call.

If metadata and this documentation disagree, metadata wins: it is generated from
the framework actually on the classpath, while docs can lag a release.
