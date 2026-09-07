# UI — Required Imports

No wildcard imports. Import only what you use, especially for statics.

## Test class

| Feature | Import |
| --- | --- |
| Base class | `io.cyborgcode.roa.framework.base.BaseQuest` |
| Sequential base class | `io.cyborgcode.roa.framework.base.BaseQuestSequential` |
| Quest parameter | `io.cyborgcode.roa.framework.quest.Quest` |
| `@UI` | `io.cyborgcode.roa.ui.annotations.UI` |
| JUnit `@Test` | `org.junit.jupiter.api.Test` |
| Ring constant | `static {project}.base.Rings.RING_OF_UI` |
| Element enums | `{project}.ui.elements.InputFields` (and friends) |
| UI config access | `static io.cyborgcode.roa.ui.config.UiConfigHolder.getUiConfig` |
| Auth annotation | `io.cyborgcode.roa.ui.annotations.AuthenticateViaUi` |
| Interception annotation | `io.cyborgcode.roa.ui.annotations.InterceptRequests` |
| Storage extractors | `static io.cyborgcode.roa.ui.storage.DataExtractorsUi.tableRowExtractor` |
| Storage keys | `io.cyborgcode.roa.ui.storage.StorageKeysUi` |
| Selection strategy | `io.cyborgcode.roa.ui.util.strategy.Strategy` |
| `validateTextInField` tag | `javax.swing.text.html.HTML.Tag` |
| `@Craft` | `io.cyborgcode.roa.framework.annotation.Craft` |
| `@Journey` / `@JourneyData` | `io.cyborgcode.roa.framework.annotation.Journey` / `.JourneyData` |
| `@Ripper` | `io.cyborgcode.roa.framework.annotation.Ripper` |
| Late initialisation | `io.cyborgcode.roa.framework.parameters.Late` |
| Retry condition | `io.cyborgcode.roa.framework.retry.RetryConditionImpl` |

`HTML.Tag` and JUnit's `org.junit.jupiter.api.Tag` clash on the simple name. In a
class that uses both, import one and qualify the other.

## Layer 1 — types

| Feature | Import |
| --- | --- |
| Component type contract | `io.cyborgcode.roa.ui.components.{kind}.{Kind}ComponentType` |
| Table component type | `io.cyborgcode.roa.ui.components.table.base.TableComponentType` |
| Default table type | `io.cyborgcode.roa.ui.service.tables.DefaultTableTypes` |

## Layer 2 — elements

| Feature | Import |
| --- | --- |
| Element contract | `io.cyborgcode.roa.ui.selenium.{Kind}UiElement` |
| Base element contract | `io.cyborgcode.roa.ui.selenium.UiElement` |
| Component type supertype | `io.cyborgcode.roa.ui.components.base.ComponentType` |
| Hook parameter | `io.cyborgcode.roa.ui.selenium.smart.SmartWebDriver` |
| Locator | `org.openqa.selenium.By` |
| Hook signature | `java.util.function.Consumer` |

## Layer 3 — implementations

| Feature | Import |
| --- | --- |
| Base class | `io.cyborgcode.roa.ui.components.base.BaseComponent` |
| Type binding | `io.cyborgcode.roa.ui.annotations.ImplementationOfType` |
| Component contract | `io.cyborgcode.roa.ui.components.{kind}.{Kind}` |
| Element wrapper | `io.cyborgcode.roa.ui.selenium.smart.SmartWebElement` |

## Tables

| Feature | Import |
| --- | --- |
| Table element contract | `io.cyborgcode.roa.ui.service.tables.TableElement` |
| Column binding | `io.cyborgcode.roa.ui.components.table.base.TableField` |
| Structural annotations | `io.cyborgcode.roa.ui.components.table.annotations.TableInfo` / `.TableCellLocator` |
| Cell overrides | `…table.annotations.CellFilter` / `.CellInsertion` / `.CustomCellFilter` / `.CustomCellInsertion` |
| Custom handlers | `…table.insertion.CellInsertionFunction` |
| Filter strategy | `io.cyborgcode.roa.ui.components.table.filters.FilterStrategy` |
| Sorting strategy | `io.cyborgcode.roa.ui.components.table.sort.SortingStrategy` |
| Assertion builder | `io.cyborgcode.roa.validator.core.Assertion` |
| Table targets | `io.cyborgcode.roa.ui.validator.UiTablesAssertionTarget` |
| Table types | `io.cyborgcode.roa.ui.validator.TableAssertionTypes` |

## Insertion and interception

| Feature | Import |
| --- | --- |
| Model annotation | `io.cyborgcode.roa.ui.annotations.InsertionElement` |
| Intercept contract | `io.cyborgcode.roa.ui.parameters.DataIntercept` |

`{project}` is your own base package; `{kind}` / `{Kind}` is the component, e.g.
`input` / `Input`.
