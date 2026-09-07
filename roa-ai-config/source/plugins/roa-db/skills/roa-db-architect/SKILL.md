---
name: roa-db-architect
description: Generate database tests with parameterized queries and fluent assertions
user-invocable: true
allowed-tools: Read, Glob, Bash, Write, Edit, PowerShell
---

# ROA DB Architect

Generate fully-functional database tests with safe SQL patterns and transaction management.

## Usage

```bash
/roa-db-architect
```

Describe the database operations you want to test:
- "Test user data insertion and retrieval"
- "Verify transaction rollback on error"
- "Test cascade delete behavior"

## What It Generates

The agent creates:

1. **Query Enum** — Parameterized SQL statements + nested Data class
2. **Result Mappers** — Type-safe row-to-object mapping (if needed)
3. **Test Class** — Fluent DB tests extending BaseQuest
4. **Transaction annotations** — @Transactional or @Ripper cleanup

## Example Generated Test

```java
@Test
@Transactional
void testUserInsertion(Quest quest) {
  quest
    .use(RING_OF_DB)
    .query(AppQueries.INSERT_USER)
    .withParams("john@example.com", "John Doe")
    .expectRowsAffected(1)
    .complete();
  
  // Verify insertion
  quest
    .use(RING_OF_DB)
    .query(AppQueries.SELECT_USER)
    .withParam("john@example.com")
    .expectSingleResult()
    .hasColumn("name").equals("John Doe")
    .complete();
  
  // Changes automatically rolled back after test
}
```

## Query Patterns

```java
// SELECT with assertion
quest.use(RING_OF_DB)
  .query(AppQueries.SELECT_USER)
  .withParam(userId)
  .expectSingleResult()
  .hasColumn("status").equals("ACTIVE")
  .complete();

// INSERT with row count
quest.use(RING_OF_DB)
  .query(AppQueries.INSERT_USERS)
  .withParams("user1@example.com", "User One")
  .withParams("user2@example.com", "User Two")
  .expectRowsAffected(2)
  .complete();

// UPDATE with verification
quest.use(RING_OF_DB)
  .query(AppQueries.UPDATE_USER_STATUS)
  .withParams("INACTIVE", userId)
  .expectRowsAffected(1)
  .complete();

// DELETE with cleanup
quest.use(RING_OF_DB)
  .query(AppQueries.DELETE_TEST_DATA)
  .withParam(testUserId)
  .expectRowsAffected(1)
  .complete();
```

## Validation

Generated code is verified to:
- ✓ Compile: `mvn clean compile` succeeds
- ✓ Use parameterized queries (? placeholders)
- ✓ Have Query enum with Data class
- ✓ Have result mappers for complex data
- ✓ Use fluent chaining correctly
- ✓ Include transaction management
- ✓ End with `.complete()`

---

After generation, run: `mvn test` to execute tests

See `.claude/AGENTS.md` for detailed orchestration.
