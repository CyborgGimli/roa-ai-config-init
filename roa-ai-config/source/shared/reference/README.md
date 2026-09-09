# Reference

Upstream and superseded source material kept for comparison. **Nothing here ships.**

No `plugin-config.json` copy rule references `${shared_dir}/reference`, so the
build never places these files in `dist/`. Files are stored under their original
names with a `.SKILL.md` suffix rather than as `<dir>/SKILL.md`, so a skill
loader cannot pick them up if a copy rule is ever added by mistake.

## pandora/

`roa-pandora-metadata.SKILL.md` — the original ROA metadata skill, kept verbatim.
Superseded by the `ai-compass` skill, which carries the same 28-class
regeneration trigger list and the same JSON structure documentation, and adds
the usage-catalogue tier and both goal/field naming conventions.

Two open questions this file is parked against:

1. **Generation is not configured by anything we ship.** The skill's
   `mvn pandora:open -U` only resolves when the target repo declares the plugin
   in its own `pom.xml` — `io.cyborgcode.pandora:pandora-plugin-temp`, bound to
   `process-classes` with the `open` goal, with `basePackages` listing
   `io.cyborgcode.roa` plus the application's own package. It is not inherited
   from `roa-parent`, and `io.cyborgcode.pandora` is not a default Maven plugin
   group, so without that block the goal fails as an unknown prefix and no
   metadata is produced. Whether setup should add or check for it is undecided.

2. **Goal naming.** `ai-compass` leads with `pandora:navigation` /
   `aiCompassOptions` and treats `pandora:open` / `availableOptions` as the older
   form. Every project checked runs `open`. Which is current needs confirming
   before the docs are settled either way.

Also unsettled: `pandora-plugin-temp` at `1.0-SNAPSHOT` looks like a
work-in-progress coordinate, so nothing shipped should pin to it yet.
