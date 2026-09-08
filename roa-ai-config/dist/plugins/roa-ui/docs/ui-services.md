# ROA UI — Service Fluents

What each service on the `AppUiService` facade can actually do. Verified against the
generated Pandora metadata; open the metadata file for a service before relying on
an overload that is not listed here.

Every method takes the Layer 2 element enum constant as its first argument and
returns the service, so calls chain. `validate*` methods take an optional trailing
`boolean soft` — `true` collects until `complete()`, omitted or `false` fails
immediately.

## Interaction services

| Service | Shorthand | Actions | Reads | Validators |
| --- | --- | --- | --- | --- |
| `InputServiceFluent` | `input()` | `insert`, `clear`, `insertion` | `getValue`, `getErrorMessage`, `isEnabled` | `validateValue`, `validateErrorMessage`, `validateIsEnabled`, `validateIsDisabled` |
| `ButtonServiceFluent` | `button()` | `click` | `isEnabled`, `isVisible` | `validateIsEnabled`, `validateIsDisabled`, `validateIsVisible`, `validateIsHidden` |
| `LinkServiceFluent` | `link()` | `click`, `doubleClick` | `isEnabled`, `isVisible` | same four as button |
| `SelectServiceFluent` | `select()` | `selectOption`, `selectOptions`, `insertion` | `getAvailableOptions`, `getSelectedOptions`, `isOptionEnabled`, `isOptionVisible` | `validateSelectedOptions`, `validateAvailableOptions`, `validateIsOption{Enabled,Disabled,Visible,Hidden}` |
| `CheckboxServiceFluent` | `checkbox()` | `select`, `deSelect`, `insertion` | `getAll`, `getSelected`, `isSelected`, `isEnabled`, `areSelected`, `areEnabled` | `validateIsSelected`, `validateIsEnabled` |
| `RadioServiceFluent` | `radio()` | `select`, `insertion` | `getAll`, `getSelected`, `isSelected`, `isEnabled`, `isVisible` | `validateSelected`, `validateAllRadioInputs`, `validateIs{Selected,NotSelected,Enabled,Disabled,Visible,Hidden}` |
| `ToggleServiceFluent` | `toggle()` | `activate`, `deactivate` | `isActivated`, `isEnabled` | `validateIsActivated`, `validateIsDeactivated`, `validateIsEnabled`, `validateIsDisabled` |
| `TabServiceFluent` | `tab()` | `click` | `isSelected`, `isEnabled`, `isVisible` | `validateIs{Selected,NotSelected,Enabled,Disabled,Visible,Hidden}` |
| `AccordionServiceFluent` | `accordion()` | `expand`, `collapse` | `getAll`, `getExpanded`, `getCollapsed`, `getTitle`, `getText`, `isEnabled`, `areEnabled` | `validateExpandedItems`, `validateCollapsedItems`, `validateAllAccordions`, `validateTitle`, `validateText`, `validateAre{Enabled,Disabled}`, `validateIs{Enabled,Disabled}` |
| `ListServiceFluent` | `list()` | `select`, `deSelect`, `insertion` | `getAll`, `getSelected`, `isSelected`, `isEnabled`, `isVisible`, and the `are*` plural forms | `validateSelectedItems`, `validateNotSelectedItems`, `validateAllItems`, plus the `validateIs*` / `validateAre*` pairs for selected, enabled and visible |

## Read-and-assert services

| Service | Shorthand | Methods |
| --- | --- | --- |
| `AlertServiceFluent` | `alert()` | `getValue`, `isVisible`, `validateValue`, `validateIsVisible`, `validateIsHidden` |
| `ModalServiceFluent` | `modal()` | `click`, `close`, `getTitle`, `getContentTitle`, `getBodyText`, `isOpened`, `validateTitle`, `validateContentTitle`, `validateBodyText`, `validateIsOpened`, `validateIsClosed` |
| `LoaderServiceFluent` | `loader()` | `waitToBeShown`, `waitToBeRemoved`, `waitToBeShownAndRemoved`, `isVisible`, `validateIsVisible`, `validateIsHidden` |

`waitToBeShownAndRemoved` is the one to reach for after an action that triggers a
spinner: it covers both edges, so it cannot pass by running before the spinner
appeared.

## Cross-cutting services

| Service | Shorthand | Methods |
| --- | --- | --- |
| `NavigationServiceFluent` | `browser()` | `navigate`, `back`, `forward`, `refresh`; `openNewTab`, `switchToNewTab`, `closeCurrentTab`, `switchToWindow`; `switchToFrameByIndex`, `switchToFrameByNameOrId`, `switchToParentFrame`, `switchToDefaultContent`; `acceptAlert`, `dismissAlert`, `validateAlertText` |
| `TableServiceFluent` | `table()` | see `ui-tables.md` and `ui-tables-operations.md` |
| `InsertionServiceFluent` | `insertion()` | `insertData(model)` — see `ui-insertion.md` |
| `InterceptorServiceFluent` | `interceptor()` | `validateResponseHaveStatus` — see `ui-interception.md` |
| `ValidationServiceFluent` | `validate()` | `validateTextInField(HTML.Tag, expected[, soft])` |
| `UiServiceFluent` | — | the base: `validate(Runnable)` and `validate(Consumer<SoftAssertions>)` |

`acceptAlert` / `dismissAlert` handle the **browser's** native dialog, not a page
alert element. A Bootstrap banner is `alert()`; a `window.confirm` is `browser()`.

`validateTextInField` takes `javax.swing.text.html.HTML.Tag` — not JUnit's `@Tag`.
Import it explicitly, or the file will not compile in a test class that also uses
`org.junit.jupiter.api.Tag`.

That is 19 services. The facade exposes only what your project has declared — add a
shorthand to `AppUiService` when you first need one, rather than reaching for the
raw `get*` accessor in a test.

## Strategy

`Strategy` (`io.cyborgcode.roa.ui.util.strategy`) picks an element when the target is
not predetermined: `FIRST`, `LAST`, `RANDOM`, `ALL`. It is accepted by the
`select` / `deSelect` / `expand` / `collapse` / `selectOptions` overloads.

```java
quest.use(RING_OF_UI)
     .accordion().expand(AccordionSections.FILTERS, Strategy.FIRST)
     .drop().complete();
```

Use it for exploratory flows or where labels are not stable. `Strategy.RANDOM` in an
assertion path makes the failure unreproducible — prefer an explicit target whenever
the test is asserting something.

## Supporting types

| Type | Purpose |
| --- | --- |
| `SmartWebDriver` / `SmartWebElement` | the wrapper API: `findSmartElement()`, `clearAndSendKeys()`, `getDomAttribute()`, `getDomProperty()` |
| `UiConfigHolder.getUiConfig()` | static accessor for UI config, e.g. `baseUrl()` |
| `DataExtractorsUi` | storage extractors — see `ui-storage.md` |
| `DataIntercept` | the request-interception contract — see `ui-interception.md` |

## Validation

```java
// Direct, component-specific validators — preferred for UI
.button().validateIsVisible(ButtonFields.SUBMIT)
.input().validateValue(InputFields.NAME, "expected")
.select().validateSelectedOptions(SelectFields.ACCOUNT, "Savings")

// Generic hard assertion (JUnit)
.validate(() -> Assertions.assertTrue(condition))

// Generic soft assertion (AssertJ SoftAssertions), collected until complete()
.validate(soft -> soft.assertThat(actual).isEqualTo(expected))
```

`Assertion.builder()` is for **tables**. Metadata shows it exists for other targets;
the UI module rules still forbid it for ordinary components, and module rules outrank
metadata.
