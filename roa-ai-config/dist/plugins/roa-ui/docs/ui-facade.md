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

    public InputServiceFluent<AppUiService> input()             { return getInputField(); }
    public ButtonServiceFluent<AppUiService> button()           { return getButtonField(); }
    public LinkServiceFluent<AppUiService> link()               { return getLinkField(); }
    public SelectServiceFluent<AppUiService> select()           { return getSelectField(); }
    public AlertServiceFluent<AppUiService> alert()             { return getAlertField(); }
    public TableServiceFluent<AppUiService> table()             { return getTable(); }
    public InsertionServiceFluent<AppUiService> insertion()     { return getInsertionService(); }
    public InterceptorServiceFluent<AppUiService> interceptor() { return getInterceptor(); }
    public NavigationServiceFluent<AppUiService> browser()      { return getNavigation(); }
    public ValidationServiceFluent<AppUiService> validate()     { return getValidation(); }
}
```

## The constructor

Three things, in this order, and none of them optional:

| Line | Why |
| --- | --- |
| `super(driver)` | hands the `SmartWebDriver` to `UiServiceFluent` |
| `this.quest = quest` | the ring needs the `SuperQuest` for storage and reporting |
| `postQuestSetupInitialization()` | wires the services up now that both are set |

Omitting `postQuestSetupInitialization()` compiles, and then every service accessor
returns something unusable at runtime.

## Register it as the ring

```java
public static final Class<AppUiService> RING_OF_UI = AppUiService.class;
```

The generic parameter is the facade's own type — `UiServiceFluent<AppUiService>` —
which is what makes each service chain back to `AppUiService` rather than to the base
class.

## Adding a service

The facade exposes only what your project has needed. When you start using a service
for the first time, add its shorthand here rather than reaching for the raw accessor
in a test.

Name the shorthand after the concept, not the class: `browser()` for navigation,
`validate()` for validation. A test reads better for it.

## Raw accessors

`getNavigation()`, `getInputField()`, `getButtonField()` and friends are used where
the facade is not available — inside a `BaseLoginClient`, which is generic over any
`UiServiceFluent`. See `ui-authentication.md`.

## The full service list

See `ui-services.md` for all 19 service fluents and every method each one offers.
