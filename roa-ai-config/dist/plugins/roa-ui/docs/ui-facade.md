# UI — AppUiService Facade

The project-side entry point. Each shorthand returns a typed service that chains back
to the facade, which is what lets a whole test read as one expression.

```java
public class AppUiService extends UiServiceFluent<AppUiService> {

    public AppUiService(SmartWebDriver driver, SuperQuest quest) {
        super(driver);
        this.quest = quest;
        postQuestSetupInitialization();
    }

    public InputServiceFluent<AppUiService> input()         { return getInputField(); }
    public ButtonServiceFluent<AppUiService> button()       { return getButtonField(); }
    public SelectServiceFluent<AppUiService> select()       { return getSelectField(); }
    public TableServiceFluent<AppUiService> table()         { return getTable(); }
    public InsertionServiceFluent<AppUiService> insertion() { return getInsertionService(); }
    public NavigationServiceFluent<AppUiService> browser()  { return getNavigation(); }
}
```

Register it as the UI ring:

```java
public static final Class<AppUiService> RING_OF_UI = AppUiService.class;
```

## Adding a service

The facade exposes only what your project has needed. When you start using a service
for the first time, add its shorthand here rather than reaching for the raw accessor
in a test.

## Raw accessors

`getNavigation()`, `getInputField()`, `getButtonField()` and friends are used where
the facade is not available — inside a `BaseLoginClient`, which is generic over any
`UiServiceFluent`. See `ui-authentication.md`.

## The full service list

See `ui-services.md` for all 22 service fluents and what each covers.
