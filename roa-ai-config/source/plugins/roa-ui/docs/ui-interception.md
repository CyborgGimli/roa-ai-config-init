# ROA UI — Request Interception

Interception captures the network traffic a page makes, so a test can assert on it
or pull a value out of a response without adding a UI affordance for it.

## Declare the interceptor

```java
public enum RequestsInterceptor implements DataIntercept<RequestsInterceptor> {

    INTERCEPT_REQUEST_AUTH("?v-r=uidl");

    public static final class Data {
        public static final String INTERCEPT_REQUEST_AUTH = "INTERCEPT_REQUEST_AUTH";

        private Data() {
        }
    }

    private final String endpointSubString;

    RequestsInterceptor(String endpointSubString) {
        this.endpointSubString = endpointSubString;
    }

    @Override
    public String getEndpointSubString() {
        return endpointSubString;
    }

    @Override
    public RequestsInterceptor enumImpl() {
        return this;
    }
}
```

The constructor argument is a **substring** matched against request URLs. Keep it
specific enough to match one endpoint; an over-broad substring captures traffic you
did not mean to inspect.

## Enable it on a test

```java
@Test
@InterceptRequests(requestUrlSubStrings = {RequestsInterceptor.Data.INTERCEPT_REQUEST_AUTH})
void testWithInterception(Quest quest) {
    // intercepted responses are available through storage
}
```

## Reading an intercepted response

```java
String token = retrieve(
    DataExtractorsUi.responseBodyExtraction(
        RequestsInterceptor.INTERCEPT_REQUEST_AUTH.getEndpointSubString(),
        "$.token"),
    String.class);
```

The second argument is a JSONPath into the response body. See `framework-index.md`
for how storage reads work generally.

## When to use it

- Pulling a token or id the UI never displays, so a later step can use it.
- Asserting that an action actually triggered the call it was supposed to.
- Waiting on a request having settled rather than on an element appearing.

## When not to

- As a substitute for asserting what the user sees. If the requirement is that the
  screen updates, assert the screen.
- To reach into implementation detail the product does not guarantee. A test that
  asserts an internal payload shape breaks on a refactor that changed nothing users
  can observe.
