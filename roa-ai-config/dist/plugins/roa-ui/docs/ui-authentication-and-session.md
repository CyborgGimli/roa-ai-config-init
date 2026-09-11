# UI Authentication and Session

ROA UI automation should use the project's established authentication and browser-session mechanisms rather than duplicating login flows in every test.

This document defines UI-specific guidance for authentication setup, session reuse, browser state, and scenarios where authentication itself is under test.

## Mental Model

```text
authentication setup
        ↓
browser session state
        ↓
authenticated UI context
        ↓
test exercises business behavior
```

When authentication is supporting infrastructure, establish it through the project's ROA lifecycle.

When authentication itself is the behavior under test, the test must exercise that behavior directly.

## `@AuthenticateViaUi`

ROA supports UI authentication lifecycle behavior through mechanisms such as:

```java
@AuthenticateViaUi(...)
```

The exact annotation attributes, supported options, caching behavior, and authentication APIs must come from the repository and Pandora metadata.

Do not invent authentication configuration.

## Authentication as Infrastructure

When login is not the scenario being verified, treat authentication as test infrastructure.

Prefer:

```text
authentication lifecycle
        ↓
authenticated browser state
        ↓
test begins at required application state
```

over:

```text
every test
→ open login page
→ enter credentials
→ submit
→ wait for login
→ continue
```

when the project already provides reusable authentication support.

This improves execution speed and avoids duplicating unrelated login behavior across tests.

## Authentication as the Behavior Under Test

When the requirement concerns authentication, do not bypass it with cached or pre-established session state.

Examples may include:

* successful login;
* invalid credentials;
* logout;
* session expiration;
* access after logout;
* unauthenticated navigation;
* authentication-related redirects.

Conceptually:

```text
test requirement
→ verify login

test
→ performs actual login flow
→ validates resulting behavior
```

Supporting authentication infrastructure must not replace the behavior the test exists to prove.

## Browser Session State

Authenticated UI state may involve browser-managed data such as:

* cookies;
* local storage;
* session storage;
* application session identifiers;
* other project-supported browser state.

The exact session model is application- and project-specific.

Use actual application inspection and repository configuration to understand which state matters.

Do not assume all applications use the same browser-session mechanism.

## Session Reuse

A project may reuse authenticated browser state between appropriate test executions.

Reuse is valid only when it preserves the intended test isolation and authentication behavior.

Consider:

* user identity;
* environment;
* authorization level;
* session validity;
* browser state ownership;
* parallel execution;
* logout or invalidation behavior.

Do not reuse session state when doing so can leak identity or state between unrelated tests.

## Authentication Caching

If the project provides authentication caching, use the established mechanism rather than implementing custom static caches or manual cookie persistence.

The exact caching contract must be established from the repository and Pandora.

Do not invent cache keys, lifetimes, or session-restoration behavior.

## Application Discovery

When authentication behavior must be understood, use browser/DevTools inspection to observe:

* navigation and redirects;
* cookies;
* local storage;
* session storage;
* login-triggered requests;
* authenticated routes;
* logout behavior;
* session invalidation.

Protect sensitive values while investigating.

For application discovery, see:

`ui-application-discovery.md`

## Credentials and Secrets

Never hardcode or expose:

* usernames intended to remain private;
* passwords;
* tokens;
* session identifiers;
* API keys;
* other credentials.

Use the project's established environment, secret, or authentication configuration.

Do not print sensitive browser state into logs or test reports.

## Authorization and Authentication

Authentication and authorization are related but distinct.

Conceptually:

```text
authentication
→ who is the user?

authorization
→ what may the user access?
```

A UI scenario may require authenticated users with different permissions.

Use project-defined users, roles, or authentication abstractions where they already exist.

Do not infer authorization behavior solely from successful authentication.

## Navigation After Authentication

Authentication setup may need to establish a known post-login application state.

Do not assume that restoring session state automatically places the browser on the correct page.

The scenario should clearly separate:

```text
session establishment
→ authenticated state

navigation
→ required application location
```

Follow existing project conventions for both responsibilities.

## Session Isolation

Authentication state must not introduce hidden coupling between tests.

Avoid:

* shared mutable browser state across unrelated tests;
* one test depending on another test's login;
* reused sessions with incorrect identity;
* stale cookies;
* leftover local or session storage;
* unauthorized cross-test state reuse.

Design authentication with parallel execution in mind where relevant.

## Logout and Session Invalidation

When logout or session invalidation is part of the scenario, verify the observable application result.

Possible evidence may include:

* redirected navigation;
* loss of access to protected content;
* cleared browser state;
* rejected authenticated actions;
* application-defined logged-out state.

Do not assume which browser artifacts must disappear unless the application behavior or requirement establishes it.

## Authentication and Lifecycle

Authentication participates in the wider ROA lifecycle.

Conceptually:

```text
test data / prerequisites
        ↓
authentication
        ↓
test body
        ↓
validation
        ↓
cleanup
```

Use the lifecycle mechanism for authentication setup rather than embedding reusable authentication orchestration directly in tests.

For shared lifecycle concepts, see:

`roa-test-lifecycle.md`

## Authentication and Storage

Authentication mechanisms may produce or consume runtime state.

Use Quest storage only when authentication-related information genuinely needs to cross lifecycle or service boundaries.

Do not store sensitive authentication data unnecessarily.

For shared storage guidance, see:

`roa-data-and-storage.md`

## Repository, Application, and Pandora

Use each source for its responsibility:

```text
Existing repository
→ current authentication implementation and conventions

Actual application / DevTools
→ real browser/session behavior

Pandora
→ exact ROA authentication annotations, methods, options, and usages
```

Do not use browser inspection to invent ROA authentication APIs.

Do not use Pandora to infer application session behavior.

## AI Teacher

When new Java authentication or session-related implementation code must be created, use the `ai-teacher` skill before generating it.

AI Teacher provides project-approved implementation patterns.

Pandora remains responsible for exact ROA framework contracts.

## Core Principles

* Use the project's established UI authentication mechanism.
* Treat authentication as infrastructure unless authentication itself is under test.
* Do not bypass login behavior with cached state when login is the scenario.
* Reuse browser session state only when it preserves isolation and intended behavior.
* Do not implement custom authentication caches when the project already provides one.
* Protect credentials, tokens, cookies, and session identifiers.
* Keep authentication and navigation responsibilities distinct.
* Design session handling with parallel execution and test isolation in mind.
* Ground browser-session behavior in actual application inspection.
* Use AI Teacher before generating new Java authentication implementation code.
* Use Pandora rather than guessing exact ROA authentication behavior.

## Further Reference

For the overall ROA UI architecture:

`ui-architecture.md`

For actual browser and session discovery:

`ui-application-discovery.md`

For shared lifecycle behavior:

`roa-test-lifecycle.md`

For Quest storage and runtime state:

`roa-data-and-storage.md`

For UI scenario design and validation:

`ui-test-design.md`
