# DB — Database Types

`DbType<T extends Enum<T>>` tells the framework which JDBC driver and protocol to use.

## Contract

| Method | Purpose |
| --- | --- |
| `driver()` | the JDBC `Driver` instance |
| `protocol()` | the JDBC protocol string, e.g. `"postgresql"` for `jdbc:postgresql://…` |
| `enumImpl()` | self type; returns `this` |

## PostgreSQL

```java
package com.example.db;

import io.cyborgcode.roa.db.config.DbType;
import org.postgresql.Driver;

public enum MyDbType implements DbType<MyDbType> {

    POSTGRES;

    @Override
    public java.sql.Driver driver() {
        return new Driver();
    }

    @Override
    public String protocol() {
        return "postgresql";
    }

    @Override
    public MyDbType enumImpl() {
        return this;
    }
}
```

## H2 (in-memory)

Same shape with the H2 driver and protocol `"h2"`. Useful for tests that need a real
database but not a shared one — and the right answer when you would otherwise be
tempted to run destructive statements somewhere shared.

## Multiple databases

One enum constant per database:

```java
public enum MyDbType implements DbType<MyDbType> {
    POSTGRES_PRIMARY,
    POSTGRES_REPORTING,
    H2_LOCAL;
    // driver()/protocol() switch on the constant
}
```

Pair this with per-database configuration — see `db-config.md`.
