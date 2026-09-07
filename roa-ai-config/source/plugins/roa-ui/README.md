# ROA UI Plugin

AI-assisted UI test development for ROA framework.

## What It Does

Guides UI test creation following ROA's three-layer architecture:

1. **Component Types** (enums in `ui/types/`)
   - Identify UI technology (Bootstrap, Vaadin, etc.)
   
2. **UI Elements** (enums in `ui/elements/`)
   - Define locators and element metadata
   
3. **Component Implementations** (classes in `ui/components/`)
   - Concrete Selenium interactions using SmartWebDriver

## Using This Plugin

1. Start with `/roa-ui-architect` to generate UI tests
2. Reference `.codex/instructions/ui-framework-instructions.md`
3. Check `.codex/examples/ui-test-examples.md` for patterns
4. Verify against `.codex/rules/rules.md`

## Core Concepts

- **AppUiService** — Central UI facade (extends UiServiceFluent)
- **Fluent chaining** — All methods return `this` for readable chains
- **SmartWebDriver** — Use `findSmartElement()`, not `findElement()`
- **Validation** — Direct methods (`.input().validateValue()`) or `Assertion.builder()` for tables

## Key Constraints

- ✓ Three layers MANDATORY (types → elements → implementations)
- ✓ Enums use nested `Data` class for annotation references
- ✓ Component implementations use `@ImplementationOfType` annotation
- ✓ All test validation must be in fluent chains
- ✓ Tests end with `.complete()`

---

See `.claude/AGENTS.md` for AI orchestration details.
