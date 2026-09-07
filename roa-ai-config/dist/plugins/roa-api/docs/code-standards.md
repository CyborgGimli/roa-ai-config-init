# ROA Code Standards

**Java 17+.**

Mandatory for all generated and hand-written ROA code. These are the standards the
reviewer agents check against.

## Naming

| Kind | Convention | Example |
| --- | --- | --- |
| Classes, enums | PascalCase | `InputBootstrapImpl` |
| Methods, variables | camelCase | `insertUsername` |
| Constants | UPPER_SNAKE_CASE | `USERNAME_FIELD` |
| Test methods | `action_condition_result` | `login_withValidCredentials_succeeds` |

## Structure

- Methods under 30 lines; at most 4 parameters — use an object beyond that.
- Return early to reduce nesting.
- One public class per file; classes under 300 lines.
- **Class member order**: static constants, instance fields, constructors, public
  methods, protected methods, private methods, nested classes/enums.
- `private` by default; `protected` only when inheritance is intended.

## Variables and expressions

- `final` for anything that does not change; prefer `final` fields set in the constructor.
- `var` when the type is obvious: `var users = new ArrayList<String>()`.
- No single-letter names outside loop counters.
- Extract magic numbers into named constants.
- Never compare to `true`/`false`: `if (isValid)`, `if (!isActive)`.
- `.equals()` for objects, `==` only for primitives and null checks; put the constant
  on the left: `"value".equals(input)`.
- Ternaries only for simple expressions, never nested.
- Always brace `if` / `for` / `while`, even single-line.

## Strings and collections

- Text blocks for multi-line strings; `String.format()` for complex building.
- No string concatenation in loops.
- Interface types: `List<String>`, never `ArrayList<String>`, never a raw `List`.
- `List.of()`, `Map.of()`, `Set.of()` for immutable collections.
- Prefer empty collections over null.

## Null safety and immutability

- Never return `null` from a public method — use `Optional<T>`.
- `Objects.requireNonNull()` for parameters that must not be null.
- Java records for simple data carriers; avoid setters unless mutability is required.
- Return defensive copies of mutable fields.

## Exceptions and resources

- Catch specific exceptions, never bare `Exception`.
- Never an empty catch — log or rethrow, with context in the message.
- Try-with-resources for streams, connections, and files.
- Log through SLF4J.

## Forbidden

These fail review every time:

- Hardcoded credentials or secrets.
- Wildcard imports (`import java.util.*`).
- Raw types (`List` instead of `List<String>`).
- Narrative comments that restate the code.
- Unused code left "for later".
- `Thread.sleep()` in tests — see the waits guidance for what to do instead.
- Empty catch blocks.
- `quest.getDriver()` — never reach into Quest internals.
- `findElement()` instead of `findSmartElement()`.
- `getAttribute()` instead of `getDomAttribute()`.
- `System.out.println` — use SLF4J.

## Comments

Comment the *why*, never the *what*. A comment that repeats the code is noise that
future readers must maintain. Match the comment density of the surrounding file.

## Why these are strict

Test automation code is read far more often than it is written, usually by someone
debugging a failure at an inconvenient moment. Consistency is what makes an
unfamiliar test readable at a glance; every deviation costs someone time later.

## Non-negotiable UI rules

| Rule | Description |
| --- | --- |
| **Smart API only** | `findSmartElement()`, never `findElement()`; `getDomAttribute()`, never `getAttribute()` |
| **Three layers required** | Types + Elements + Implementations — no layer skipped |
| **@ImplementationOfType** | Links an implementation to its type via `Types.Data.CONSTANT` |
| **Hooks for sync only** | Never encode business logic in a `before()` / `after()` hook |
| **Direct validation** | UI components use the direct `validate*` methods, not `Assertion.builder()` — tables are the exception |
