# ROA Framework — Configuration and Layout

## Configuration

Configuration is OWNER-backed:

```java
public interface DataProperties extends Config {
    String username();
    String password();
}

// access
Data.testData().username();
```

Module config has its own holder: `getUiConfig()`, `getApiConfig()`, `getDbConfig()`.

Never hardcode a URL, credential, port or environment name. A literal ties the suite
to one environment; a literal credential is a leak.

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
