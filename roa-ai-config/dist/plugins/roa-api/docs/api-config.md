# API — Configuration

The API adapter reads `${api.config.file}.properties` (named in `system.properties`)
merged over system properties, so every key can be overridden with `-Dkey=value`.
The file layout and the `system.properties` indirection are in `framework-config.md`.

Values are reached through `getApiConfig()`; never read a property directly in a test.

## Keys

| Key | Default | Meaning |
| --- | --- | --- |
| `api.base.url` | — | base URL every `Endpoint` is resolved against |
| `api.restassured.logging.enabled` | `true` | log request and response |
| `api.restassured.logging.level` | `ALL` | RestAssured log level — `ALL`, `BASIC`, `NONE` |
| `log.full.body` | `true` | log the whole body; `false` truncates to `shorten.body` |
| `shorten.body` | `1000` | characters kept when a body is truncated |

`api.base.url` is why an `Endpoint` carries a path and not a URL. A host in an
endpoint constant is a bug — it survives exactly until the suite is pointed at
another environment.

Turn logging down for a large regression run and up while diagnosing; a suite that
logs every body at `ALL` produces reports too large to open. Truncation is the
middle setting: `log.full.body=false` with a `shorten.body` big enough to show the
part you care about.

## Example

```properties
project.packages=io.yourcompany.test.framework

api.base.url=https://api.example.com

api.restassured.logging.enabled=true
api.restassured.logging.level=ALL

shorten.body=100000
```

## Environments

One `config-{env}.properties` per environment, selected by a Maven profile or
`-Dapi.config.file=config-staging`. Credentials belong in
`test_data-{env}.properties` behind `DataProperties`, not here.
