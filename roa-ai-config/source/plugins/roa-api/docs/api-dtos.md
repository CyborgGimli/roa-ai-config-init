# API — Request and Response DTOs

Typed models keep request bodies structured and response mapping clean. An untyped
map accepts anything and defers the failure to an assertion, where it is much harder
to read.

## Request DTO

```java
@Data
@Builder
public class CreateUserDto {
    private String name;
    private String job;
}
```

## Response DTO

```java
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GetUsersDto {

    private int page;
    private int total;

    @JsonProperty("_meta")
    private MetaDto meta;
}
```

## Guidelines

- Lombok `@Data` / `@Builder` for brevity.
- **Response DTOs must tolerate extra fields** — `@JsonIgnoreProperties(ignoreUnknown = true)`.
  Without it, an unrelated additive field on the API breaks every test that maps the
  response.
- `@JsonProperty` when the API key does not match Java naming (`_meta`, `created_at`).
- Keep DTOs in `api/dto/`. They are models, not helpers — no request logic inside.

## Mapping a stored response

```java
Response response = retrieve(StorageKeysApi.API, GET_ALL_USERS, Response.class);
GetUsersDto users = response.getBody().as(GetUsersDto.class);
```
