---
name: roa-pandora-metadata
description: Authoritative metadata for ROA framework classes. Load before writing or debugging any code that imports io.cyborgcode.roa, and whenever a framework contract is unclear or something does not compile.
user-invocable: false
allowed-tools: Read, Grep, Glob, Bash
---

Metadata for every `io.cyborgcode.roa.*` class is generated into
`target/pandora/metadata/`, one JSON file per class, named by fully-qualified name:

```text
target/pandora/metadata/io.cyborgcode.roa.ui.components.input.Input.json
```

For token efficiency, open only the files for the classes you are actually using.

**Use this as the source of truth.** Any time you are unsure how a ROA class works,
read its metadata file. If code using a ROA class does not compile, read its
metadata file before guessing at a fix.

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
    "exampleFilesPath": "examples/api-client",
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
| `exampleFilesPath` | Where worked examples for this type live |
| `fields` / `methods` / `annotations` | Member metadata |

`preference` is the field to read first. A member marked `AVOID` or `FORBID`
compiles perfectly well and is still the wrong call — the compiler will not warn you.

### `methods`

Each method carries `id` (the signature), `description`, `tags`, `preference`,
`returnType`, `varArgs`, `exampleFilesPath`, `parameters`, and `annotations`.

`availableOptions` appears on a method **only when the declaring type is an
annotation** (`type.typeKind == "ANNOTATION"`).

### `parameters`

Each parameter carries `index` (0-based — pass arguments in this order), `name`,
`type`, `typeKind`, `description`, `creation`, `primitive`, `tags`,
`availableOptions`, and `annotations`.

### `usages`

Each entry has `code`, `description`, `level` (`CORE` or `ADVANCED`), and
`contextHint` (when to use that pattern). Check these for the correct calling
shape before writing your own.

## Interpreting `availableOptions`

| Value | Meaning |
| --- | --- |
| `null` | No restriction — choose any appropriate value. |
| `[]` | Options exist but none are defined yet. Create the app-level implementation first, then run `mvn pandora:open -U`. |
| `["a", "b"]` | Prefer a value from this list. If the option you need is app-owned and missing, create it, regenerate, then re-open the file. |

## When to regenerate

```bash
mvn pandora:open -U
```

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

1. Run `mvn pandora:open -U` — it can take several minutes.
2. If it times out, retry once with a longer timeout.
3. If it still fails, **stop and ask the user** to check that Maven dependencies
   resolve (`mvn dependency:tree`), that `mvn compile` succeeds, and that GitHub
   Packages authentication is configured.

Do not proceed by guessing at signatures.

## Rules

1. Strongly prefer classes that have a metadata file.
2. Strongly prefer methods listed in that file.
3. Pass arguments in the order given by `parameters[].index`.
4. Prefer values from `availableOptions` when it is populated.
5. Check `usages` for the correct calling pattern.
6. Regenerate after modifying ROA implementations.
7. When two methods share a name, match by `parameters[].type` — never by intuition.
8. Always stop and report if metadata is unavailable.

## Precedence

Metadata is technical reference, not architecture. A module instruction file that
forbids a pattern outranks the fact that the metadata shows it exists — for
example `Assertion.builder()` exists and is still wrong for ordinary UI components,
which use the direct `validate*` methods instead.
