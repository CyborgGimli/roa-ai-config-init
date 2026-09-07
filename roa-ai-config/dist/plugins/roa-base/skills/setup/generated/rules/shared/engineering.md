<!-- BEGIN ROA AI CONFIG: shared/engineering -->
# Engineering Rules

Applies to all ROA test-automation code in this repository.

- Follow the three-layer architecture: `types` -> `elements` -> `components`.
  Tests talk to components. A test that reaches into `types` is a layering bug,
  not a shortcut.
- Locators belong in the element layer. Never inline a selector in a test.
- Wait through `SmartWebDriver`. `Thread.sleep` is never an acceptable wait.
- Every test that creates data removes it through a `DataCleaner`, including
  when the test fails partway.
- Read environment specifics (URLs, credentials, ports) from configuration.
  Literals tie the suite to one machine.
- Match the surrounding code's naming, structure, and comment density. New code
  should be hard to pick out from the code beside it.
- Reuse an existing component before adding a near-duplicate.
- Run `mvn pandora:open -U` after changing dependencies or the framework
  version, so `target/pandora/metadata/` reflects reality before generating.
<!-- END ROA AI CONFIG: shared/engineering -->
