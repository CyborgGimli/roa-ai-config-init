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

## A journey as the precondition

When the setup call is itself an API request, put it behind `@Journey` so a setup
failure reports as a setup failure:

```java
@Test
@Journey(
    value = Preconditions.Data.CREATE_USER,
    journeyData = {@JourneyData(DataCreator.Data.CREATE_USER)},
    order = 1)
@Ripper(targets = {DataCleaner.Data.DELETE_CREATED_USER})
void createdUser_isReturnedByTheApi(Quest quest) {
    quest.use(RING_OF_API)
         .validate(softAssertions -> {
             Response created = retrieve(StorageKeysApi.API, POST_CREATE_USER, Response.class);
             softAssertions.assertThat(created.getStatusCode()).isEqualTo(SC_CREATED);
         })
         .complete();
}
```

`journeyData` names the `DataCreator` models to build and pass into the journey;
omit it when the journey takes no input. `order` sequences multiple `@Journey`
annotations on the same test.

The precondition itself takes a `SuperQuest` and **does not call `.complete()`** —
the test owns the single `complete()`:

```java
public static void createUser(SuperQuest quest, CreateUserDto user) {
    quest.use(RING_OF_API)
         .requestAndValidate(POST_CREATE_USER, user,
             Assertion.builder().target(STATUS).type(IS).expected(SC_CREATED).build());
}
```

Responses stored by a journey are readable from the test exactly as if the test had
made the call — the storage is per-quest, not per-step.

## Class-level setup

Reachability checks and class-scoped cleanup belong in `@ApiHook`, not in every
test — see `api-hooks.md`. A hook's responses are *not* in `StorageKeysApi.API`;
reach them with `hookData(key, type)`.

## Choosing where setup lives

| Scope | Mechanism |
| --- | --- |
| Once per class | `@ApiHook(when = BEFORE/AFTER, …)` |
| Per test, before the body | `@Journey` |
| Per test, after — including on failure | `@Ripper` |
| Built model as a parameter | `@Craft` |

Registry detail: `framework-registries.md`.
