---
name: ai-compass
description: Authoritative generated metadata for ROA framework classes - signatures, parameter order, allowed option values, and worked usages. Load before writing or debugging any code that imports io.cyborgcode.roa, and whenever a framework contract is unclear or something does not compile.
user-invocable: false
allowed-tools: Read, Grep, Glob, Bash
---

Metadata for every `io.cyborgcode.roa.*` class is generated into
`target/pandora/metadata/`, one JSON file per class, named by fully-qualified name:

```text
target/pandora/metadata/io.cyborgcode.roa.ui.components.input.Input.json
```

**If `target/pandora/metadata/` does not exist, this skill does not apply** — see
"When metadata is unavailable" below rather than inventing an answer from the
structure described here.

For token efficiency, open only the files for the classes you are actually using.
When you do open one, **read the whole file** — the method you need is often below
the part that looked relevant, and overloads are easy to miss by skimming.

**Use this as the source of truth.** Any time you are unsure how a ROA class works,
read its metadata file. If code using a ROA class does not compile, read its
metadata file before guessing at a fix.

## Two tiers: contract and usage

Metadata comes in two layers, and they answer different questions.

| Tier | Location | Answers |
| --- | --- | --- |
| **Contract** | `target/pandora/metadata/<fqcn>.json` | what exists — signatures, parameter order, valid options |
| **Usage** | the path in `exampleFilesPath` | what it looks like in working code |

Each metadata entry's `exampleFilesPath` points at a usage catalogue, typically
`docs/usage/roa/*.json` in the repository — for example `general-usage.json` for the
core framework and `api-usage.json` / `ui-usage.json` for a module. Glob the
directory rather than assuming a filename; the name recorded in `exampleFilesPath`
has been seen to disagree with the file actually on disk.

A usage catalogue is a list of `items`, each keyed by the same `id` as the metadata
(a class or a full method signature), with a `summary` and one or more `usages`:

```json
{
  "id": "io.cyborgcode.roa.api.service.fluent.RestServiceFluent.request(io.cyborgcode.roa.api.core.Endpoint)",
  "summary": "Execute an API request (no body) and store the Response in quest storage.",
  "usages": [
    { "code": "...", "description": "...", "level": "CORE", "contextHint": "..." }
  ]
}
```

Read the contract tier to get a call right; read the usage tier to get it
*idiomatic*. `contextHint` is the most valuable field — it says when the pattern
applies and, often, what to prefer instead. `level` separates `CORE` (the default
way) from `ADVANCED` (reach for it only when the situation calls for it).

Grep the catalogue by `id` to jump straight to the entry for the signature you are
about to write.

## JSON structure

```json
{
  "type": {
    "id": "io.cyborgcode.roa.api.core.ApiClient",
    "typeKind": "CLASS",
    "description": "Client for making API requests",
    "tags": ["api", "http"],
    "creation": "BUILDER",
    "preference": "PREFER",
    "exampleFilesPath": "docs/usage/roa/api-usage.json",
    "extra": {"category": "core"},
    "fields": [],
    "methods": [],
    "annotations": []
  },
  "usages": []
}
```

### `type`

| Field | Meaning |
| --- | --- |
| `id` | Fully qualified class name |
| `typeKind` | `CLASS`, `INTERFACE`, `ENUM`, `RECORD`, `ANNOTATION`, `EXCEPTION` |
| `description` | What the type does and when to use it |
| `tags` | Categories for filtering, e.g. `["api", "ui", "db"]` |
| `creation` | `CONSTRUCTOR`, `BUILDER`, `STATIC_FACTORY`, `ENUM_CONSTANT`, `SINGLETON`, `PROVIDED`, `AUTO` |
| `preference` | `PREFER` (default choice), `AVOID` (last resort), `FORBID` (never), `AUTO` (no bias) |
| `exampleFilesPath` | Where worked usages for this type live |
| `fields` / `methods` / `annotations` | Member metadata |

`preference` is the field to read first. A member marked `AVOID` or `FORBID`
compiles perfectly well and is still the wrong call — the compiler will not warn you.

### `methods`

Each method carries `id` (the signature), `description`, `tags`, `preference`,
`returnType`, `varArgs`, `exampleFilesPath`, `parameters`, and `annotations`.

The options field appears on a method **only when the declaring type is an
annotation** (`type.typeKind == "ANNOTATION"`).

### `parameters`

Each parameter carries `index` (0-based — pass arguments in this order), `name`,
`type`, `typeKind`, `description`, `creation`, `primitive`, `tags`, the options
field, and `annotations`.

### `fields`

Each field carries `name`, `type`, `typeKind`, `description`, `creation`,
`primitive`, `tags`, the options field, and `annotations`.

## The options field, and Pandora versions

The field naming and the Maven goal changed between Pandora releases. **Read
whichever your project actually emits** — check one metadata file before assuming.

| Pandora | Options field | Regeneration goal |
| --- | --- | --- |
| Current | `aiCompassOptions` | `mvn pandora:navigation -U` |
| Older | `availableOptions` | `mvn pandora:open -U` |

The semantics are identical under either name:

| Value | Meaning |
| --- | --- |
| `null` | No restriction — choose any appropriate value. |
| `[]` | Options exist but none are defined yet. Create the app-level implementation first, then regenerate. |
| `["a", "b"]` | Prefer a value from this list. If the option you need is app-owned and missing, create it, regenerate, then re-open the file. |

If a goal fails as unknown, you are on the other Pandora version — try the other
goal before reporting a problem.

## When to regenerate

```bash
mvn pandora:navigation -U      # older Pandora: mvn pandora:open -U
```

The plugin is normally also bound to `process-classes`, so an ordinary `mvn compile`
refreshes metadata too; run the goal explicitly when you want the `-U` dependency
refresh or the build has not been re-run.

Run it after changing any class that implements:

- `Endpoint` (API) or `DbQuery` (DB)
- `TableElement`
- any `*UiElement`: `AccordionUiElement`, `AlertUiElement`, `ButtonUiElement`,
  `CheckboxUiElement`, `InputUiElement`, `LinkUiElement`, `LoaderUiElement`,
  `ModalUiElement`, `RadioUiElement`, `SelectUiElement`, `TabUiElement`,
  `ToggleUiElement`
- any `*ComponentType`: `AccordionComponentType`, `AlertComponentType`,
  `ButtonComponentType`, `CheckboxComponentType`, `InputComponentType`,
  `ItemListComponentType`, `LinkComponentType`, `LoaderComponentType`,
  `ModalComponentType`, `RadioComponentType`, `SelectComponentType`,
  `TabComponentType`, `TableComponentType`

## When metadata is unavailable

If `target/pandora/metadata/` is empty or missing:

1. Run the regeneration goal — it can take several minutes.
2. If it times out, retry once with a longer timeout.
3. If it still fails, **stop and ask the user** to check that Maven dependencies
   resolve (`mvn dependency:tree`), that `mvn compile` succeeds, and that GitHub
   Packages authentication is configured.

Do not proceed by guessing at signatures.

## Rules

1. Strongly prefer classes that have a metadata file.
2. Strongly prefer methods listed in that file.
3. Read a metadata file in full before using it; do not skim for one method.
4. Pass arguments in the order given by `parameters[].index`.
5. Prefer values from the options field when it is populated.
6. Check the usage catalogue for the correct calling pattern before inventing one.
7. Regenerate after modifying ROA implementations.
8. When two methods share a name, match by `parameters[].type` — never by intuition.
9. Always stop and report if metadata is unavailable.

## Precedence

Metadata is technical reference, not architecture. A module instruction file that
forbids a pattern outranks the fact that the metadata shows it exists — for
example `Assertion.builder()` exists and is still wrong for ordinary UI components,
which use the direct `validate*` methods instead.

Against `ai-teacher`: metadata wins on **signatures**, because it is generated from
the framework on the classpath; the lesson catalog wins on **shape and style**,
because a human curated it. They rarely conflict — when they do, a catalog example
has usually gone stale against an API change.
