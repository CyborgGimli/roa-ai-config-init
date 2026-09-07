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
| Retry conditions | `io.cyborgcode.roa.api.retry.RetryConditionApi` |
| API config access | `static io.cyborgcode.roa.api.config.ApiConfigHolder.getApiConfig` |
| Project constants | `static {project}.constants.QueryParams.PAGE_PARAM` |

`{project}` is your own base package.
