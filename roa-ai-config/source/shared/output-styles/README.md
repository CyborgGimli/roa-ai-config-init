# Output Styles

Output styles replace part of Claude Code's system prompt for a session. They
change how Claude *communicates*, not how the terminal renders text.

`roa-concise.md` is the ROA house style: outcome first, evidence second, no
completion claim without the command that proves it. It is selected by
`shared/settings/project-settings.json` (`"outputStyle": "ROA Concise"`) and
applied to a target repository by `/roa-base:setup`.

A user can switch styles at any time with `/output-style`.

The `name:` in the frontmatter is the display name Claude Code shows; the
filename is not. Keep the two in step when adding a style.
