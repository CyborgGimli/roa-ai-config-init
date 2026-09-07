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
    public boolean isVisible(SmartWebElement container) {
        return container.isDisplayed();
    }

    @Override
    public void close(SmartWebElement container) {
        SmartWebElement closeButton =
            container.findSmartElement(By.cssSelector(".close, [data-dismiss='alert']"));
        closeButton.click();
    }
}
```

## Signatures differ per component

`Alert` takes a resolved container; `Input` takes the locator:

```java
@ImplementationOfType(InputFieldTypes.Data.BOOTSTRAP_INPUT)
public class InputBootstrapImpl extends BaseComponent implements Input {

    public InputBootstrapImpl(SmartWebDriver driver) {
        super(driver);
    }

    @Override
    public void insert(By locator, String value) {
        SmartWebElement inputField = driver.findSmartElement(locator);
        inputField.clearAndSendKeys(value);
    }

    @Override
    public String getValue(By locator) {
        SmartWebElement inputField = driver.findSmartElement(locator);
        return inputField.getDomAttribute("value");
    }
}
```

**Read the component interface metadata before implementing it.** Do not assume the
shape from another component.

## Rules

- Extend `BaseComponent`; take `SmartWebDriver` in the constructor.
- `driver.findSmartElement(...)` — never `findElement(...)`.
- `element.getDomAttribute(...)` — never `getAttribute(...)`.
- `@ImplementationOfType(Types.Data.CONSTANT)` links it to its type.

## The component interfaces

`Accordion`, `Alert`, `Button`, `Checkbox`, `Input`, `ItemList`, `Link`, `Loader`,
`Modal`, `Radio`, `Select`, `Tab`, `Table`, `Toggle` — each paired with the
matching `*ComponentType`.
