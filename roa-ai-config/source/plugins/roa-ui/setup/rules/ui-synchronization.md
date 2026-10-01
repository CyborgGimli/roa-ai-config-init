<!-- BEGIN ROA AI CONFIG: roa-ui/ui-synchronization -->

# UI Synchronization

- Wait on an observable condition through ROA's element and component synchronization — the element is visible or clickable, a text is present, a request completed. Never `Thread.sleep`, and never raise a timeout to get a pass.
- Keep element readiness on the element definition, component-specific waits in the component implementation, and scenario transitions in the flow.
- Take the condition from what the application actually does, observed through DevTools and network activity; investigate an intermittent wait before changing it.
- Readiness only lets the test continue; assertions prove the behavior.

<!-- END ROA AI CONFIG: roa-ui/ui-synchronization -->
