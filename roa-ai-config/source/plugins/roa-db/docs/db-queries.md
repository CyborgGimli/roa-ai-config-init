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

`withParam` is textual substitution, not a bound parameter: `ParametrizedQuery`
replaces `{name}` with `value.toString()` before the SQL is sent. It centralises the
SQL and keeps call sites readable, but it does not escape anything — so quote string
placeholders in the template, keep numerics unquoted, and only ever pass controlled
test data. A value containing a quote breaks the statement exactly as concatenation
would; if a scenario needs such a value, that is a framework limitation to report,
not something to work around with concatenation.

## Rules

- No SQL assembled by concatenation at a call site; it bypasses the registry, so
  nothing tells you what to fix when the schema changes.
- Explicit column lists rather than `SELECT *`; `*` couples the test to column order.
- `DbQuery` implementations are on the Pandora regeneration list — run
  `mvn pandora:navigation -U` after changing the enum.
