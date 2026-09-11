# DB — Test Anti-Patterns

```java
// Inline SQL in a test
final String sql = "SELECT * FROM accounts WHERE id = " + id;

// Committed connection string
final String dsn = "postgres://user:password@host/db";

// Destructive statement against a shared environment
TRUNCATE TABLE accounts;

// Count-only assertion
assertThat(rows).hasSize(1);
```

| Anti-pattern | Why it hurts | Instead |
| --- | --- | --- |
| Concatenated SQL | bypasses the registry; nothing points at what to fix | `withParam("id", id)` |
| Uncontrolled value in `withParam` | it is text substitution — a quote in the value breaks the statement | controlled test data; quoted string placeholders |
| Inline SQL in a test | nothing tells you what to fix when the schema changes | `DbQuery` enum |
| `SELECT *` | couples the test to column order | explicit column list |
| Count-only assertion | satisfied by the wrong row | assert the values too |
| Fixed fixture id | collides when runs overlap; looks like a product bug | generate per run |
| No matching cleaner | the suite degrades run by run | `@Ripper` for every creator |
| Cleanup only on success | leaves rows exactly when debugging | `@Ripper` runs on failure too |
| `TRUNCATE` on shared | destroys other people's work | H2 in-memory or a disposable instance |
| Own JDBC connection | bypasses client caching and slow-query logging | the ring |
| Committed DSN | a leak | `dsnEnv` reference in `ai-config.yaml` |

## Performance traps

```java
// N+1 inside a helper that reads as one call
for (final UUID id : ids) {
    load(SELECT_ACCOUNT_BY_ID.withParam("id", id));
}
```

Also watch for unbounded queries in setup — fast on an empty database, slow in
proportion to how long the environment has been alive.

## During debugging

Do not run destructive or data-mutating statements against a shared environment to
"check something". Reproduce against a local or disposable database — see
`db-types.md` for the H2 setup.
