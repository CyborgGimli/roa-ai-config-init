# ROA UI — Insertion Service

Filling a long form field-by-field is verbose and easy to get out of order. The
insertion service drives a form from an annotated model instead.

## Annotate the model

```java
public class Order {

    @InsertionElement(locatorClass = InputFields.class,
                      elementEnum  = "CUSTOMER_FIELD",
                      order        = 1)
    private String customerName;

    @InsertionElement(locatorClass = SelectFields.class,
                      elementEnum  = "LOCATION_DDL",
                      order        = 2)
    private String location;
}
```

| Attribute | Meaning |
| --- | --- |
| `locatorClass` | the Layer 2 element enum class holding the locator |
| `elementEnum` | the constant name within that enum, as a string |
| `order` | fill order — lower first |

`elementEnum` is a string, so it is not checked by the compiler. Use the nested
`Data` constant where the API accepts one, and keep the model beside the enum it
references so a rename is visible.

## Drive the form

```java
quest.use(RING_OF_UI)
     .insertion().insertData(order)
     .drop()
     .complete();
```

## When to use it

- **Use it** for forms with several fields filled from one model, especially where
  field order matters (a dependent dropdown that only populates after an earlier
  selection).
- **Do not use it** for a one- or two-field interaction — the direct
  `.input().insert(...)` call is clearer.
- **Do not use it** to hide a form that is genuinely complicated. If order matters
  in a way `order` cannot express, write the steps out.

## Traps

- A field left null in the model is still a field the form may require. Insertion
  fills what the model carries; it does not know what the form validates.
- Changing `order` changes behaviour on dependent fields. Treat it as part of the
  test, not as formatting.
