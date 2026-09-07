# UI — Layer 3: Implementations

The class that performs the Selenium interaction. The framework selects it from the
element's component type via `@ImplementationOfType`.

```java
package com.example.ui.components.alert;

import com.example.ui.types.AlertFieldTypes;
import io.cyborgcode.roa.ui.annotations.ImplementationOfType;
import io.cyborgcode.roa.ui.components.alert.Alert;
import io.cyborgcode.roa.ui.components.base.BaseComponent;
import io.cyborgcode.roa.ui.selenium.smart.SmartWebDriver;
import io.cyborgcode.roa.ui.selenium.smart.SmartWebElement;
import org.openqa.selenium.By;

@ImplementationOfType(AlertFieldTypes.Data.BOOTSTRAP_ALERT)
public class AlertBootstrapImpl extends BaseComponent implements Alert {

    public AlertBootstrapImpl(SmartWebDriver driver) {
        super(driver);
    }

    @Override
    public String getText(SmartWebElement container) {
        return container.getText();
    }

    @Override
    public String getText(SmartWebElement container, String alertLabel) {
        return getText(container);
    }

    @Override
    public boolean isVisible(SmartWebElement container) {
        return container.isDisplayed();
    }

    @Override
    public boolean isVisible(SmartWebElement container, String alertLabel) {
        return isVisible(container);
    }

    @Override
    public void close(SmartWebElement container) {
        container.findSmartElement(By.cssSelector(".close, [data-dismiss='alert']")).click();
    }

    @Override
    public void close(SmartWebElement container, String alertLabel) {
        close(container);
    }
}
```

## Labelled overloads come in pairs

Almost every component method has two forms: `m(container)` and
`m(container, label)`. Both are abstract, so **both must be implemented** — a class
that implements only the unlabelled form does not compile.

The label identifies one control among several inside the same container. Where the
element enum already resolves a single control, delegate:

```java
@Override
public void click(SmartWebElement container, String buttonLabel) {
    click(container);
}
```

Only write a real body for the labelled form when the container genuinely holds
several controls and the label picks between them.

## Component inheritance

Some contracts extend others, and the implementation owes the full inherited set:

| Interface | Extends | So you must also implement |
| --- | --- | --- |
| `Link` | `Button` | `click`, `isEnabled`, `isVisible`, `getText` — plus `doubleClick`, `getHref` |
| `Tab` | `Button` | the whole `Button` set — plus `isSelected` |

Check the interface metadata for the inheritance before assuming a method list is
complete.

## Signatures differ per component

Not every method takes a container. Some take a locator, some take a `By` for a
nested element:

```java
@ImplementationOfType(InputFieldTypes.Data.BOOTSTRAP_INPUT)
public class InputBootstrapImpl extends BaseComponent implements Input {

    private static final String VALUE_ATTRIBUTE = "value";

    public InputBootstrapImpl(SmartWebDriver driver) {
        super(driver);
    }

    @Override
    public void insert(SmartWebElement container, String value) {
        container.clear();
        container.sendKeys(value);
    }

    @Override
    public void insert(SmartWebElement container, String inputFieldLabel, String value) {
        insert(container, value);
    }

    @Override
    public String getValue(SmartWebElement container) {
        return container.getDomProperty(VALUE_ATTRIBUTE);
    }

    @Override
    public String getErrorMessage(SmartWebElement container, By errorMessageLocator) {
        return container.findSmartElement(errorMessageLocator).getText();
    }
}
```

**Read the component interface metadata before implementing it.** Do not assume the
shape from another component.

## getDomAttribute vs getDomProperty

They are not interchangeable. `getDomAttribute` reads what the HTML declared;
`getDomProperty` reads the live DOM state.

- What the user typed into an input is the **property**. `getDomAttribute("value")`
  returns the original markup value and quietly ignores every keystroke since.
- A static `data-*` hook is the **attribute**.

Reading a typed value with `getDomAttribute` is the classic version of this bug: the
test passes on an empty form and fails the moment anyone types.

`getAttribute()` is forbidden either way — it is the ambiguous legacy call the two
above replaced.

## Rules

- Extend `BaseComponent`; take `SmartWebDriver` in the constructor.
- `driver.findSmartElement(...)` / `container.findSmartElement(...)` — never
  `findElement(...)`.
- `@ImplementationOfType(Types.Data.CONSTANT)` links it to its type. A constant that
  does not match the enum compiles and then fails to resolve at runtime.
- No business logic here. A component performs an interaction; it does not decide
  what the test does next.

## The component interfaces

`Accordion`, `Alert`, `Button`, `Checkbox`, `Input`, `ItemList`, `Link`, `Loader`,
`Modal`, `Radio`, `Select`, `Tab`, `Table`, `Toggle` — each paired with the
matching `*ComponentType`.

`DefaultTable` is the framework's own `Table` implementation, selected by
`DefaultTableTypes.DEFAULT`. Use it rather than writing a table implementation
unless the widget genuinely needs one.
