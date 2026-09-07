# DB — Queries

`DbQuery<T extends Enum<T>>` declares a query. Queries live in an enum registry, never
as a string at a call site.

## Contract

| Method | Purpose |
| --- | --- |
| `query()` | the raw SQL |
| `config()` | the `DatabaseConfiguration` — has a default reading `DbConfigHolder` |
| `enumImpl()` | self type; returns `this` |
| `withParam(name, value)` | returns a parameterised copy |

## Declaration

```java
public enum UserQueries implements DbQuery<UserQueries> {

    COUNT_ALL("SELECT COUNT(*) AS total FROM users"),
    GET_BY_ID("SELECT id, username, email FROM users WHERE id = {id}"),
    INSERT_USER("INSERT INTO users (username, email) VALUES ('{username}', '{email}')");

    public static final class Data {
        public static final String COUNT_ALL = "COUNT_ALL";
        public static final String GET_BY_ID = "GET_BY_ID";

        private Data() {
        }
    }

    private final String query;

    UserQueries(final String query) {
        this.query = query;
    }

    @Override public String query()          { return query; }
    @Override public UserQueries enumImpl()  { return this; }
}
```

## Parameterisation

Placeholders are `{name}`, filled at runtime with `withParam`:

```java
DbQuery<UserQueries> byId = UserQueries.GET_BY_ID.withParam("id", 42);

DbQuery<UserQueries> insert = UserQueries.INSERT_USER
    .withParam("username", "john_doe")
    .withParam("email", "john@example.com");
```

| Placeholder in SQL | `withParam` | Result |
| --- | --- | --- |
| `id = {id}` | `withParam("id", 42)` | `id = 42` |
| `email = '{email}'` | `withParam("email", "a@b.c")` | `email = 'a@b.c'` |

Quote the placeholder in the SQL for string values; leave it unquoted for numerics.

## Rules

- No SQL assembled by concatenation, even in a helper. It is an injection bug and it
  breaks on any value containing a quote — exactly the input a test should exercise.
- Explicit column lists rather than `SELECT *`; `*` couples the test to column order.
- `DbQuery` implementations are on the Pandora regeneration list — run
  `mvn pandora:open -U` after changing the enum.
