# Plugin Dependencies

How ROA plugins depend on each other and on plugins from other marketplaces.

## Declaring a dependency

In `source/plugins/<name>/plugin-config.json`:

```json
"dependencies": ["roa-base"]
```

or, for a plugin in another marketplace:

```json
"dependencies": [
  { "name": "security-guidance", "marketplace": "claude-plugins-official" }
]
```

A version may be pinned:

```json
{ "name": "security-guidance", "marketplace": "claude-plugins-official", "version": "1.2.0" }
```

## What the build does with them

`scripts/build.mjs` orders plugins by their **local** dependencies — entries that
name a plugin in this marketplace. An entry carrying a `marketplace` field points
outside and is ignored for build ordering.

A dependency cycle is a build error:

```text
build failed: cycle in plugin dependencies involving roa-base
```

## Cross-marketplace installs

Installing a plugin also installs its declared dependencies. For a dependency in
another marketplace, that marketplace must be allow-listed in `build-config.json`:

```json
"marketplace": {
  "allowCrossMarketplaceDependenciesOn": ["claude-plugins-official"]
}
```

The build copies this into the generated `.claude-plugin/marketplace.json`.

## Uninstalling

Uninstalling a plugin does **not** remove what it auto-installed. To also drop
dependencies nothing else needs:

```bash
claude plugin uninstall roa-ui --prune
```

## Versioning

Releases are tagged `v{version}`, once for the whole marketplace:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The tag covers every plugin, because a target repository pins a marketplace, not
a plugin: `.claude/settings.json` holds one `extraKnownMarketplaces` entry per
marketplace name, carrying one ref. A per-plugin tag scheme cannot be honoured
there — whichever plugin ran `/roa-base:setup` last would silently repoint the
others — so `build.mjs` rejects a configuration whose plugins disagree on
`setup.marketplaceRef`.

Refs in the retired `{plugin-name}--v{version}` form are still accepted by
`/roa-base:setup` and `/roa-base:update` so repositories pinned by an older
setup can be moved forward, but new pins use `v{version}`.

All plugins in this marketplace share one version. Bump them together:

```bash
npm run bump-version -- patch    # or minor / major
npm run build
npm run validate
```

`bump-version.mjs` refuses to run when the plugin versions have drifted apart —
that state means an earlier bump half-failed, and guessing which version is
authoritative would make it worse.

The pinned ref reaches a target repository through the setup registry, so
`/roa-base:update roa-ui 1.3.0` rewrites both the marketplace ref in
`.claude/settings.json` and the generated managed blocks.
