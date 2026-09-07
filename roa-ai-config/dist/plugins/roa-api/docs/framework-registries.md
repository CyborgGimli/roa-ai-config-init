# ROA Framework — Enum Registries

Annotations need compile-time constants, so each registry is an enum with a nested
`Data` class of string constants and a private constructor.

## DataCreator

```java
public enum DataCreator implements DataForge<DataCreator> {

    SELLER(DataCreatorFunctions::createSeller),
    ORDER(DataCreatorFunctions::createOrder);

    public static final class Data {
        public static final String SELLER = "SELLER";
        public static final String ORDER = "ORDER";

        private Data() {
        }
    }

    private final Late<Object> createDataFunction;

    DataCreator(final Late<Object> createDataFunction) {
        this.createDataFunction = createDataFunction;
    }

    @Override
    public Late<Object> dataCreator() {
        return createDataFunction;
    }

    @Override
    public DataCreator enumImpl() {
        return this;
    }
}
```

## Preconditions

```java
public enum Preconditions implements PreQuestJourney<Preconditions> {

    LOGIN_PRECONDITION((quest, objects) -> loginUser(quest, (Seller) objects[0]));

    public static final class Data {
        public static final String LOGIN_PRECONDITION = "LOGIN_PRECONDITION";

        private Data() {
        }
    }

    private final BiConsumer<SuperQuest, Object[]> function;

    Preconditions(final BiConsumer<SuperQuest, Object[]> function) {
        this.function = function;
    }

    @Override
    public BiConsumer<SuperQuest, Object[]> journey() {
        return function;
    }

    @Override
    public Preconditions enumImpl() {
        return this;
    }
}
```

The `Object[]` carries whatever `@JourneyData` supplied, in order.

## DataCleaner

```java
public enum DataCleaner implements DataRipper<DataCleaner> {

    DELETE_CREATED_ORDERS(DataCleanerFunctions::cleanAllOrders);

    public static final class Data {
        public static final String DELETE_CREATED_ORDERS = "DELETE_CREATED_ORDERS";

        private Data() {
        }
    }

    private final Consumer<SuperQuest> cleanUpFunction;

    DataCleaner(final Consumer<SuperQuest> cleanUpFunction) {
        this.cleanUpFunction = cleanUpFunction;
    }

    @Override
    public Consumer<SuperQuest> eliminate() {
        return cleanUpFunction;
    }

    @Override
    public DataCleaner enumImpl() {
        return this;
    }
}
```

## Where the implementations live

The enum holds references; the logic lives beside it in a `*Functions` class
(`DataCreatorFunctions`, `PreconditionFunctions`, `DataCleanerFunctions`). Keep the
enum a registry, not a place for behaviour.
