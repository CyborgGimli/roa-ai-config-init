# API — Preconditions and Test Data

## Created data, cleaned up

```java
@Test
@DisplayName("Archiving an account removes it from the active list")
@Ripper(targets = {DataCleaner.Data.DELETE_ACCOUNTS})
void archiveAccount_whenActive_removesFromActiveList(
        Quest quest,
        @Craft(model = DataCreator.Data.ACCOUNT) Account account) {

    quest
        .use(RING_OF_API)
        .requestAndValidate(ARCHIVE_ACCOUNT.withPathParam(ID_PARAM, account.getId()),
            Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build(),
            Assertion.builder().target(BODY).key(STATUS_FIELD.getJsonPath())
                     .type(IS).expected("ARCHIVED").build())
        .complete();
}
```

`@Ripper` runs even when the assertion throws. An API test that creates an account
and fails before cleaning it up otherwise poisons the next run.

## Authentication as a precondition

```java
@Test
@AuthenticateViaApi(credentials = AdminAuth.class, type = AppAuth.class, cacheCredentials = true)
void authenticatedCall(Quest quest) { … }
```

Repeating a login flow per test means a login change breaks every test at once. See
`api-authentication.md`.

## Class-level setup

Reachability checks and class-scoped cleanup belong in `@ApiHook`, not in every
test — see `api-hooks.md`.

## Choosing where setup lives

| Scope | Mechanism |
| --- | --- |
| Once per class | `@ApiHook(when = BEFORE/AFTER, …)` |
| Per test, before the body | `@Journey` |
| Per test, after — including on failure | `@Ripper` |
| Built model as a parameter | `@Craft` |

Registry detail: `framework-registries.md`.
