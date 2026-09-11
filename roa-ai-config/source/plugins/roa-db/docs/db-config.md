# DB — Configuration

Connection details never live in code. `DbQuery.config()` reads them from
`DbConfigHolder` by default:

```java
default DatabaseConfiguration config() {
    DbConfig dbConfig = getDbConfig();
    return DatabaseConfiguration.builder()
        .dbType(dbConfig.type())
        .host(dbConfig.host())
        .port(dbConfig.port())
        .database(dbConfig.name())
        .dbUser(dbConfig.username())
        .dbPassword(dbConfig.password())
        .fullConnectionString(dbConfig.fullConnectionString())
        .build();
}
```

Override `config()` on a query only when it must target a different database from
the default.

## Where values come from

Configuration is OWNER-backed. The DB adapter reads `${db.config.file}.properties`
(named in `system.properties`) merged over system properties, so every key can be
overridden with `-Dkey=value`. Never a literal in source.

| Key | Meaning |
| --- | --- |
| `db.default.type` | a constant of your own `DbType` enum — driver and dialect; see `db-types.md` |
| `db.default.host` | host |
| `db.default.port` | port |
| `db.default.name` | database name |
| `db.default.username` | user |
| `db.default.password` | password |
| `db.full.connection.string` | complete JDBC URL |

`db.full.connection.string` wins when set: host, port and name are ignored. Use it
for anything whose URL carries options — an in-memory H2, a TLS-pinned Postgres:

```properties
db.default.type=H2
db.full.connection.string=jdbc:h2:mem:AppDb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false
```

and the discrete keys for a plain external database:

```properties
db.default.type=POSTGRES
db.default.host=localhost
db.default.port=5432
db.default.name=appdb
db.default.username=app
db.default.password=
```

`db.default.type` is resolved reflectively: the string names a constant of the one
enum implementing `DbType` inside `project.packages`. Zero such enums, or a name that
matches no constant, fails at startup rather than at the first query — and with more
than one such enum only the first configured package is searched, so keep the `DbType`
enum in the primary package.

A password in a committed properties file is a leak like any other. Keep it out of
the file and pass it in — `-Ddb.default.password=…` from the CI secret store, since
system properties merge over the file.

Per-environment files (`config-dev`, `config-staging`) are selected by a Maven
profile; the archetype-generated `pom.xml` and `system.properties` define the layout.

## MCP-facing configuration

The database entries an agent may read are declared in the target repo's
`ai-config.yaml` as environment-variable **references**:

```yaml
mcp:
  servers:
    postgresql:
      enabled: true
      databases:
        - name: payments
          dsnEnv: PAYMENTS_POSTGRES_DSN
```

Setup generates one MCP server entry per database. The generated `.mcp.json` holds
`${PAYMENTS_POSTGRES_DSN}` — a reference, never a value. If you can read a password
in `.mcp.json`, something has gone wrong.

Setup refuses to proceed on an inline secret:

```text
setup failed: ai-config.yaml appears to contain inline secrets.
```

## Connection reuse

The framework caches clients and reuses connections. Do not open your own — that
bypasses the pooling and the slow-query detection.
