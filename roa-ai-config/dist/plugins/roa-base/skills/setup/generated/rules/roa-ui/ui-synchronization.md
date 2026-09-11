<!-- BEGIN ROA AI CONFIG: roa-ui/ui-synchronization -->

# UI Synchronization

- Synchronize against observable application conditions, not elapsed time.
- Use established ROA element/component synchronization mechanisms before introducing custom waiting logic.
- Prefer the narrowest condition that proves the required element or application state is ready.
- Do not use arbitrary sleeps to hide timing or application-readiness problems.
- Do not solve local synchronization issues with unnecessarily broad global waits or inflated timeouts.
- Keep element-specific readiness with the element, reusable component behavior with the component implementation, and scenario-specific transitions with the relevant flow.
- Treat synchronization and assertion separately: readiness allows execution to continue; assertions prove required behavior.
- Ground synchronization conditions in actual runtime behavior observed through the application/DevTools.
- Investigate intermittent failures before changing waits; do not increase timing merely to obtain a passing test.
- Use `ai-compass` when exact ROA synchronization behavior or configuration is unclear.

<!-- END ROA AI CONFIG: roa-ui/ui-synchronization -->
