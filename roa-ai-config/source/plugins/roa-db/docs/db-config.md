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

Configuration is OWNER-backed and resolved from properties, environment variables,
or system properties. Never a literal in source.

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
