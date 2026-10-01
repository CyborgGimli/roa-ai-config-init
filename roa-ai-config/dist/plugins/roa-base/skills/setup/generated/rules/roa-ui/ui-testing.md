<!-- BEGIN ROA AI CONFIG: roa-ui/ui-testing -->

# UI Testing

- Test shape: the class is `@UI` and extends `BaseQuest`; the method is named `<subject>_<action>_<expectedOutcome>` in lowerCamel segments (never `testScenario_N`, even beside numbered neighbors) and carries `@Test`, one suite marker (`@Regression`, or `@Smoke` for a genuine smoke check), and a one-phrase `@Description`; the chain starts with `quest.use(RING_OF_UI)` and ends with `.complete()`.
- Login as setup uses `@AuthenticateViaUi` with the project's credentials and login classes. Login as the behavior under test drives the form with credentials from the project's test-data class (`Data.testData()` in ROA archetype projects), never literals.
- Assert the named outcome in the element that renders it: `validate().validateTextInField(Tag.<tag of that element>, expected)` with `javax.swing.text.html.HTML.Tag` imported — never `body` or another page-wide container. Do not add an element constant only to assert a one-off message.
- Derive the expected text from the input (`"No results found for: " + term`), and keep single-use inputs and expectations as local variables.
- Add nothing the requirement did not ask for: no extra validations, `@DisplayName`, helpers, or constants.

<!-- END ROA AI CONFIG: roa-ui/ui-testing -->
