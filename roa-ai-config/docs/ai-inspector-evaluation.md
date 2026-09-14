# Evaluating the ROA AI config with ai-inspector

How the `evaluate-ai` scores were produced, what has to be merged upstream so the
setup no longer depends on local snapshots, and how to reproduce a run on another
machine.

## What is being measured

`io.cyborgcode.pandora.plugins:ai-inspector-maven-plugin:evaluate-ai` runs every prompt
of a dataset through `claude -p` inside the evaluated project, asks for a plan-only
`CodeChangeSet` JSON, then implements that JSON in a throwaway `git worktree`, compiles
it and scores the result against the dataset's reference change-set:

| metric | weight | what it compares |
|---|---|---|
| similarity | 0.4 | embedding similarity of matched change code |
| structural | 0.2 | `matches / (reference + generated − matches)` over `file|type|action|target` signatures |
| aiJudge | 0.2 | GPT-4o-mini answering five behaviour questions over both whole change-sets |
| compilation | 0.2 | `mvn clean compile` in the worktree after Claude implements the plan |

Every metric penalises changes the reference does not contain. The evaluated repository
must therefore be **the dataset's origin project minus the reference change-sets**; a
bare archetype makes Claude create 10+ prerequisite classes for a 4-change reference and
caps every score around 0.3–0.6 regardless of quality.

Reference numbers on the seeded `roa-ai-config-ui-api-test1` (2026-09-14, dataset from
`roa-example-inspector-ui`, `claude-sonnet-5`):

| item | weight | empty archetype | seeded repo |
|---|---|---|---|
| keep-me-signed-in | 65 | 0.398 | 0.739 |
| create-transfer-funds-form-model | 35 | 0.595 | 1.000 |
| add-button-ui-element | 10 | 0.573 | 1.000 |
| validate-forgotten-password | 50 | 0.333 | 0.600 |

## Upstream changes required (pandora-libraries)

The released `pandora-libraries-inspector-core:1.0.0` cannot evaluate Claude end to end:
the compilation check only supports `codex`, Claude's stream output is not parsed, the
prompt template makes Claude hunt for `@ExpectedAiChange` annotations, and the
structural metric zeroes out whenever the dataset's groupId differs from the evaluated
project's. The fixes live on branch **`feature/claude-evaluation`** in
`CyborgCodeSyndicate/pandora-libraries` (created locally from the tested snapshot; push
it and open a PR to `develop`). It is `develop` (`f427649`) plus four commits, 210/210
core tests green:

| commit | origin | what it does |
|---|---|---|
| `ad781ad` fixes for claude execution | cherry-pick of `30a4e87` (`evaluate-ai-claude-execution`) | `ClaudeProviderResponseExtractor` parses `--output-format json` streams (direct parse, markdown fences stripped); `{prompt_id}` substituted into the enriched prompt; judge replies have fences stripped before JSON parsing |
| `b337084` fix claude problems | cherry-pick of `9943949` (`fix-claude-problems`) | `CompilationCheckExecutor` supports `claude` (and gemini/windsurf): implementation prompt via stdin file, worktree at HEAD, reuse of the yaml `commandTemplate` |
| `07384f9` Refresh Claude prompt template | uncommitted WIP from the `fix-claude-problems` checkout | explicit read/plan/output workflow, `{prompt_id}` substituted in the template, no more annotation hunt (which returned empty change-sets) |
| `1107cc1` Match structural signatures across base packages | new | `StructuralMatchMetric` collapses `src/<set>/<root>/<package…>/File.java` to `src/<set>/<root>/**/File.java` so a dataset generated in `io.cyborgcode.inspector` scores a `com.roa.ai` project; main/test stay distinct |

Release steps once merged:

1. `pandora-libraries`: release `pandora-libraries-inspector-core` **1.0.1** (or 1.1.0) from
   `develop`.
2. `pandora-plugins`: bump `<pandora-libraries-inspector-core.version>` in
   `ai-inspector-maven-plugin/pom.xml` from `1.0.0` to the new release and release the
   plugin as **1.0.1**. No plugin code changes are needed; `develop` (`61728ce`) already
   has everything the runs used.
3. Evaluated projects: use plugin `1.0.1` and drop the `<dependencies>` override
   (see below).

Until then the local snapshot is `pandora-libraries-inspector-core:1.0.1-SNAPSHOT`,
installed from the `~/Desktop/CCS/pandora-libraries-local` worktree
(`local/claude-eval-snapshot` = the four commits + a version bump). Another machine
needs `mvn -pl pandora-libraries-inspector-core -am install` on that branch, or a zip
of the `~/.m2/repository/io/cyborgcode/pandora/ai/pandora-libraries-inspector-core/1.0.1-SNAPSHOT`
directory.

## Evaluated project layout (`roa-ai-config-ui-api-test1`)

`pom.xml`:

```xml
<plugin>
  <groupId>io.cyborgcode.pandora.plugins</groupId>
  <artifactId>ai-inspector-maven-plugin</artifactId>
  <version>1.0.0</version>
  <dependencies>            <!-- remove once plugin 1.0.1 ships with the released core -->
    <dependency>
      <groupId>io.cyborgcode.pandora.ai</groupId>
      <artifactId>pandora-libraries-inspector-core</artifactId>
      <version>1.0.1-SNAPSHOT</version>
    </dependency>
  </dependencies>
  <configuration>
    <aiInspectorConfigurationPath>${project.basedir}/src/main/resources/ai-inspector-config.yaml</aiInspectorConfigurationPath>
    <datasetPath>${project.basedir}/../ai-inspector-datasets/roa-ai-config-ui-api-test1/generated-dataset.json</datasetPath>
    <htmlReportPath>${project.build.directory}/ai-inspector-report.html</htmlReportPath>
    <jsonReportPath>${project.build.directory}/ai-inspector-report.json</jsonReportPath>
  </configuration>
</plugin>
```

- **Dataset outside the repository.** Claude reads the whole project; with
  `generated-dataset.json` inside it found the answer key and refused. Keep datasets in
  `../ai-inspector-datasets/<project>/`.
- **`.ai-inspector/no-mcp.json`** (`{"mcpServers":{}}`) is committed and referenced by
  `--strict-mcp-config --mcp-config .ai-inspector/no-mcp.json`. Without it the `swagger`
  MCP server outlives Claude and holds the stdout pipe, so the plugin waits for the full
  timeout. The implementation phase runs in a worktree at HEAD, which is why the file has
  to be committed, not just present.
- **`.gitignore`**: `.ai-inspector/embedding-cache/`, `.ai-inspector/responses/`,
  `.ai-inspector-worktrees/`.
- **Seed = origin minus reference changes.** `roa-ai-config-ui-api-test1@93397a6` ports
  `roa-example-inspector-ui` (elements, types, `*BootstrapImpl` components, models,
  services, preconditions, test data, four example test classes) into `com.roa.ai`
  with none of the four reference change-sets present. Verify a seed with a grep for
  every reference `targetId` before running.

`src/main/resources/ai-inspector-config.yaml`, the parts that matter:

```yaml
provider:
  name: claude
  invocationStrategy: command
  responsePath: .ai-inspector/responses/
  commandTemplate: "claude -p \"{PROMPT}\" --output-format json --dangerously-skip-permissions --no-session-persistence --strict-mcp-config --mcp-config .ai-inspector/no-mcp.json --model claude-sonnet-5 --verbose"
  timeoutSeconds: 1800
  pollIntervalSeconds: 10
scoring:
  weights: { similarity: 0.4, structural: 0.2, aiJudge: 0.2 }
  enableCompilationCheck: true
  compilationCheckWeight: 0.2
evaluation:
  parallelism: 1
  compileCheckCommand: mvn clean compile
  compileCheckTimeoutSeconds: 900
  worktreeBasePath: .ai-inspector-worktrees
```

`parallelism: 1` — four parallel Claude sessions each starting the MCP servers pushed
every item past a 300 s timeout in the first attempt. `enableCompilationCheck` only
works with the patched core (with 1.0.0 it throws for any provider except codex and
zeroes the weight).

## Running it

```
set OPENAI_API_KEY=...            # embeddings + AI judge
mvn ai-inspector:evaluate-ai                                   # full dataset, ~2 h
mvn ai-inspector:evaluate-ai -Dai.inspector.promptId=<id>      # one item (note: ai.inspector.promptId, not promptId)
```

Reports: `target/ai-inspector-report.{json,html}` (overwritten per run — copy them
aside); full Claude streams in `logs/interactions/<id>.log`, `implement-<id>.log`,
`compile-<id>.log`.

Known operational traps:

- **Do not let the machine sleep.** The plugin's timeout is a kernel timer that only
  counts awake time; a run that spans Modern Standby just resumes hours later.
- **Claude five-hour limit.** A full four-item run consumes ~90 % of a window on its own
  (5–7 M cached tokens per big item). A 429 shows up as `AI Provider invocation failed`
  and a 0 score for that item — rerun that item alone after the reset.
- **Killing a stuck run**: stop the `mvn` JVM *and* the `claude.exe` child; the plugin's
  `destroyForcibly` only reaches the PowerShell wrapper.
- `passedThreshold: false` in the JSON report next to a score above the threshold is a
  report quirk in the core, not a failed item.
