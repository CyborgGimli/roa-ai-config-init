---
name: roa-ui-architect
description: Generate UI tests following ROA three-layer architecture
user-invocable: true
allowed-tools: Read, Glob, Bash, Write, Edit, PowerShell
---

# ROA UI Architect

Generate fully-functional UI tests following ROA's three-layer component architecture.

## Usage

```bash
/roa-ui-architect
```

Describe the UI flow you want to test:
- "Create a login test with username and password fields"
- "Test the user profile page navigation"
- "Verify error message when login fails"

## What It Generates

The agent creates:

1. **Component Types** (ui/types/) — Enum identifying UI technology
2. **UI Elements** (ui/elements/) — Enum with By locators and component types
3. **Component Implementations** (ui/components/) — Classes using SmartWebDriver
4. **Test Class** (tests/) — Fluent UI test extending BaseQuest

## Mandatory Three Layers

```
types/ComponentTypes.java (Layer 1)
        ↓
elements/PageElements.java (Layer 2)
        ↓
components/ComponentImpl.java (Layer 3)
        ↓
tests/MyUiTest.java (Test)
```

## Example Generated Test

```java
@UI
class LoginUiTests extends BaseQuest {
  
  @Test
  void testSuccessfulLogin(Quest quest) {
    quest
      .use(RING_OF_UI)
      .browser().navigate(getUiConfig().baseUrl())
      .input().insert(InputFields.USERNAME, "testuser")
      .input().insert(InputFields.PASSWORD, "password123")
      .button().click(ButtonFields.LOGIN_BUTTON)
      .alert().validateValue(AlertFields.SUCCESS, "Login successful")
      .drop()
      .complete();
  }
}
```

## Validation

Generated code is verified to:
- ✓ Compile: `mvn clean compile` succeeds
- ✓ Follow three-layer structure
- ✓ Use SmartWebDriver correctly
- ✓ Include proper fluent chaining
- ✓ End with `.complete()`
- ✓ Match naming conventions

---

After generation, run: `mvn test` to execute tests

See `.claude/AGENTS.md` for detailed orchestration.
