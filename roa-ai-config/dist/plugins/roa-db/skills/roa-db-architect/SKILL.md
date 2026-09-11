---
name: roa-db-architect
description: Design and generate ROA database tests - DbQuery enums with {name} placeholders, result types, and fluent assertions. Use when a task needs new database test coverage rather than a change to an existing test.
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, Task, Skill
---

# ROA DB Architect

Design and generate database tests for:

```text
$ARGUMENTS
```

Invoked as `/roa-db:roa-db-architect <what to cover>`, for example:

- "Verify the user row is created with the right email"
- "Check the order total matches its line items"
- "Cover the cascade delete on account removal"

## Before generating

1. Load `roa-db-task-profile` for the rules and task sequence that apply here.
2. Name the data invariant the test is supposed to prove. A database test that
   only counts rows usually proves nothing worth the maintenance.
3. Establish the real schema — table and column names, types, nullability,
   constraints — from the migrations or the database itself, not from the Java
   field names.
4. Find what already exists. Delegate to the `codebase-investigator` agent when
   the current query enums, result types, and cleaners are not obvious. Extend
   the existing registry rather than adding a parallel one.
5. Load `ai-compass` and read `target/pandora/metadata/` for any ROA signature
   you are about to use — especially `DbQuery` and the assertion targets. Never
   guess a method name.
6. Load `ai-teacher` before writing a new class and follow the closest
   `EXCELLENT` lesson's shape.
7. Deep reference: `${CLAUDE_PLUGIN_ROOT}/docs/db-queries.md`, then
   `db-types.md` and `db-test-basics.md`.

## The query registry

`DbQuery<T extends Enum<T>>` declares a query. Queries live in an enum registry,
never as a string at a call site.

```java
public enum UserQueries implements DbQuery<UserQueries> {

    COUNT_ALL("SELECT COUNT(*) AS total FROM users"),
    GET_BY_ID("SELECT id, username, email FROM users WHERE id = {id}"),
    INSERT_USER("INSERT INTO users (username, email) VALUES ('{username}', '{email}')");

    public static final class Data {
        public static final String GET_BY_ID = "GET_BY_ID";

        private Data() {
        }
    }

    private final String query;

    UserQueries(final String query) {
        this.query = query;
    }

    @Override public String query()         { return query; }
    @Override public UserQueries enumImpl() { return this; }
}
```

Placeholders are `{name}`, filled at runtime with `withParam`. Quote the
placeholder in the SQL for string values and leave it unquoted for numerics:

```java
DbQuery<UserQueries> byId = UserQueries.GET_BY_ID.withParam("id", 42);
```

Never assemble SQL by concatenation, even inside a helper. It is an injection
bug, and it breaks on any value containing a quote — exactly the input a test
should be exercising.

`DbQuery` implementations are on the Pandora regeneration list, so run
`mvn pandora:navigation -U` after changing the enum.

## Validation

Generated code must:

- ✓ Compile — `mvn test-compile` succeeds
- ✓ Pass every value through `withParam`, with no concatenated SQL anywhere
- ✓ Declare explicit column lists rather than `SELECT *`, which couples the test
  to column order
- ✓ Keep SQL in the query enum, never inline in a test method
- ✓ Map results through a mapper that tolerates null and absent columns
- ✓ Create rows uniquely per run so parallel execution and reruns do not collide
- ✓ Register cleanup for every row it creates, and scope any `DELETE`/`UPDATE` to
  those rows
- ✓ Assert the invariant, not merely a non-zero row count
- ✓ End every chain with `.complete()`

Then execute the new tests through `run-tests` against a real database — a
compile does not prove the SQL is valid for the target dialect. Confirm the
change against `roa-db-definition-of-done` with `validate-code` before reporting
it complete.

Deep reference: `${CLAUDE_PLUGIN_ROOT}/docs/` — start at `db-architecture.md`.
