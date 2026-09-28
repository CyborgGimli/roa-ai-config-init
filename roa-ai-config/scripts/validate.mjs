#!/usr/bin/env node
// Local validation helper. Uses only Node.js built-ins.
//
// Runs the build first, so validation always inspects freshly generated output
// rather than whatever happened to be left in dist/. Then checks, in order:
//   1. every generated JSON file parses
//   2. structural rules — skill/agent frontmatter, setup managed-block markers, and placeholder leaks
//   3. `claude plugin validate .` when the Claude CLI is available
//
// Structural problems are aggregated and reported together, so one run tells
// you everything that is wrong instead of failing on the first issue.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: options.capture ? "pipe" : "inherit",
    encoding: "utf8",
    shell: options.shell ?? false,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
  return result;
}

function validateJson(filePath) {
  JSON.parse(readText(path.join(ROOT, filePath)));
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function collectJsonFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectJsonFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }
  return files;
}

function findClaudeBinary() {
  const lookup = spawnSync(process.platform === "win32" ? "where.exe" : "which", ["claude"], {
    stdio: "pipe",
    encoding: "utf8",
  });
  if (lookup.status === 0) {
    const found = lookup.stdout.split(/\r?\n/).filter(Boolean);
    // On Windows, `where.exe` lists the extensionless npm shim first; that shim is a
    // shell script and cannot be spawned directly, so prefer a real executable.
    const runnable = process.platform === "win32"
      ? found.find((line) => /\.(cmd|exe|bat|ps1)$/i.test(line.trim()))
      : null;
    return (runnable ?? found[0] ?? "claude").trim();
  }

  const candidates = [];
  if (process.env.HOME) {
    candidates.push(path.join(process.env.HOME, ".local", "bin", "claude"));
  }
  if (process.env.USERPROFILE) {
    candidates.push(path.join(process.env.USERPROFILE, ".local", "bin", "claude.exe"));
  }

  return candidates.find((candidate) => fs.existsSync(candidate));
}

// Node refuses to spawn .cmd/.bat directly on Windows (CVE-2024-27980 mitigation),
// so batch shims must go through a shell. Args here are simple tokens, never paths.
function needsShell(binary) {
  return process.platform === "win32" && /\.(cmd|bat)$/i.test(String(binary));
}

// ---------------------------------------------------------------------------
// Structural checks: agent/skill frontmatter, cross-references, setup markers,
// and placeholder leaks in generated output. All failures are aggregated.
// ---------------------------------------------------------------------------

// Small YAML-frontmatter reader: enough for `key: value` pairs and simple
// `- item` lists, which is all skill and agent frontmatter uses.
function parseFrontmatter(rawText) {
  const text = rawText.replace(/\r\n/g, "\n");
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return null;
  const data = {};
  let currentKey = null;
  for (const raw of text.slice(3, end).split("\n")) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    const listItem = raw.match(/^\s+-\s+(.+)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(listItem[1].trim());
      continue;
    }
    const kv = raw.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      data[currentKey] = kv[2].trim();
    }
  }
  return data;
}

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function pluginSkillNames(pluginDir) {
  const names = new Set(
    listDirs(path.join(pluginDir, "skills")).filter((name) =>
      fs.existsSync(path.join(pluginDir, "skills", name, "SKILL.md"))
    )
  );
  const commandsDir = path.join(pluginDir, "commands");
  if (fs.existsSync(commandsDir)) {
    for (const entry of fs.readdirSync(commandsDir)) {
      if (entry.endsWith(".md")) names.add(entry.slice(0, -3));
    }
  }
  return names;
}

function checkPluginStructure(pluginDir, pluginName, problems) {
  const skillNames = pluginSkillNames(pluginDir);

  // Skills: frontmatter name must equal directory name; description required.
  for (const skillDir of listDirs(path.join(pluginDir, "skills"))) {
    const skillPath = path.join(pluginDir, "skills", skillDir, "SKILL.md");
    if (!fs.existsSync(skillPath)) {
      problems.push(`${pluginName}: skills/${skillDir}/ has no SKILL.md`);
      continue;
    }
    const fm = parseFrontmatter(readText(skillPath));
    if (!fm) {
      problems.push(`${pluginName}: skills/${skillDir}/SKILL.md has no frontmatter`);
      continue;
    }
    if (fm.name !== skillDir) {
      problems.push(`${pluginName}: skills/${skillDir}/SKILL.md frontmatter name ${JSON.stringify(fm.name)} != directory name`);
    }
    if (!fm.description) {
      problems.push(`${pluginName}: skills/${skillDir}/SKILL.md is missing a description`);
    }
  }

  // Agents: frontmatter name must equal basename; description required;
  // every preloaded skill must exist in this plugin.
  const agentsDir = path.join(pluginDir, "agents");
  if (fs.existsSync(agentsDir)) {
    for (const entry of fs.readdirSync(agentsDir)) {
      if (!entry.endsWith(".md")) continue;
      const base = entry.slice(0, -3);
      const fm = parseFrontmatter(readText(path.join(agentsDir, entry)));
      if (!fm) {
        problems.push(`${pluginName}: agents/${entry} has no frontmatter`);
        continue;
      }
      if (fm.name !== base) {
        problems.push(`${pluginName}: agents/${entry} frontmatter name ${JSON.stringify(fm.name)} != file basename`);
      }
      if (!fm.description) {
        problems.push(`${pluginName}: agents/${entry} is missing a description`);
      }
      const agentSkills = Array.isArray(fm.skills) ? fm.skills : [];
      for (const skillName of agentSkills) {
        if (!skillNames.has(skillName)) {
          problems.push(`${pluginName}: agents/${entry} preloads skill ${JSON.stringify(skillName)} which does not exist in this plugin`);
        }
      }
    }
  }
}

function renderPlaceholders(text, values) {
  let rendered = text;
  for (const [key, value] of Object.entries(values)) {
    rendered = rendered.split("${" + key + "}").join(String(value));
  }
  return rendered;
}

// Managed blocks are how setup.mjs updates a target repo without destroying
// user content, so a template missing its markers would silently break updates.
function checkSetupRegistry(problems) {
  const setupRoot = path.join(ROOT, "dist", "plugins", "roa-base", "skills", "setup");
  const registryPath = path.join(setupRoot, "generated", "setup-registry.json");
  if (!fs.existsSync(registryPath)) {
    problems.push("missing generated setup registry");
    return;
  }
  const registry = JSON.parse(readText(registryPath)).plugins ?? {};

  for (const [pluginName, spec] of Object.entries(registry)) {
    const values = { plugin_name: pluginName, ...(spec.templateValues ?? {}) };
    const markerTargets = [
      { file: spec.ruleTemplate, marker: pluginName, label: "ruleTemplate" },
      { file: spec.claudeTemplate, marker: pluginName, label: "claudeTemplate" },
      ...(spec.rules ?? []).map((rule) => ({ file: rule.to, marker: rule.marker, label: `rule ${rule.target}` })),
    ];
    for (const { file, marker, label } of markerTargets) {
      const filePath = path.join(setupRoot, file);
      if (!fs.existsSync(filePath)) {
        problems.push(`setup registry ${pluginName}: ${label} file is missing: ${file}`);
        continue;
      }
      const rendered = renderPlaceholders(readText(filePath), values);
      const begin = `<!-- BEGIN ROA AI CONFIG: ${marker} -->`;
      const endMark = `<!-- END ROA AI CONFIG: ${marker} -->`;
      if (!rendered.includes(begin) || !rendered.includes(endMark)) {
        problems.push(`setup registry ${pluginName}: ${label} (${file}) is missing managed-block markers for ${JSON.stringify(marker)}`);
      }
    }
  }
}

// An unresolved ${placeholder} in shipped output means a build-time value was
// never supplied. Files under skills/setup/generated are exempt: those keep
// their placeholders deliberately and are rendered by setup.mjs in the target repo.
function checkPlaceholderLeaks(problems) {
  const distPlugins = path.join(ROOT, "dist", "plugins");
  const runtimeRendered = path.join("skills", "setup", "generated");

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!/\.(md|json)$/.test(entry.name)) continue;
      if (fullPath.includes(runtimeRendered)) continue; // rendered at setup runtime
      const leaks = readText(fullPath).match(/\$\{[a-z][a-z0-9_]*\}/g);
      if (leaks) {
        problems.push(`placeholder leak in ${path.relative(ROOT, fullPath)}: ${[...new Set(leaks)].join(", ")}`);
      }
    }
  }

  if (fs.existsSync(distPlugins)) walk(distPlugins);
}

function markdownFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) markdownFiles(fullPath, files);
    else if (entry.name.endsWith(".md")) files.push(fullPath);
  }
  return files;
}

function pluginAgentNames(pluginDir) {
  const agentsDir = path.join(pluginDir, "agents");
  if (!fs.existsSync(agentsDir)) return new Set();
  return new Set(
    fs.readdirSync(agentsDir).filter((entry) => entry.endsWith(".md")).map((entry) => entry.slice(0, -3))
  );
}

// Workflow text names agents and skills by `<plugin>:<name>` and points at plugin
// docs. A typo there does not fail anything at runtime — the model just improvises
// — so every reference is resolved here instead.
function checkCrossReferences(distPlugins, problems) {
  const plugins = listDirs(distPlugins);
  const index = Object.fromEntries(
    plugins.map((name) => {
      const dir = path.join(distPlugins, name);
      return [name, { skills: pluginSkillNames(dir), agents: pluginAgentNames(dir), dir }];
    })
  );

  for (const plugin of plugins) {
    const { dir } = index[plugin];
    const docsDir = path.join(dir, "docs");

    for (const file of [...markdownFiles(path.join(dir, "skills")), ...markdownFiles(path.join(dir, "agents"))]) {
      if (file.includes(`${path.sep}generated${path.sep}`)) continue; // rendered in the target repo
      const rel = `${plugin}/${path.relative(dir, file).split(path.sep).join("/")}`;
      const text = readText(file);

      for (const match of text.matchAll(/subagent_type:\s*([a-z0-9-]+):([a-z0-9-]+)/g)) {
        const [, owner, agent] = match;
        if (!index[owner]?.agents.has(agent)) {
          problems.push(`${rel}: subagent_type ${owner}:${agent} does not exist`);
        }
      }

      for (const match of text.matchAll(/`([a-z0-9-]+):([a-z0-9-]+)`/g)) {
        const [, owner, name] = match;
        if (!index[owner]) continue; // not a plugin reference (e.g. a Maven goal)
        if (!index[owner].skills.has(name) && !index[owner].agents.has(name)) {
          problems.push(`${rel}: ${owner}:${name} is neither a skill nor an agent of ${owner}`);
        }
      }

      for (const line of text.split("\n").filter((l) => l.includes("${CLAUDE_PLUGIN_ROOT}/docs/"))) {
        for (const match of line.matchAll(/`(?:\$\{CLAUDE_PLUGIN_ROOT\}\/docs\/)?([a-z0-9-]+\.md)`/g)) {
          if (!fs.existsSync(path.join(docsDir, match[1]))) {
            problems.push(`${rel}: referenced doc docs/${match[1]} is not shipped by ${plugin}`);
          }
        }
      }

      const fm = parseFrontmatter(text) ?? {};
      if (/\bTask\b/.test(String(fm["allowed-tools"] ?? ""))) {
        problems.push(`${rel}: allowed-tools lists Task; the tool is called Agent`);
      }

      // An agent told to use MCP servers must receive them: a fixed `tools` list
      // without mcp__ entries silently strips every MCP tool from the subagent.
      if (rel.includes("/agents/") && typeof fm.tools === "string" && !fm.tools.includes("mcp__")) {
        const body = text.slice(text.indexOf("\n---", 3) + 4);
        if (/\b(MCP tools|MCP server|`swagger` MCP|`chrome-devtools`)/.test(body)) {
          problems.push(`${rel}: instructs MCP use but its tools list grants no mcp__ tools (use disallowedTools instead)`);
        }
      }
    }
  }
}

// Optional: ROA_EVAL_DATASET=<path to generated-dataset.json> fails the build when
// shipped guidance quotes the dataset's reference answers (test method names),
// which would inflate evaluation scores without improving real behavior.
function checkEvaluationLeakage(distPlugins, problems) {
  const datasetPath = process.env.ROA_EVAL_DATASET;
  if (!datasetPath) return;
  if (!fs.existsSync(datasetPath)) {
    problems.push(`ROA_EVAL_DATASET points at a missing file: ${datasetPath}`);
    return;
  }
  const answers = new Set(
    [...readText(datasetPath).matchAll(/\b[a-z][A-Za-z0-9]*_[a-z][A-Za-z0-9_]*\b/g)]
      .map((match) => match[0])
      .filter((name) => name.length >= 12)
  );
  for (const file of markdownFiles(distPlugins)) {
    const text = readText(file);
    for (const answer of answers) {
      if (text.includes(answer)) {
        problems.push(`evaluation answer ${answer} appears in ${path.relative(ROOT, file)}`);
      }
    }
  }
}

function runStructuralChecks() {
  const problems = [];
  const distPlugins = path.join(ROOT, "dist", "plugins");
  for (const pluginName of listDirs(distPlugins)) {
    checkPluginStructure(path.join(distPlugins, pluginName), pluginName, problems);
  }
  checkCrossReferences(distPlugins, problems);
  checkEvaluationLeakage(distPlugins, problems);
  checkSetupRegistry(problems);
  checkPlaceholderLeaks(problems);

  if (problems.length > 0) {
    console.error(`Structural validation failed with ${problems.length} problem(s):`);
    for (const problem of problems) {
      console.error(`- ${problem}`);
    }
    throw new Error("structural validation failed");
  }
  console.log("Structural checks passed (agents, skills, setup markers, placeholders).");
}

run(process.execPath, ["scripts/build.mjs"]);

validateJson("build-config.json");
validateJson("../.claude-plugin/marketplace.json");
for (const file of collectJsonFiles(path.join(ROOT, "dist", "plugins"))) {
  JSON.parse(readText(file));
}

runStructuralChecks();

const claudeBinary = findClaudeBinary();
if (!claudeBinary) {
  console.log("Claude CLI not found; skipped 'claude plugin validate .'");
} else {
  const marketplaceRoot = path.resolve(ROOT, "..");
  const args = ["plugin", "validate", "."];
  const useShell = needsShell(claudeBinary);
  const claude = useShell
    ? spawnSync([JSON.stringify(claudeBinary), ...args].join(" "), {
        cwd: marketplaceRoot,
        stdio: "inherit",
        encoding: "utf8",
        shell: true,
      })
    : spawnSync(claudeBinary, args, {
        cwd: marketplaceRoot,
        stdio: "inherit",
        encoding: "utf8",
      });

  if (claude.error) {
    throw claude.error;
  }
  if (claude.status !== 0) {
    throw new Error(`claude plugin validate . failed with exit code ${claude.status}`);
  }
}

console.log("Validation completed.");
