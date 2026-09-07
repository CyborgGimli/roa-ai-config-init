# UI — Layer 2: UI Elements

An enum binding a locator to a component type. **Every locator in the repository
lives here.**

```java
package com.example.ui.elements;

import com.example.ui.types.AlertFieldTypes;
import io.cyborgcode.roa.ui.components.base.ComponentType;
import io.cyborgcode.roa.ui.selenium.AlertUiElement;
import io.cyborgcode.roa.ui.selenium.smart.SmartWebDriver;
import org.openqa.selenium.By;

import java.util.function.Consumer;

public enum AlertFields implements AlertUiElement {

    TRANSFER_SUCCESS_ALERT(By.cssSelector(".alert-success"), AlertFieldTypes.BOOTSTRAP_ALERT_TYPE),
    LOGIN_ERROR_ALERT(By.cssSelector(".alert-error"), AlertFieldTypes.BOOTSTRAP_ALERT_TYPE);

    public static final class Data {
        public static final String TRANSFER_SUCCESS_ALERT = "TRANSFER_SUCCESS_ALERT";
        public static final String LOGIN_ERROR_ALERT = "LOGIN_ERROR_ALERT";

        private Data() {
        }
    }

    private final By locator;
    private final AlertFieldTypes componentType;
    private final Consumer<SmartWebDriver> before;
    private final Consumer<SmartWebDriver> after;

    AlertFields(By locator, AlertFieldTypes componentType) {
        this(locator, componentType, driver -> {}, driver -> {});
    }

    AlertFields(By locator, AlertFieldTypes componentType,
                Consumer<SmartWebDriver> before, Consumer<SmartWebDriver> after) {
        this.locator = locator;
        this.componentType = componentType;
        this.before = before;
        this.after = after;
    }

    @Override public By locator() { return locator; }

    @Override
    public <T extends ComponentType> T componentType() {
        return (T) componentType;
    }

    @Override public Enum<?> enumImpl()               { return this; }
    @Override public Consumer<SmartWebDriver> before() { return before; }
    @Override public Consumer<SmartWebDriver> after()  { return after; }
}
```

## Contract

The interface methods are `locator()`, `componentType()`, `enumImpl()`, `before()`,
`after()` — **not JavaBean getters**. The two-argument constructor delegates with
no-op hooks so the common case stays one line.

## Hooks are synchronisation only

```java
SIGN_IN_BUTTON(
    By.id("signin_button"),
    ButtonFieldTypes.BOOTSTRAP_BUTTON_TYPE,
    driver -> SharedUiFunctions.waitForPresence(driver, By.id("signin_button")),
    driver -> {}
),
```

Never put business logic in a hook. A hook that clicks something, or decides what
happens next, hides behaviour from the test that appears to drive it.

## The element interfaces

`AccordionUiElement`, `AlertUiElement`, `ButtonUiElement`, `CheckboxUiElement`,
`InputUiElement`, `LinkUiElement`, `ListUiElement`, `LoaderUiElement`,
`ModalUiElement`, `RadioUiElement`, `SelectUiElement`, `TabUiElement`,
`ToggleUiElement` — all extending `UiElement`.

The interface you implement decides which service can drive the element. All are on
the Pandora regeneration list.
