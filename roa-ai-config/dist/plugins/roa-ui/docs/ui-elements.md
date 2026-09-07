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

`before()` and `after()` return `Consumer<SmartWebDriver>` and run around every
operation on that element. Putting the wait here rather than in the test means the
timing is fixed once, for every test that touches the control.

Written literally, the hook has to repeat the locator:

```java
SIGN_IN_BUTTON(
    By.id("signin_button"),
    ButtonFieldTypes.BOOTSTRAP_BUTTON_TYPE,
    driver -> SharedUiFunctions.waitForPresence(driver, By.id("signin_button")),
    driver -> {}
),
```

That duplication is a real trap — change the locator and the wait silently keeps
watching the old one.

### Binding a shared wait to the element's own locator

Declare a small project-side interface that can bind a wait to a locator, and an
enum of the waits themselves:

```java
public interface ContextConsumer extends Consumer<SmartWebDriver> {
    Consumer<SmartWebDriver> asConsumer(By locator);
}

public enum SharedUi implements ContextConsumer {

    WAIT_FOR_PRESENCE(SharedUiFunctions::waitForPresence);

    private final BiConsumer<SmartWebDriver, By> function;

    SharedUi(BiConsumer<SmartWebDriver, By> function) {
        this.function = function;
    }

    @Override
    public Consumer<SmartWebDriver> asConsumer(By locator) {
        return driver -> function.accept(driver, locator);
    }

    @Override
    public void accept(SmartWebDriver driver) {
        function.accept(driver, null);
    }
}
```

Then a constructor overload binds it, and the constant names the wait only:

```java
ButtonFields(By locator, ButtonComponentType componentType, ContextConsumer before) {
    this(locator, componentType, before.asConsumer(locator), driver -> {});
}
```

```java
SIGN_IN_BUTTON(By.id("signin_button"), ButtonFieldTypes.BOOTSTRAP_BUTTON_TYPE,
               SharedUi.WAIT_FOR_PRESENCE),
SUBMIT_BUTTON(By.id("btn_submit"), ButtonFieldTypes.BOOTSTRAP_BUTTON_TYPE),
```

The locator is written once, the wait vocabulary is shared across every element
registry, and the enum stays readable as a map of the page.

A wait that needs a *different* locator than the element's own — wait for an overlay
to disappear before clicking — still takes the explicit `Consumer` form. Both
constructors can coexist.

### Never business logic

Never put business logic in a hook. A hook that clicks something, or decides what
happens next, hides behaviour from the test that appears to drive it — and it runs
on *every* operation on that element, including the ones where you did not want it.

## The element interfaces

`AccordionUiElement`, `AlertUiElement`, `ButtonUiElement`, `CheckboxUiElement`,
`InputUiElement`, `LinkUiElement`, `ListUiElement`, `LoaderUiElement`,
`ModalUiElement`, `RadioUiElement`, `SelectUiElement`, `TabUiElement`,
`ToggleUiElement` — all extending `UiElement`.

The interface you implement decides which service can drive the element. All are on
the Pandora regeneration list.
