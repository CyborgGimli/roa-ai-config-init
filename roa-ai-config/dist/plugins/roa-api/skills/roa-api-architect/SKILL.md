---
name: roa-api-architect
description: Generate API tests with fluent validation patterns
user-invocable: true
allowed-tools: Read, Glob, Bash, Write, Edit, PowerShell
---

# ROA API Architect

Generate fully-functional REST API tests with fluent, readable patterns.

## Usage

```bash
/roa-api-architect
```

Describe the API operations you want to test:
- "Test user creation endpoint with validation"
- "Create login flow with token extraction"
- "Test error handling for invalid requests"

## What It Generates

The agent creates:

1. **Endpoints Enum** — HTTP methods + paths + nested Data class
2. **Request DTOs** — Type-safe request objects
3. **Response DTOs** — Type-safe response objects
4. **Test Class** — Fluent API tests extending BaseQuest

## Example Generated Test

```java
@Test
void testCreateUser(Quest quest) {
  String userId = quest
    .use(RING_OF_API)
    .post(AppEndpoints.CREATE_USER)
    .body(new CreateUserRequest("john@example.com", "John"))
    .expectStatus(201)
    .mapTo(UserResponse.class)
    .extractJson("id", String.class)
    .get();
  
  // Use result in next ring
  Storage.put("userId", userId);
}
```

## Fluent Patterns

```java
// GET request
quest.use(RING_OF_API)
  .get(AppEndpoints.GET_USER)
  .expectStatus(200)
  .expectJsonPath("email").equals("user@example.com")
  .complete();

// POST with body
quest.use(RING_OF_API)
  .post(AppEndpoints.CREATE_USER)
  .body(new CreateUserRequest(...))
  .expectStatus(201)
  .complete();

// Extract for other rings
String token = quest.use(RING_OF_API)
  .post(AppEndpoints.LOGIN)
  .body(credentials)
  .extractJson("token", String.class)
  .get();
```

## Validation

Generated code is verified to:
- ✓ Compile: `mvn clean compile` succeeds
- ✓ Have Endpoints enum with Data class
- ✓ Have proper DTO classes
- ✓ Use fluent chaining correctly
- ✓ Include status validation
- ✓ End with `.complete()`

---

After generation, run: `mvn test` to execute tests

See `.claude/AGENTS.md` for detailed orchestration.
