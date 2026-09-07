# ROA Framework — Rings

A ring is a capability boundary: a fluent service that exposes one technical domain
and returns itself from every method.

## Declaring rings

```java
@UtilityClass
public class Rings {
    public static final Class<AppUiService> RING_OF_UI = AppUiService.class;
    public static final Class<RestServiceFluent> RING_OF_API = RestServiceFluent.class;
    public static final Class<DatabaseServiceFluent> RING_OF_DB = DatabaseServiceFluent.class;
    public static final Class<ZeroBankService> RING_OF_ZEROBANK = ZeroBankService.class;
}
```

## Switching

```java
quest.use(RING_OF_API)
     .request(endpoint)
     .drop()               // back to the Quest
     .use(RING_OF_DB)
     .query(query)
     .complete();
```

`.drop()` exits the current ring. Cross-ring tests are normal: drive the UI, then
verify in the database.

## Rules

- Access rings only via `quest.use()` — never instantiate a service in a test.
- Never mix responsibilities across rings.
- `drop()` before switching.

## Custom rings

Business-level actions belong in a custom ring rather than repeated in every test:

```java
@Ring("ZeroBank")
public class ZeroBankService extends FluentService {

    public ZeroBankService navigateToAccountSummary() {
        quest.use(RING_OF_UI)
             .link().click(LinkFields.ACCOUNT_SUMMARY_LINK);
        return this;
    }
}
```

Extend `FluentService` (`io.cyborgcode.roa.framework.chain`), annotate
`@Ring("Name")`, and return `this` from every method. A custom ring may orchestrate
several rings internally — that is what it is for.

## Enabling modules

Class-level annotations enable rings: `@UI`, `@API`, `@DB`. A class may carry more
than one.
