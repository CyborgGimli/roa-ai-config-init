# DB — Cross-Ring Verification

The most common use of the DB ring, and the reason it matters even to people who
never write a database test.

## After a UI action

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

A success toast proves the UI reacted. It does not prove anything was written.

## After an API call

```java
quest.use(RING_OF_API)
     .requestAndValidate(UPDATE_PROFILE, request,
         Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build())
     .drop()
     .use(RING_OF_DB)
     .queryAndValidate(AppQueries.SELECT_PROFILE_BY_ID.withParam("id", userId),
         Assertion.builder().target(NUMBER_ROWS).type(IS).expected(1).build())
     .drop()
     .complete();
```

## Before and after comparison

Storage keeps every write, so running the same query twice lets you compare:

```java
// run the query, perform the action, run it again;
// getByIndex(key, 2, ...) reaches the earlier response
```

See `db-storage.md` and `roa-data-and-storage.md`.

## Rules

- `.drop()` before every `.use(...)`.
- One `.complete()` at the very end.
- Cleanup covers everything created, in whichever ring created it.
