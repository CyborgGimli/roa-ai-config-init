# API — Cross-Ring Tests

## Verify persistence, not just the response

```java
@Test
@DisplayName("Updating a profile persists the new display name")
@Ripper(targets = {DataCleaner.Data.RESET_PROFILE})
void updateProfile_whenNameChanged_persists(Quest quest) {
    quest
        .use(RING_OF_API)
        .requestAndValidate(UPDATE_PROFILE, new UpdateProfileRequest("Ada Lovelace"),
            Assertion.builder().target(STATUS).type(IS).expected(SC_OK).build())
        .drop()
        .use(RING_OF_DB)
        .queryAndValidate(AppQueries.SELECT_PROFILE_BY_ID.withParam("id", userId),
            Assertion.builder().target(QUERY_RESULT).key("$[0].display_name")
                     .type(IS).expected("Ada Lovelace").build())
        .drop()
        .complete();
}
```

A 200 proves the endpoint accepted the request. When the requirement is that the
value is stored, read it back.

## Seeding for a UI test

```java
quest.use(RING_OF_API)
     .requestAndValidate(POST_CREATE_ACCOUNT, account,
         Assertion.builder().target(STATUS).type(IS).expected(SC_CREATED).build())
     .drop()
     .use(RING_OF_UI)
     .browser().navigate(getUiConfig().baseUrl() + "/accounts")
     .drop()
     .complete();
```

The API is the fastest way to put the system into the state a UI test needs.

## Chaining within the ring

Reading a value from one response to use in the next is a different pattern — see
`api-storage.md`. Chain when the test is *about* the sequence; use a precondition
when the earlier call is only setup.

## Rules

- `.drop()` before every `.use(...)`.
- One `.complete()` at the very end.
- Cleanup covers everything created, in whichever ring created it.
