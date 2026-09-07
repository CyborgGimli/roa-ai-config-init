# UI — Cross-Ring Tests

Drive the UI, then verify somewhere the UI cannot lie to you.

## Verify persistence

```java
@Test
@DisplayName("Saving the profile persists the display name")
@AuthenticateViaUi(credentials = AdminCredentials.class, type = AppUiLogin.class)
@Ripper(targets = {DataCleaner.Data.RESET_PROFILE})
void saveProfile_whenNameChanged_persistsToDatabase(Quest quest) {
    quest
        .use(RING_OF_UI)
        .input().insert(InputFields.DISPLAY_NAME_FIELD, "Ada Lovelace")
        .button().click(ButtonFields.SAVE)
        .alert().validateValue(AlertFields.SUCCESS, "Profile saved")
        .drop()
        .use(RING_OF_DB)
        .queryAndValidate(AppQueries.SELECT_PROFILE_BY_ID.withParam("id", userId),
            Assertion.builder().target(QUERY_RESULT).key("$[0].display_name")
                     .type(IS).expected("Ada Lovelace").build())
        .drop()
        .complete();
}
```

A success toast proves the UI reacted. It does not prove anything was stored. When
the requirement is persistence, verify persistence.

## Seed through the API, assert in the UI

```java
@Test
@DisplayName("The dashboard lists an account created through the API")
@AuthenticateViaUi(credentials = AdminCredentials.class, type = AppUiLogin.class)
@Ripper(targets = {DataCleaner.Data.DELETE_ACCOUNTS})
void dashboard_whenAccountExists_listsIt(
        Quest quest,
        @Craft(model = DataCreator.Data.ACCOUNT) Account account) {

    quest
        .use(RING_OF_API)
        .requestAndValidate(POST_CREATE_ACCOUNT, account,
            Assertion.builder().target(STATUS).type(IS).expected(SC_CREATED).build())
        .drop()
        .use(RING_OF_UI)
        .browser().navigate(getUiConfig().baseUrl() + "/accounts")
        .table().validate(Tables.ACCOUNTS,
                          Assertion.builder().contains(account.getName()).build())
        .drop()
        .complete();
}
```

Building state through the UI when it is not the thing under test makes the test
slower and gives it more ways to fail for reasons nobody cares about.

## Rules

- `.drop()` before every `.use(...)`.
- One `.complete()` at the very end, not per ring.
- Cleanup covers everything created, in whichever ring created it.
