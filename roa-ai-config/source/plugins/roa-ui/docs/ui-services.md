# ROA UI — Services and Element Inventory

What the UI ring actually offers. Verified against the generated Pandora metadata;
open the metadata file for a type before using it.

## Service fluents

Reached through the `AppUiService` facade. Each returns a typed service that chains
back to the facade.

| Service | Facade shorthand (typical) | Covers |
| --- | --- | --- |
| `NavigationServiceFluent` | `browser()` | navigation, URLs, window handling |
| `InputServiceFluent` | `input()` | text inputs |
| `ButtonServiceFluent` | `button()` | buttons |
| `LinkServiceFluent` | `link()` | anchors |
| `SelectServiceFluent` | `select()` | dropdowns |
| `CheckboxServiceFluent` | `checkbox()` | checkboxes |
| `RadioServiceFluent` | `radio()` | radio groups |
| `ToggleServiceFluent` | `toggle()` | toggles / switches |
| `TabServiceFluent` | `tab()` | tab strips |
| `AccordionServiceFluent` | `accordion()` | expand/collapse panels |
| `AlertServiceFluent` | `alert()` | alerts and banners |
| `ModalServiceFluent` | `modal()` | dialogs |
| `ListServiceFluent` | `list()` | item lists |
| `LoaderServiceFluent` | `loader()` | spinners and progress states |
| `TableServiceFluent` | `table()` | tables — see `ui-tables.md` |
| `InsertionServiceFluent` | `insertion()` | model-driven form filling — see `ui-insertion.md` |
| `InterceptorServiceFluent` | — | request interception — see `ui-interception.md` |
| `ValidationServiceFluent` | `validate()` | generic hard/soft assertions |

The facade only exposes what your project declares. Add a shorthand to
`AppUiService` when you start using a service the project has not needed yet.

## Element interfaces

Layer 2 enums implement one of these. The interface you implement decides which
service can drive the element.

`AccordionUiElement`, `AlertUiElement`, `ButtonUiElement`, `CheckboxUiElement`,
`InputUiElement`, `LinkUiElement`, `ListUiElement`, `LoaderUiElement`,
`ModalUiElement`, `RadioUiElement`, `SelectUiElement`, `TabUiElement`,
`ToggleUiElement` — all extending `UiElement`.

Every one requires `locator()`, `componentType()`, `enumImpl()`, and the optional
`before()` / `after()` hooks.

## Component interfaces and their types

Layer 3 implements the component interface; Layer 1 implements the matching
`*ComponentType`.

| Component | Component type |
| --- | --- |
| `Accordion` | `AccordionComponentType` |
| `Alert` | `AlertComponentType` |
| `Button` | `ButtonComponentType` |
| `Checkbox` | `CheckboxComponentType` |
| `Input` | `InputComponentType` |
| `ItemList` | `ItemListComponentType` |
| `Link` | `LinkComponentType` |
| `Loader` | `LoaderComponentType` |
| `Modal` | `ModalComponentType` |
| `Radio` | `RadioComponentType` |
| `Select` | `SelectComponentType` |
| `Tab` | `TabComponentType` |
| `Table` | `TableComponentType` |
| `Toggle` | `ToggleComponentType` |

Signatures differ per component — `Alert.getText(SmartWebElement container)` takes a
resolved container, while `Input.insert(By locator, String value)` takes the locator.
**Read the interface metadata before implementing it.**

## Supporting types

- `SmartWebDriver` / `SmartWebElement` — the wrapper API. `findSmartElement()`,
  `clearAndSendKeys()`, `getDomAttribute()`.
- `Strategy` (`io.cyborgcode.roa.ui.util`) — interaction strategy for components
  that support more than one way to act.
- `UiConfigHolder.getUiConfig()` — static accessor for UI config, e.g. `baseUrl()`.
- `DataExtractorsUi` — storage extractors for UI, e.g. `responseBodyExtraction(...)`.
- `DataIntercept` — the request-interception contract.

## Validation

```java
// Direct, component-specific validators — preferred for UI
.button().validateIsVisible(ButtonFields.SUBMIT)
.input().validateValue(InputFields.NAME, "expected")
.select().validateValue(SelectFields.ACCOUNT, "Savings")

// Generic hard assertion (JUnit)
.validate(() -> Assertions.assertTrue(condition))

// Generic soft assertion (AssertJ SoftAssertions), collected until complete()
.validate(soft -> soft.assertThat(actual).isEqualTo(expected))
```

`Assertion.builder()` is for **tables** — see `ui-tables.md`. Metadata shows it
exists for other targets; the UI module rules still forbid it for ordinary
components, and module rules outrank metadata.
