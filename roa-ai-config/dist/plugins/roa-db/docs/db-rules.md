# DB — Non-Negotiable Rules

| Rule | Why |
| --- | --- |
| **ROA ring only** | `quest.use(RING_OF_DB)` — no hand-rolled JDBC in a test |
| **Typed queries only** | all SQL lives in a `DbQuery` enum, never at a call site |
| **Parameterise everything** | `withParam`, never concatenation — injection, and it breaks on quotes |
| **No committed connection strings** | credentials come from config/env |
| **Explicit columns** | `SELECT *` couples the test to column order |
| **Every creator has a cleaner** | `@Ripper` runs on the failure path, which is the case that matters |
| **Unique data per run** | a fixed id collides when two runs overlap, and looks like a product bug |
| **Never destructive on shared** | reproduce against a local or disposable database |
| **Always `complete()`** | soft assertions flush there |

## Common mistakes

| Mistake | Instead |
| --- | --- |
| `"… WHERE id = " + id` | `GET_BY_ID.withParam("id", id)` |
| `SELECT *` | explicit column list |
| `assertThat(rows).hasSize(1)` alone | also assert the values |
| Fixed fixture id | generate per run |
| `TRUNCATE` on a shared database | H2 in-memory, or a disposable instance |
| Transaction left open across a test | keep it small and explicitly scoped |
| Own JDBC connection | the ring — it pools and detects slow queries |

## Performance traps

- **N+1** inside a helper that reads as one call.
- **Unbounded queries in setup** — fast on an empty database, slow in proportion to
  how long the environment has been alive.
- **Locks held across a test** — shows up as unrelated timeouts elsewhere in the
  suite, one of the harder failures to trace.
