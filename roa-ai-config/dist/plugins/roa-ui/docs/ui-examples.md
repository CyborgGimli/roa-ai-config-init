# UI Examples

This document provides worked examples of how ROA UI automation is structured.

Java blocks marked *from the ROA inspector example project* are copied from that project and compile against ROA; its element names and locators belong to its application under test (Zero Bank). Blocks marked *pattern* show one decision in isolation. In your project, take element constants and locators from your application and verify every `io.cyborgcode.roa.*` call with `ai-compass`.

## Basic UI Flow

A typical UI test follows this structure:

```text
Quest
  ↓
UI Ring
  ↓
AppUiService
  ↓
typed element / component interaction
  ↓
validation
  ↓
.drop()
  ↓
.complete()
```

Conceptually:

```java
quest.use(RING_OF_UI)
    // interact through AppUiService
    // use typed elements
    // validate meaningful behavior
    .drop()
    .complete();
```

Do not replace ROA UI abstractions with direct driver interaction merely to reproduce this structure.

## Typed Element

Tests reference element constants; the locator and component type live in the element enum. From the ROA inspector example project, `ui/elements/RadioFields.java`:

```java
public enum RadioFields implements RadioUiElement {

   DOLLARS_RADIO_FIELD(By.id("pc_inDollars_true"), RadioFieldTypes.BOOTSTRAP_RADIO_TYPE);

   public static final class Data {

      public static final String DOLLARS_RADIO_FIELD = "DOLLARS_RADIO_FIELD";

      private Data() {
      }

   }

   private final By locator;
   private final RadioComponentType componentType;


   RadioFields(final By locator, final RadioComponentType componentType) {
      this.locator = locator;
      this.componentType = componentType;
   }


   @Override
   public By locator() {
      return locator;
   }


   @Override
   public <T extends ComponentType> T componentType() {
      return (T) componentType;
   }


   @Override
   public Enum<?> enumImpl() {
      return this;
   }

}
```

The test uses the constant, never the locator: `.radio().select(RadioFields.DOLLARS_RADIO_FIELD)`.

The nested `Data` class mirrors a constant's name as a compile-time string, because annotations such as `@InsertionElement(elementEnum = …)` cannot take an enum value. Add a mirror only for a constant an annotation references, and only when the enum already has a `Data` class; annotations reference the mirror through a static import (see *Data Insertion*).

## Component Type

A component type names one interaction technology. From the ROA inspector example project, `ui/types/RadioFieldTypes.java`:

```java
public enum RadioFieldTypes implements RadioComponentType {

   BOOTSTRAP_RADIO_TYPE;


   public static final class Data {

      public static final String BOOTSTRAP_RADIO = "BOOTSTRAP_RADIO_TYPE";

      private Data() {
      }

   }


   @Override
   public Enum getType() {
      return this;
   }
}
```

Choose the type from how the control behaves in the live DOM, not from how it looks or from which enum sits next to it.

## Component Implementation

An implementation registers for a component type through the type's `Data` string. Structure from the ROA inspector example project, `ui/components/radio/RadioBootstrapImpl.java`:

```java
@ImplementationOfType(RadioFieldTypes.Data.BOOTSTRAP_RADIO)
public class RadioBootstrapImpl extends BaseComponent implements Radio {

   public RadioBootstrapImpl(SmartWebDriver driver) {
      super(driver);
   }

   // every method the Radio interface declares, with the parameter names ai-compass shows
}
```

Take this structure — registration, constructor, member order, naming — from an existing implementation. Take state reading from the new control's verified DOM, never from an implementation written for a different kind of control. The two cases differ in one place.

Pattern — a native control (`<input type="checkbox">`, `<input type="radio">`, `<option>`) keeps its current state in a DOM property, which `SmartWebElement` exposes through the WebElement API:

```java
private boolean isElementSelected(SmartWebElement element) {
   return element.isSelected();
}

private boolean isElementEnabled(SmartWebElement element) {
   return element.isEnabled();
}
```

Pattern — a custom widget whose markup marks state with a class, verified in the DOM:

```java
private boolean isElementSelected(SmartWebElement element) {
   String classes = element.getDomAttribute("class");
   return classes != null && classes.contains(CHECKED_CLASS_INDICATOR);
}
```

`getDomAttribute("checked")`, `getDomAttribute("selected")`, and `getDomAttribute("value")` return the attribute as the page declared it; they do not change when the user clicks or types, so on a native control they report the initial state. Read an input's current value with `getDomProperty("value")`.

## Element Synchronization

An element may require synchronization before interaction.

Conceptually:

```text
wait until control is ready
        ↓
interact
```

or after interaction:

```text
interact
        ↓
wait until resulting application state is ready
        ↓
continue
```

Use the project's established ROA synchronization mechanism.

Do not replace deterministic synchronization with:

```java
Thread.sleep(...);
```

when an observable application condition exists.

## Login as Supporting Infrastructure

When login is not under test, the lifecycle logs in before the test body runs. From the ROA inspector example project, `BasicToAdvancedFeatureTests.java`:

```java
@Test
@Regression
@Description("Insertion service maps model fields to UI controls in one operation")
@AuthenticateViaUi(credentials = AdminCredentials.class, type = AppUiLogin.class)
void insertionService_populatesFormFromModel(Quest quest,
      @Craft(model = DataCreator.Data.PURCHASE_CURRENCY) PurchaseForeignCurrency purchaseForeignCurrency) {
```

`AdminCredentials` and `AppUiLogin` are project classes under `ui/authentication`. Add `cacheCredentials = true` only when the tests in the class are meant to share one session.

## Login as the Behavior Under Test

When login is the requirement, the test drives the form itself, with credentials from the project's test-data class. From the ROA inspector example project, `BasicToAdvancedFeatureTests.java`:

```java
quest
      .use(RING_OF_UI)
      .browser().navigate(getUiConfig().baseUrl())
      .button().click(ButtonFields.SIGN_IN_BUTTON)
      .input().insert(InputFields.USERNAME_FIELD, Data.testData().username())
      .input().insert(InputFields.PASSWORD_FIELD, Data.testData().password())
      .button().click(ButtonFields.SIGN_IN_FORM_BUTTON)
```

`Data.testData()` reads the credentials from the project's test-data properties. Never type credentials as literals, even when an older test or a knowledge file does. Do not use `@AuthenticateViaUi` here: it would perform the action the test exists to prove. End the test with an assertion on what only an authenticated user sees.

## Generated Form Data

A test receives a generated model through `@Craft`, which resolves it through the project's `DataCreator`: `@Craft(model = DataCreator.Data.PURCHASE_CURRENCY) PurchaseForeignCurrency purchaseForeignCurrency` in the signature above. Use the data types the project's `DataCreator` already declares; do not invent Craft values or mappings.

## Data Insertion

A form model maps each field to an element constant through `@InsertionElement`, referencing the constant's `Data` mirror by static import. From the ROA inspector example project, `ui/model/PurchaseForeignCurrency.java`:

```java
import static io.cyborgcode.inspector.ui.elements.InputFields.Data.AMOUNT_CURRENCY_FIELD;
import static io.cyborgcode.inspector.ui.elements.RadioFields.Data.DOLLARS_RADIO_FIELD;
import static io.cyborgcode.inspector.ui.elements.SelectFields.Data.PC_CURRENCY_DDL;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class PurchaseForeignCurrency {

   @InsertionElement(locatorClass = SelectFields.class, elementEnum = PC_CURRENCY_DDL, order = 1)
   private String currency;

   @InsertionElement(locatorClass = InputFields.class, elementEnum = AMOUNT_CURRENCY_FIELD, order = 2)
   private String amount;

   @InsertionElement(locatorClass = RadioFields.class, elementEnum = DOLLARS_RADIO_FIELD, order = 3)
   private boolean usDollar;
}
```

`elementEnum` takes the static-imported constant, never a string literal such as `"PC_CURRENCY_DDL"`. A new form element therefore needs both its enum constant and its `Data` mirror.

The test fills the whole form in one call:

```java
quest
      .use(RING_OF_UI)
      .link().click(LinkFields.TRANSFER_FUNDS_LINK)
      .list().select(ListFields.NAVIGATION_TABS, PAY_BILLS)
      .list().select(ListFields.PAY_BILLS_TABS, PURCHASE_FOREIGN_CURRENCY)
      .insertion().insertData(purchaseForeignCurrency)
      .button().click(ButtonFields.CALCULATE_COST_BUTTON)
      .button().click(ButtonFields.PURCHASE_BUTTON)
      .alert().validateValue(AlertFields.FOREIGN_CURRENCY_CASH, SUCCESSFUL_PURCHASE_MESSAGE)
      .complete();
```

Insertion only enters data; the assertion after it proves the application accepted it.

## Runtime-Dependent Form Data

A field may depend on state produced earlier in the Quest.

Conceptually:

```text
Journey
→ creates prerequisite entity
→ identifier becomes available

form model
→ contains Late<T>

UI insertion
→ resolves runtime value
→ populates form
```

Use `Late<T>` only where the value genuinely depends on runtime state.

## Test Method Shape

A new test method, whatever the scenario:

```text
name
→ subject_action_expectedOutcome   (never testScenario_N)

annotations
→ @Test, one suite marker (@Regression | @Smoke), one-phrase @Description

data
→ single-use values are local variables; expectation derived from input
→ shared values come from the project's test-data class

assertion
→ the outcome the requirement names, in the element that renders it
→ validate().validateTextInField(HTML.Tag.<rendering element tag>, message), not BODY

scope
→ nothing the requirement did not ask for
```

The full Java form is in `ui-test-design.md`, *Test Shape*.

The imports such a test needs — copied from the ROA inspector example project's tests; the `Rings` package is the project's own:

```java
import io.cyborgcode.roa.framework.annotation.Regression;
import io.cyborgcode.roa.framework.base.BaseQuest;
import io.cyborgcode.roa.framework.quest.Quest;
import io.cyborgcode.roa.ui.annotations.UI;
import io.qameta.allure.Description;
import javax.swing.text.html.HTML.Tag;
import org.junit.jupiter.api.Test;

import static io.cyborgcode.roa.ui.config.UiConfigHolder.getUiConfig;
import static io.cyborgcode.inspector.common.base.Rings.RING_OF_UI;
```

When a new method goes into an existing test class, add the imports it is missing to that class and write `getUiConfig()` and `Tag.SPAN` in the method — never `io.cyborgcode.roa.ui.config.UiConfigHolder.getUiConfig()` or `javax.swing.text.html.HTML.Tag.SPAN` inline.

## Positive UI Scenario

A meaningful positive test might follow:

```text
Requirement
→ user can create customer

Setup
→ prepare prerequisite organization

UI
→ open customer form
→ enter valid data
→ submit

Validation
→ expected confirmation appears
→ created customer data is visible
```

The specific assertions should prove the requested behavior rather than merely confirm that the click succeeded.

## Negative Form Scenario

A focused negative test might follow:

```text
Requirement
→ email is mandatory

UI
→ populate otherwise valid form
→ leave email empty
→ submit

Validation
→ required-field error appears
→ submission does not complete
```

Keep the invalid condition deliberate and focused.

## Table Lookup

For a structured table:

```text
customer table
        ↓
find row by customer identifier
        ↓
read or validate target field
```

Prefer stable business data over row position.

Avoid:

```text
row 3
→ assume this is the customer
```

when sorting, filtering, pagination, or new data can change the order.

## Table Row Action

When a row contains actions:

```text
find intended customer row
        ↓
locate action associated with that row
        ↓
perform action
```

Do not locate a generic edit/delete button without proving that it belongs to the intended row.

## Table Validation

Conceptually:

```text
UI action
→ creates entity

table
→ find entity row

assertion
→ expected business value is displayed
```

Finding the row is part of interaction.

The assertion proves the expected state.

## Network Interception

When a UI action produces a runtime value needed later:

```text
configure interception
        ↓
perform UI action
        ↓
browser request occurs
        ↓
response captured
        ↓
extract identifier
        ↓
use identifier for cleanup
```

The interception target and response structure must come from actual DevTools inspection.

The exact ROA interception API must come from Pandora.

## Interception Supporting UI Validation

Valid:

```text
UI action
→ submit form

UI
→ success state is validated

interception
→ capture created entity id for cleanup
```

Invalid when the requirement is user-visible behavior:

```text
UI action
→ submit form

interception
→ response is asserted

UI result
→ never validated
```

The second scenario proves backend traffic, not necessarily the required UI behavior.

## Journey Setup

A reusable UI precondition may use another Ring.

```text
@Journey
→ API creates prerequisite account

Test
→ UI performs behavior under test

@Ripper
→ cleanup
```

Supporting setup must not perform the UI action the test itself exists to verify.

## Cross-Ring Verification

A UI action may be independently verified through another capability.

```text
UI
→ create entity

.drop()

DB
→ verify persisted state
```

or:

```text
UI
→ update entity

.drop()

API
→ verify resulting backend state
```

Use cross-Ring verification only when it materially improves confidence.

## Domain UI Service

When several tests repeatedly perform the same meaningful UI-domain flow:

```text
Test
  ↓
CustomerUiService
  ↓
AppUiService
  ↓
typed elements and components
```

The service should represent reusable domain behavior rather than merely rename individual clicks.

## Locator Change Example

If an existing UI test begins failing:

```text
repository element
→ locator A

actual application
→ locator A no longer identifies target control
```

Do not immediately add broader waits or fallback selectors.

First determine:

```text
application changed
→ update element definition if appropriate

existing locator still valid
→ investigate synchronization or another root cause
```

Use actual DOM evidence.

## Synchronization Failure Example

If a test intermittently fails because a control is unavailable:

```text
failure
→ element not ready

DevTools / runtime observation
→ loading state must disappear first

solution
→ model that readiness condition through established synchronization
```

Do not fix it by increasing arbitrary sleep duration.

## Framework Uncertainty Example

If implementation requires an unfamiliar ROA UI type:

```text
Need
→ configure element synchronization

Repository
→ no relevant example

Pandora
→ inspect exact element/synchronization metadata
```

Do not invent a fluent method or annotation attribute because its name seems likely.

## Example Principles

* Copy structure from the examples; take locators and application behavior from your application and ROA calls from Pandora.
* Use the actual application/DevTools for DOM, locator, network, synchronization, and session truth.
* Use the repository for existing project abstractions and conventions.
* Use Pandora for exact ROA UI framework usage.
* Use AI Teacher before generating new Java implementation code.
* Prefer typed elements, components, and services over raw driver interaction.
* Keep synchronization deterministic and separate from assertion.
* Preserve the UI behavior under test when using setup or supporting Rings.
* Use interception only as supporting evidence when the requirement is user-facing.
* Never copy an example mechanically when the current application or project differs.
