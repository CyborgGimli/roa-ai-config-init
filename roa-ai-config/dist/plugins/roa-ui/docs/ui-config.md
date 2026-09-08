# UI — Configuration

The UI adapter reads `${ui.config.file}.properties` (named in `system.properties`)
merged over system properties, so every key can be overridden with `-Dkey=value`.
The file layout and the `system.properties` indirection are in `framework-config.md`.

Values are reached through `getUiConfig()`; never read a property directly in a test.

## Browser and driver

| Key | Default | Meaning |
| --- | --- | --- |
| `ui.base.url` | — | application under test |
| `browser.type` | `CHROME` | which browser to launch |
| `browser.version` | *(empty)* | pin a version; empty means whatever is installed |
| `headless` | `false` | headless run |
| `remote.driver.url` | *(empty)* | Selenium Grid / remote WebDriver; empty runs locally |
| `wait.duration.in.seconds` | — | the default explicit wait behind every element interaction |

`wait.duration.in.seconds` is the knob for a slow environment. Raising it is the
correct fix for a suite that fails on timing in CI but passes locally — adding a
sleep to a test is not.

## Element resolution

| Key | Default | Meaning |
| --- | --- | --- |
| `use.wrap.selenium.function` | `true` | route finds and interactions through `SmartWebDriver`'s waiting wrappers |
| `use.shadow.root` | `false` | pierce shadow DOM when resolving locators |

Turn `use.shadow.root` on for a web-component stack (Vaadin, Lit, Polymer). Leaving
it off there produces "element not found" for elements plainly visible on the page.

Leave `use.wrap.selenium.function` on. With it off, `findSmartElement` degrades to a
raw Selenium find with no waiting, and the `before()` / `after()` hooks on the
element enums stop buying you anything.

## Default component types

Every component service exposes overloads with and without a type. The no-type
overload uses a `DEFAULT_TYPE` resolved once at startup from these keys:

| Key | Service |
| --- | --- |
| `input.default.type` | `input()` |
| `button.default.type` | `button()` |
| `checkbox.default.type` | `checkbox()` |
| `toggle.default.type` | `toggle()` |
| `radio.default.type` | `radio()` |
| `select.default.type` | `select()` |
| `list.default.type` | `list()` |
| `loader.default.type` | `loader()` |
| `link.default.type` | `link()` |
| `alert.default.type` | `alert()` |
| `tab.default.type` | `tab()` |
| `modal.default.type` | `modal()` |
| `accordion.default.type` | `accordion()` |
| `table.default.type` | `table()` |

The value is the **name of an enum constant** in one of your Layer 1 type enums —
`input.default.type=BOOTSTRAP_INPUT` resolves to the `BOOTSTRAP_INPUT` constant of
whichever enum implements `InputComponentType`. Resolution is reflective and scoped
to `project.packages`.

Set the type your app uses for a component and the tests stop repeating it. Where a
page mixes technologies, pass the type explicitly on the exception and let the
default cover the rest.

**Trap.** Resolution swallows its own failure and yields `null`. A misspelled
constant, a type enum outside `project.packages`, or a missing key all look the same:
the typed overloads keep working and the no-type overloads fail at the first call.
When one `input().insert(...)` misbehaves while the four-argument form is fine, check
this key before the locator.

## Reporting

| Key | Default | Meaning |
| --- | --- | --- |
| `screenshot.on.passed.test` | `false` | attach a screenshot to passing tests too |

Failures are captured either way.

## Example

```properties
project.packages=io.yourcompany.test.framework

ui.base.url=https://app.example.com/
browser.type=CHROME
browser.version=
headless=false
wait.duration.in.seconds=10
remote.driver.url=

use.shadow.root=true
use.wrap.selenium.function=true

input.default.type=MD_INPUT
button.default.type=MD_BUTTON_TYPE
table.default.type=DEFAULT

default.storage=UI
screenshot.on.passed.test=true
```
