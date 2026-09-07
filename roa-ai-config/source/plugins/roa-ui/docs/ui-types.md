# UI — Layer 1: Component Types

An enum naming the UI technology variant. It exists so one logical element can be
rendered by Bootstrap in one app and Vaadin in another without changing any test.

```java
package com.example.ui.types;

import io.cyborgcode.roa.ui.components.alert.AlertComponentType;

public enum AlertFieldTypes implements AlertComponentType {

    BOOTSTRAP_ALERT_TYPE;

    public static final class Data {
        public static final String BOOTSTRAP_ALERT = "BOOTSTRAP_ALERT_TYPE";

        private Data() {
        }
    }

    @Override
    public Enum<?> getType() {
        return this;
    }
}
```

## Contract

| Member | Purpose |
| --- | --- |
| `getType()` | returns `this`; the framework's handle on the constant |
| nested `Data` | string constants for `@ImplementationOfType`, private constructor |

Annotations need compile-time constants, which is why the nested class exists. Keep
the constant name and the enum constant in step — a mismatch compiles and then fails
to resolve an implementation at runtime.

## The component types

`AccordionComponentType`, `AlertComponentType`, `ButtonComponentType`,
`CheckboxComponentType`, `InputComponentType`, `ItemListComponentType`,
`LinkComponentType`, `LoaderComponentType`, `ModalComponentType`,
`RadioComponentType`, `SelectComponentType`, `TabComponentType`,
`TableComponentType`, `ToggleComponentType`.

All are on the Pandora regeneration list — run `mvn pandora:open -U` after adding one.
