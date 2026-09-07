---
trigger: always_on
description: Mandatory ROA project setup requirements
---

# Project Setup Requirements

All ROA projects MUST have this structure and configuration to work with roa-ai-config.

## 1. Directory Structure

```
src/test/java/
├── {package}/
│   ├── common/
│   │   ├── base/Rings.java
│   │   ├── data/
│   │   │   ├── creator/DataCreator.java
│   │   │   ├── cleaner/DataCleaner.java
│   │   │   └── test_data/Constants.java
│   │   └── preconditions/Preconditions.java
│   ├── ui/
│   │   ├── types/
│   │   ├── elements/
│   │   └── components/
│   ├── service/
│   └── tests/
└── resources/
    └── roa-config.properties
```

## 2. pom.xml Requirements

```xml
<dependency>
  <groupId>io.cyborgcode.roa</groupId>
  <artifactId>roa-framework-core</artifactId>
  <version>[current]</version>
</dependency>
<dependency>
  <groupId>io.cyborgcode.roa</groupId>
  <artifactId>roa-ui</artifactId>
  <version>[current]</version>
</dependency>
```

Verify: `mvn clean compile` must succeed

## 3. Metadata Generation

After project setup:
```bash
mvn pandora:open -U
```

Location: `target/pandora/metadata/` contains class metadata for code generation

## 4. Configuration File

Create `src/test/resources/roa-config.properties`:
```properties
roa.ui.browser=chrome
roa.ui.headless=true
roa.ui.baseUrl=http://localhost:8080
```

---

**Next:** Run `/roa-setup` skill to validate project structure
