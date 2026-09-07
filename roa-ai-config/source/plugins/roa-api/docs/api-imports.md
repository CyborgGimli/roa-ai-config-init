# API — Required Imports

No wildcard imports. Import only what you use, especially for statics.

| Feature | Import |
| --- | --- |
| Base class | `io.cyborgcode.roa.framework.base.BaseQuest` |
| Quest parameter | `io.cyborgcode.roa.framework.quest.Quest` |
| `@API` | `io.cyborgcode.roa.api.annotations.API` |
| JUnit `@Test` | `org.junit.jupiter.api.Test` |
| Ring constant | `static {project}.base.Rings.RING_OF_API` |
| Endpoints | `static {project}.api.AppEndpoints.GET_ALL_USERS` |
| Endpoint contract | `io.cyborgcode.roa.api.core.Endpoint` |
| Assertion builder | `io.cyborgcode.roa.validator.core.Assertion` |
| Assertion targets | `static io.cyborgcode.roa.api.validator.RestAssertionTarget.STATUS` |
| Assertion types | `static io.cyborgcode.roa.validator.core.AssertionTypes.IS` |
| HTTP status codes | `static org.apache.http.HttpStatus.SC_OK` |
| Storage keys | `io.cyborgcode.roa.api.storage.StorageKeysApi` |
| Response type | `io.restassured.response.Response` |
| `@Craft` | `io.cyborgcode.roa.framework.annotation.Craft` |
| `@Journey` / `@JourneyData` | `io.cyborgcode.roa.framework.annotation.Journey` / `.JourneyData` |
| `@Ripper` | `io.cyborgcode.roa.framework.annotation.Ripper` |
| Late initialisation | `io.cyborgcode.roa.framework.parameters.Late` |
| Auth annotation | `io.cyborgcode.roa.api.annotations.AuthenticateViaApi` |
| Credentials contract | `io.cyborgcode.roa.api.authentication.Credentials` |
| Base auth client | `io.cyborgcode.roa.api.authentication.BaseAuthenticationClient` |
| Hooks annotation | `io.cyborgcode.roa.api.annotations.ApiHook` |
| Hook execution enum | `io.cyborgcode.roa.framework.hooks.HookExecution` |
| Retry conditions | `static io.cyborgcode.roa.api.retry.RetryConditionApi.statusEquals` |
| Retry contract | `io.cyborgcode.roa.framework.retry.RetryCondition` |
| API config access | `static io.cyborgcode.roa.api.config.ApiConfigHolder.getApiConfig` |
| Project constants | `static {project}.constants.QueryParams.PAGE_PARAM` |
| JSONPath registry | `static {project}.api.extractors.ApiResponsesJsonPaths.TOKEN` |

`{project}` is your own base package.

## Project-side support code

Needed in hook functions, authentication clients, preconditions, and cleaners — not
in tests.

| Feature | Import |
| --- | --- |
| Non-Quest executor | `io.cyborgcode.roa.api.service.RestService` |
| Response extractors | `static io.cyborgcode.roa.api.storage.DataExtractorsApi.responseBodyExtraction` |
| Extractor contract | `io.cyborgcode.roa.framework.storage.DataExtractor` |
| Assertion results | `io.cyborgcode.roa.validator.core.AssertionResult` |
| Hook flow contract | `io.cyborgcode.roa.api.hooks.ApiHookFlow` |
| Hook flow function type | `org.apache.logging.log4j.util.TriConsumer` |
| Auth header type | `io.restassured.http.Header` |
| Precondition/cleaner quest | `io.cyborgcode.roa.framework.quest.SuperQuest` |
| Data registries | `io.cyborgcode.roa.framework.parameters.DataForge` / `.DataRipper` / `.PreQuestJourney` |
| Framework logging | `io.cyborgcode.roa.api.log.LogApi` |
