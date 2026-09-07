<!-- BEGIN ROA AI CONFIG: ${plugin_name}/three-layer -->
# Three-Layer UI Architecture

- **types** wrap a single raw element concern. Nothing above reaches past them.
- **elements** are typed, named locators built on types. Every locator lives here.
- **components** group elements and expose business actions.

Tests talk to components. A test that reaches into `types`, or that carries an
inline selector, is a layering bug and not a shortcut - fix the layer instead.
<!-- END ROA AI CONFIG: ${plugin_name}/three-layer -->
