---
name: roa-ui-architect
description: Design and generate ROA UI tests following the three-layer component architecture - component types, element locators, implementations, and the test. Use when a task needs new UI test coverage rather than a change to an existing test.
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, Task, Skill
---

# ROA UI Architect

Design and generate UI tests for:

```text
$ARGUMENTS
```

Invoked as `/roa-ui:roa-ui-architect <flow to cover>`, for example:

- "Create a login test with username and password fields"
- "Test the user profile page navigation"
- "Verify the error message when login fails"

## Before generating

1. Load `roa-ui-task-profile` for the rules and task sequence that apply here.
2. Establish the application facts this test depends on — the rendered DOM, the
   stable locator for each control, what makes the page ready, and what the
   success state actually looks like. Locators are the single largest source of
   UI flakiness; a guessed selector is a defect, not a starting point. If the
   application cannot be inspected, say the design is blocked on that evidence
   rather than inventing markup.
3. Find what already exists. Delegate to the `codebase-investigator` agent when
   the current component types, element enums, and implementations are not
   obvious. Adding a locator for an interaction that already has an
   implementation is a Layer 2 change only — check before writing a fourth
   variant of the same component.
4. Load `ai-compass` and read `target/pandora/metadata/` for any ROA signature
   you are about to use — especially `@ImplementationOfType` and the element
   contracts. Never guess a method name.
5. Load `ai-teacher` before writing a new class and follow the closest
   `EXCELLENT` lesson's shape.
6. Deep reference: `${CLAUDE_PLUGIN_ROOT}/docs/ui-layers.md`, then
   `ui-elements.md`, `ui-components.md`, and `ui-facade.md`.

Generate only what the requested test needs. A new component type per new element
is a design smell, not thoroughness.

## The three layers

Every component exists in all three. Nothing skips one, and a test that carries
its own locator is a layering bug rather than a shortcut.

| Layer | Location | Holds |
| --- | --- | --- |
| 1. Component types | `ui/types/` | which UI technology variant (Bootstrap, Vaadin, …) |
| 2. UI elements | `ui/elements/` | locators, the type each uses, optional sync hooks |
| 3. Implementations | `ui/components/` | the Selenium interaction, annotated `@ImplementationOfType` |
| Test | `src/test/java/.../ui/` | `@UI` class extending `BaseQuest` |

Prefer a stable test hook (`data-test`) over a structural selector every time — a
selector tied to layout breaks the moment someone adds a wrapper element.

Layers 1 and 2 are both on the Pandora regeneration list, so a change to either
means running `mvn pandora:navigation -U` afterwards.

## The generated shape

```java
@UI
class LoginUiTests extends BaseQuest {

    @Test
    @DisplayName("Valid credentials sign the user in and land on the dashboard")
    void login_whenCredentialsValid_showsDashboard(Quest quest) {
        quest
            .use(RING_OF_UI)
            .browser().navigate(getUiConfig().baseUrl())
            .input().insert(InputFields.USERNAME, "testuser")
            .input().insert(InputFields.PASSWORD, "password123")
            .button().click(ButtonFields.LOGIN)
            .alert().validateValue(AlertFields.SUCCESS, "Login successful")
            .drop()
            .complete();
    }
}
```

Assert the outcome the requirement names. A successful click, a present element,
or the absence of an exception does not prove the user was signed in.

## Validation

Generated code must:

- ✓ Compile — `mvn test-compile` succeeds
- ✓ Keep all three layers intact, with no locator in a test
- ✓ Reach the browser through `AppUiService` and `findSmartElement()` — never a
  raw `WebDriver` or `findElement()` in a test
- ✓ Wait on an observable condition — never `Thread.sleep` or an inflated timeout
- ✓ Assert a visible or business outcome, not just that an interaction completed
- ✓ Create data through a `DataCreator` and remove it through a `DataCleaner`
- ✓ Select table rows by business data, not by row index
- ✓ End every chain with `.complete()`

Then execute the new tests through `run-tests` — a UI test that has never run is
not validated, because locator and timing defects do not appear at compile time.
Confirm the change against `roa-ui-definition-of-done` with `validate-code`
before reporting it complete.

Deep reference: `${CLAUDE_PLUGIN_ROOT}/docs/` — start at `ui-architecture.md`.
