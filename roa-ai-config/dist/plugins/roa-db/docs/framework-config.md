# ROA Framework — Configuration and Layout

## Project setup

An ROA module inherits from `roa-parent`, which pins every ROA version and
pre-configures the compiler, surefire, the test allocator and Allure:

```xml
<parent>
    <groupId>io.cyborgcode.roa</groupId>
    <artifactId>roa-parent</artifactId>
    <version><!-- current ROA release --></version>
</parent>
```

The artifacts come from GitHub Packages, so the repository has to be declared:

```xml
<repositories>
    <repository>
        <id>github-roa-libraries</id>
        <url>https://maven.pkg.github.com/CyborgCodeSyndicate/roa-libraries</url>
        <releases><enabled>true</enabled></releases>
        <snapshots><enabled>true</enabled></snapshots>
    </repository>
</repositories>
```

Declare only the adapters the module uses, and never with a version — `roa-parent`
manages them:

| Adapter (`io.cyborgcode.roa`) | Brings |
| --- | --- |
| `ui-interactor-test-framework-adapter` | `@UI`, `RING_OF_UI` |
| `api-interactor-test-framework-adapter` | `@API`, `RING_OF_API` |
| `db-interactor-test-framework-adapter` | `@DB`, `RING_OF_DB` |

A class-level `@UI` / `@API` / `@DB` whose adapter is absent fails at bootstrap, not
at compile time.

## Property files

Configuration lives in `src/main/resources`, never in code:

```text
src/main/resources/
├── system.properties            # which config files to load
├── config-{env}.properties      # adapter and framework config per environment
└── test_data-{env}.properties   # test data per environment
```

`system.properties` is the indirection layer — it names the other files without the
`.properties` suffix:

```properties
project.packages=io.yourcompany.test.framework
ui.config.file=config-prod
api.config.file=config-prod
db.config.file=config-prod
framework.config.file=config-prod
test.data.file=test_data-prod
logFileName=logs/roa-tests.log
extended.logging=false
```

| Key | Purpose |
| --- | --- |
| `project.packages` | root package(s) ROA scans for rings, elements, endpoints and hooks; `;`-separated for more than one |
| `ui.config.file` | file behind `getUiConfig()` and `UiFrameworkConfig` |
| `api.config.file` | file behind `getApiConfig()` |
| `db.config.file` | file behind `getDbConfig()` |
| `framework.config.file` | file behind `FrameworkConfig` — `default.storage`, `test.env` |
| `test.data.file` | file behind the project's own `DataProperties` |
| `logFileName` | log destination |
| `extended.logging` | verbose framework logging |

`project.packages` is the one that silently breaks everything: it feeds the Spring
component scan, so a wrong or missing value shows up as an implementation or ring
that "cannot be found" at runtime while compiling cleanly.

Every config interface loads `system:properties` first and the file second, so any
key can be overridden on the command line — `-Dui.base.url=…`, `-Dheadless=true`.

The per-module keys are documented with their modules: `ui-config.md`,
`api-config.md`, `db-config.md`.

## Environments

Add one `config-{env}.properties` per environment and select it with a Maven
profile:

```xml
<profile>
    <id>staging</id>
    <properties>
        <ui.config.file>config-staging</ui.config.file>
        <api.config.file>config-staging</api.config.file>
        <db.config.file>config-staging</db.config.file>
    </properties>
</profile>
```

Never hardcode a URL, credential, port or environment name. A literal ties the suite
to one environment; a literal credential is a leak.

## Test data

Test data is OWNER-backed like the rest, through an interface the project owns:

```java
@Config.LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({"system:properties", "classpath:${test.data.file}.properties"})
public interface DataProperties extends PropertyConfig {

    @Key("username")
    String username();

    @Key("password")
    String password();
}

// access
Data.testData().username();
```

`Data` is a final class wrapping `ConfigCache.getOrCreate(DataProperties.class)`, so
the file is read once per run. Extend `PropertyConfig`, not `Config` — the sources
annotation and the `${test.data.file}` placeholder are what make the file swappable
per environment.

## Static data

```java
public class StaticData implements StaticDataProvider {
    public static final String USERNAME = "username";

    @Override
    public Map<String, Object> staticTestData() {
        return Map.of(USERNAME, Data.testData().username());
    }
}
```

Loaded by `@StaticTestData(StaticData.class)`.

## Parallel execution

`BaseQuest` is parallel-safe because storage is thread-local. Parallelism itself is
a JUnit setting, in `src/test/resources/junit-platform.properties`:

```properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
```

Pin the degree of parallelism when the environment cannot take an unbounded one:

```properties
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=5
```

A class extending `BaseQuestSequential` shares one Quest across its tests and is not
a candidate for concurrent methods.

## Reporting

Allure ships with the adapters and is wired by `roa-parent`; no test code calls it.
Every fluent step is reported, and the adapters attach what they did — request and
response for API, executed SQL for DB, and screenshots for UI. Screenshots on
failure are automatic; `screenshot.on.passed.test=true` adds them for passing tests
as well.

## Project layout

```text
src/main/java/
├── base/Rings.java                     # ring class constants
├── data/
│   ├── creator/{DataCreator,DataCreatorFunctions}.java
│   ├── cleaner/{DataCleaner,DataCleanerFunctions}.java
│   ├── extractor/DataExtractorFunctions.java
│   └── test_data/{Data,DataProperties,StaticData}.java
├── preconditions/{Preconditions,PreconditionFunctions}.java
├── service/CustomService.java          # custom fluent rings
├── ui/                                 # types/, elements/, components/
├── api/                                # AppEndpoints, dto/, extractors/, hooks/
└── db/                                 # queries, DbType

src/main/resources/
├── system.properties
├── config-{env}.properties
└── test_data-{env}.properties

src/test/java/
└── <module>/                           # ui/, api/, db/ — mirror the source layout
```

## Quality gates

```bash
mvn clean compile
mvn test -Pe2e -Dtest=YourTestClass
mvn clean install
mvn pandora:navigation -U      # after changing ROA implementations
```

See `quality-gates.md` for the evidence format.
