# UI — Preconditions and Test Data

Most tests are not about logging in or seeding data. Push that into the lifecycle so
a setup regression fails the setup, not the behaviour under test.

## Authentication as a precondition

```java
@Test
@DisplayName("Dashboard shows the signed-in user's display name")
@AuthenticateViaUi(credentials = AdminCredentials.class, type = AppUiLogin.class)
void dashboard_whenSignedIn_showsDisplayName(Quest quest) {
    quest
        .use(RING_OF_UI)
        .browser().navigate(getUiConfig().baseUrl() + "/dashboard")
        .label().validateValue(LabelFields.DISPLAY_NAME, "Ada Lovelace")
        .drop()
        .complete();
}
```

See `ui-authentication.md` for the credentials and login client behind the annotation.

## Data created and cleaned up

```java
@Test
@DisplayName("An archived project disappears from the active list")
@Journey(value = Preconditions.Data.LOGIN,
         journeyData = {@JourneyData(DataCreator.Data.ADMIN)})
@Ripper(targets = {DataCleaner.Data.DELETE_PROJECTS})
void archiveProject_whenArchived_removedFromActiveList(
        Quest quest,
        @Craft(model = DataCreator.Data.PROJECT) Project project) {

    quest
        .use(RING_OF_UI)
        .browser().navigate(getUiConfig().baseUrl() + "/projects")
        .button().click(ButtonFields.ARCHIVE, project.getName())
        .table().validate(Tables.ACTIVE_PROJECTS,
                          Assertion.builder().doesNotContain(project.getName()).build())
        .drop()
        .complete();
}
```

`@Ripper` runs **even when the test fails** — the case that matters. A test that only
tidies up on success leaves the environment dirty exactly when someone is already
debugging something else.

## Seeding through a faster ring

Creating fixture state through the API is normally faster and less brittle than
driving the UI to produce it. See `ui-test-cross-ring.md`.

Registry detail: `framework-registries.md`. Annotations: `framework-lifecycle.md`.
