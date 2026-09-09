#!/usr/bin/env node
// Project-level setup for ROA Claude Code plugins.
//
// Runs inside a TARGET repository (the repo under test automation) and turns it
// into an ROA-configured repository:
//
//   target repository
//     -> install/enable the ROA plugin (project scope)
//     -> generate CLAUDE.md managed block
//     -> generate .claude/settings.json
//     -> generate .claude/rules/*.md
//     -> generate ai-config.yaml (starter, on first run)
//     -> generate .mcp.json
//     -> reload Claude Code
//
// Everything it needs is read from generated/setup-registry.json, which is
// produced at build time by scripts/build.mjs. Build-time knowledge stays in
// the build script; this file only carries runtime behavior.
//
// Node.js built-ins only, no dependencies. Every write is idempotent: running
// setup twice converges on "unchanged".

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(SCRIPT_DIR, "..");
const REGISTRY_PATH = path.join(SKILL_ROOT, "generated", "setup-registry.json");

class SetupError extends Error {
  constructor(message) {
    super(message);
    this.name = "SetupError";
  }
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function parseArgs(args) {
  const parsed = {
    mode: "setup",
    pluginName: "",
    requestedRef: "",
  };

  for (const arg of args) {
    if (arg === "--update" || arg === "update" || arg === "mode=update") {
      parsed.mode = "update";
      continue;
    }
    if (arg === "--setup" || arg === "setup" || arg === "mode=setup") {
      parsed.mode = "setup";
      continue;
    }
    if (arg.startsWith("type=") || arg.startsWith("plugin=")) {
      parsed.pluginName = arg.split("=", 2)[1].trim();
      continue;
    }
    if (arg.startsWith("version=")) {
      parsed.requestedRef = arg.split("=", 2)[1].trim();
      continue;
    }
    if (arg.startsWith("ref=")) {
      parsed.requestedRef = arg.split("=", 2)[1].trim();
      continue;
    }
    if (arg && !arg.startsWith("-") && !parsed.pluginName) {
      parsed.pluginName = arg.trim();
      continue;
    }
    if (arg && !arg.startsWith("-") && !parsed.requestedRef) {
      parsed.requestedRef = arg.trim();
    }
  }

  if (!parsed.pluginName) {
    throw new SetupError("missing plugin name. Use: /roa-base:setup <plugin-name>");
  }
  return parsed;
}

function normalizeRequestedRef(requestedRef) {
  if (!requestedRef) {
    return "";
  }
  if (requestedRef.includes("--v") || requestedRef.includes("/") || requestedRef.includes("@")) {
    return requestedRef;
  }
  const version = requestedRef.replace(/^v/, "");
  return `v${version}`;
}

function loadSetupRegistry() {
  let data;
  try {
    data = JSON.parse(readText(REGISTRY_PATH));
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new SetupError(
        `missing generated setup registry: ${REGISTRY_PATH}. Run scripts/build.mjs and use the generated dist plugin.`
      );
    }
    if (error instanceof SyntaxError) {
      throw new SetupError(`invalid generated setup registry: ${error.message}`);
    }
    throw error;
  }

  if (!data.plugins || typeof data.plugins !== "object" || Array.isArray(data.plugins)) {
    throw new SetupError("generated setup registry must contain a plugins object");
  }
  return data.plugins;
}

function renderTemplate(templatePath, values) {
  if (!fs.existsSync(templatePath)) {
    throw new SetupError(`missing bundled template: ${templatePath}`);
  }

  let text = fs.readFileSync(templatePath, "utf8");
  for (const [key, value] of Object.entries(values)) {
    text = text.split("${" + key + "}").join(String(value));
  }
  return text.trimEnd() + "\n";
}

// Returns "created" | "updated" | "unchanged". Never rewrites identical content,
// so git, file watchers and editors stay quiet on repeated runs.
function writeIfChanged(filePath, text) {
  const old = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
  if (old === text) {
    return "unchanged";
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, "utf8");
  return old === null ? "created" : "updated";
}

// The setup script writes files and runs commands, so every registry-supplied
// path is confined to the target repository before it is used.
function resolveTargetPath(targetRoot, relativePath) {
  const resolved = path.resolve(targetRoot, relativePath);
  const relative = path.relative(targetRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new SetupError(`configured setup path escapes target repository: ${relativePath}`);
  }
  return resolved;
}

function ensureDirectory(targetRoot, directory) {
  const dirPath = resolveTargetPath(targetRoot, directory);
  if (fs.existsSync(dirPath)) {
    if (!fs.statSync(dirPath).isDirectory()) {
      throw new SetupError(`${directory} exists but is not a directory`);
    }
    return null;
  }
  fs.mkdirSync(dirPath, { recursive: true });
  return ["created", dirPath];
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Generated content lives between markers; anything outside them is repository-
// owned and is never touched.
function upsertManagedBlock(filePath, pluginName, renderedTemplate) {
  const begin = `<!-- BEGIN ROA AI CONFIG: ${pluginName} -->`;
  const end = `<!-- END ROA AI CONFIG: ${pluginName} -->`;
  const markerPattern = new RegExp(`${escapeRegExp(begin)}[\\s\\S]*?${escapeRegExp(end)}`);
  const blockMatch = renderedTemplate.match(markerPattern);

  if (!blockMatch) {
    throw new SetupError(`template for ${path.basename(filePath)} must contain managed block markers`);
  }

  const newBlock = blockMatch[0].trimEnd();
  let updated;
  if (fs.existsSync(filePath)) {
    const text = fs.readFileSync(filePath, "utf8").trimEnd();
    updated = markerPattern.test(text)
      ? text.replace(markerPattern, newBlock).trimEnd() + "\n"
      : `${text}\n\n${newBlock}\n`;
  } else {
    updated = renderedTemplate.trimEnd() + "\n";
  }

  return writeIfChanged(filePath, updated);
}

function loadSettings(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  let data;
  try {
    data = JSON.parse(readText(filePath));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new SetupError(`${filePath} is not valid JSON: ${error.message}`);
    }
    throw error;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new SetupError(`${filePath} must contain a JSON object`);
  }
  return data;
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SetupError(`${label} must be an object`);
  }
  return value;
}

function loadSettingsFragment(relativePath) {
  const fragmentPath = path.join(SKILL_ROOT, relativePath);
  if (!fs.existsSync(fragmentPath)) {
    throw new SetupError(`missing bundled settings fragment: ${fragmentPath}`);
  }

  let data;
  try {
    data = JSON.parse(readText(fragmentPath));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new SetupError(`${fragmentPath} is not valid JSON: ${error.message}`);
    }
    throw error;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new SetupError(`${fragmentPath} must contain a JSON object`);
  }
  return data;
}

function loadGeneratedJson(relativePath, label) {
  const filePath = path.join(SKILL_ROOT, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new SetupError(`missing generated ${label}: ${filePath}`);
  }

  let data;
  try {
    data = JSON.parse(readText(filePath));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new SetupError(`${filePath} is not valid JSON: ${error.message}`);
    }
    throw error;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new SetupError(`${filePath} must contain a JSON object`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Minimal YAML reader for ai-config.yaml. Dependency-free on purpose: nested
// maps, lists, scalars, inline comments, and single-line flow collections.
// ---------------------------------------------------------------------------

function stripInlineComment(content) {
  let quote = null;
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    if (quote === '"') {
      if (char === "\\") {
        index += 1;
        continue;
      }
      if (char === '"') quote = null;
      continue;
    }
    if (quote === "'") {
      if (char === "'" && content[index + 1] === "'") {
        index += 1;
        continue;
      }
      if (char === "'") quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "#" && (index === 0 || /\s/.test(content[index - 1]))) {
      return content.slice(0, index);
    }
  }
  return content;
}

function normalizeYamlLine(line, number) {
  const content = stripInlineComment(line.replace(/\t/g, "  "));
  const trimmed = content.trim();
  if (!trimmed) {
    return null;
  }
  return {
    indent: content.length - content.trimStart().length,
    text: trimmed,
    line: number,
  };
}

function parseYamlScalar(value) {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function yamlError(label, lineNumber, message) {
  return new SetupError(`${label} line ${lineNumber}: ${message}`);
}

// --- single-line flow collections -----------------------------------------

const UNTERMINATED =
  "unterminated flow collection - keep { } and [ ] on a single line";

function skipFlowSpace(state) {
  while (state.pos < state.text.length && /\s/.test(state.text[state.pos])) {
    state.pos += 1;
  }
}

function readQuotedScalar(state, label, lineNumber) {
  const quote = state.text[state.pos];
  state.pos += 1;
  let out = "";
  while (state.pos < state.text.length) {
    const char = state.text[state.pos];
    if (quote === '"' && char === "\\") {
      const next = state.text[state.pos + 1];
      if (next === undefined) break;
      out += next === "n" ? "\n" : next === "t" ? "\t" : next;
      state.pos += 2;
      continue;
    }
    if (char === quote) {
      if (quote === "'" && state.text[state.pos + 1] === "'") {
        out += "'";
        state.pos += 2;
        continue;
      }
      state.pos += 1;
      return out;
    }
    out += char;
    state.pos += 1;
  }
  throw yamlError(label, lineNumber, "unterminated quoted string");
}

function readFlowScalar(state, label, lineNumber, isKey) {
  skipFlowSpace(state);
  const char = state.text[state.pos];
  if (char === '"' || char === "'") {
    return readQuotedScalar(state, label, lineNumber);
  }
  const start = state.pos;
  while (state.pos < state.text.length) {
    const current = state.text[state.pos];
    if (current === "," || current === "}" || current === "]") break;
    if (isKey && current === ":") break;
    state.pos += 1;
  }
  const raw = state.text.slice(start, state.pos).trim();
  if (raw === "") {
    throw yamlError(
      label,
      lineNumber,
      state.pos >= state.text.length ? UNTERMINATED : "empty entry in a flow collection"
    );
  }
  return parseYamlScalar(raw);
}

function readFlowMap(state, label, lineNumber) {
  state.pos += 1; // consume "{"
  const result = {};
  skipFlowSpace(state);
  if (state.text[state.pos] === "}") {
    state.pos += 1;
    return result;
  }
  for (;;) {
    const key = String(readFlowScalar(state, label, lineNumber, true));
    skipFlowSpace(state);
    if (state.text[state.pos] !== ":") {
      throw yamlError(label, lineNumber, `expected ":" after flow key ${JSON.stringify(key)}`);
    }
    state.pos += 1;
    result[key] = readFlowNode(state, label, lineNumber);
    skipFlowSpace(state);
    const next = state.text[state.pos];
    if (next === "}") {
      state.pos += 1;
      return result;
    }
    if (next !== ",") {
      throw yamlError(label, lineNumber, UNTERMINATED);
    }
    state.pos += 1;
    skipFlowSpace(state);
    if (state.text[state.pos] === "}") {
      state.pos += 1;
      return result;
    }
  }
}

function readFlowSequence(state, label, lineNumber) {
  state.pos += 1; // consume "["
  const result = [];
  skipFlowSpace(state);
  if (state.text[state.pos] === "]") {
    state.pos += 1;
    return result;
  }
  for (;;) {
    result.push(readFlowNode(state, label, lineNumber));
    skipFlowSpace(state);
    const next = state.text[state.pos];
    if (next === "]") {
      state.pos += 1;
      return result;
    }
    if (next !== ",") {
      throw yamlError(label, lineNumber, UNTERMINATED);
    }
    state.pos += 1;
    skipFlowSpace(state);
    if (state.text[state.pos] === "]") {
      state.pos += 1;
      return result;
    }
  }
}

function readFlowNode(state, label, lineNumber) {
  skipFlowSpace(state);
  const char = state.text[state.pos];
  if (char === undefined) {
    throw yamlError(label, lineNumber, UNTERMINATED);
  }
  if (char === "{") return readFlowMap(state, label, lineNumber);
  if (char === "[") return readFlowSequence(state, label, lineNumber);
  return readFlowScalar(state, label, lineNumber, false);
}

function parseFlowCollection(text, label, lineNumber) {
  const state = { text, pos: 0 };
  const value = readFlowNode(state, label, lineNumber);
  skipFlowSpace(state);
  if (state.pos < state.text.length) {
    throw yamlError(
      label,
      lineNumber,
      `unexpected ${JSON.stringify(state.text.slice(state.pos))} after a flow collection`
    );
  }
  return value;
}

function parseYamlValue(rawValue, label, lineNumber) {
  const trimmed = rawValue.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return parseFlowCollection(trimmed, label, lineNumber);
  }
  return parseYamlScalar(trimmed);
}

function splitYamlKeyValue(text, label, lineNumber) {
  const index = text.indexOf(":");
  if (index <= 0) {
    throw yamlError(label, lineNumber, `expected "key: value" syntax, got ${JSON.stringify(text)}`);
  }
  return [text.slice(0, index).trim(), text.slice(index + 1).trim()];
}

function parseYamlText(text, label) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line, index) => normalizeYamlLine(line, index + 1))
    .filter(Boolean);

  function nextMeaningful(index) {
    return index < lines.length ? lines[index] : null;
  }

  function parseBlock(index, indent) {
    const current = nextMeaningful(index);
    if (!current || current.indent < indent) {
      return [{}, index];
    }
    if (current.indent !== indent) {
      throw yamlError(label, current.line, `invalid indentation near: ${current.text}`);
    }
    return current.text.startsWith("- ")
      ? parseList(index, indent)
      : parseMap(index, indent);
  }

  function parseMap(index, indent) {
    const result = {};
    while (index < lines.length) {
      const line = lines[index];
      if (line.indent < indent) break;
      if (line.indent !== indent) {
        throw yamlError(label, line.line, `invalid indentation near: ${line.text}`);
      }
      if (line.text.startsWith("- ")) break;

      const [key, rawValue] = splitYamlKeyValue(line.text, label, line.line);
      if (rawValue === "") {
        const next = nextMeaningful(index + 1);
        if (!next || next.indent <= indent) {
          result[key] = {};
          index += 1;
        } else {
          const parsed = parseBlock(index + 1, next.indent);
          result[key] = parsed[0];
          index = parsed[1];
        }
      } else {
        result[key] = parseYamlValue(rawValue, label, line.line);
        index += 1;
      }
    }
    return [result, index];
  }

  function parseList(index, indent) {
    const result = [];
    while (index < lines.length) {
      const line = lines[index];
      if (line.indent < indent) break;
      if (line.indent !== indent || !line.text.startsWith("- ")) break;

      const rest = line.text.slice(2).trim();
      if (rest === "") {
        const next = nextMeaningful(index + 1);
        if (!next || next.indent <= indent) {
          result.push(null);
          index += 1;
        } else {
          const parsed = parseBlock(index + 1, next.indent);
          result.push(parsed[0]);
          index = parsed[1];
        }
        continue;
      }

      if (rest.startsWith("{") || rest.startsWith("[")) {
        result.push(parseFlowCollection(rest, label, line.line));
        index += 1;
        continue;
      }

      if (rest.includes(":")) {
        const [key, rawValue] = splitYamlKeyValue(rest, label, line.line);
        const item = {
          [key]: rawValue === "" ? {} : parseYamlValue(rawValue, label, line.line),
        };
        const next = nextMeaningful(index + 1);
        if (next && next.indent > indent) {
          const parsed = parseMap(index + 1, next.indent);
          Object.assign(item, parsed[0]);
          index = parsed[1];
        } else {
          index += 1;
        }
        result.push(item);
      } else {
        result.push(parseYamlScalar(rest));
        index += 1;
      }
    }
    return [result, index];
  }

  if (lines.length === 0) {
    return {};
  }
  const parsed = parseBlock(0, lines[0].indent);
  return parsed[0];
}

// Secrets belong in environment variables. A key like `tokenEnv: SONAR_TOKEN`
// is a reference and is allowed; `token: abc123` is an inline secret and is not.
function containsInlineSecret(value, pathParts = []) {
  if (Array.isArray(value)) {
    return value.some((item, index) => containsInlineSecret(item, [...pathParts, String(index)]));
  }
  if (isPlainObject(value)) {
    return Object.entries(value).some(([key, item]) => {
      const lower = key.toLowerCase();
      const isSecretName =
        /(password|secret|token|apikey|api_key|privatekey|private_key)/.test(lower) &&
        !lower.endsWith("env");
      if (isSecretName && typeof item === "string" && item.trim() && !/^\$\{[^}]+\}$/.test(item.trim())) {
        return true;
      }
      return containsInlineSecret(item, [...pathParts, key]);
    });
  }
  return false;
}

// ---------------------------------------------------------------------------
// Claude CLI interaction
// ---------------------------------------------------------------------------

function findClaudeBinary() {
  const lookup = spawnSync(process.platform === "win32" ? "where.exe" : "which", ["claude"], {
    cwd: process.cwd(),
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
    candidates.push("/usr/local/bin/claude");
    candidates.push("/opt/homebrew/bin/claude");
  }
  if (process.env.USERPROFILE) {
    candidates.push(path.join(process.env.USERPROFILE, ".local", "bin", "claude.exe"));
  }

  return candidates.find((candidate) => fs.existsSync(candidate));
}

// Node refuses to spawn .cmd/.bat directly on Windows (CVE-2024-27980 mitigation),
// so batch shims must go through a shell. Args here are simple tokens, never paths.
function runClaude(claudeBinary, args, cwd) {
  return spawnSync(claudeBinary, args, {
    cwd,
    stdio: "pipe",
    encoding: "utf8",
    shell: process.platform === "win32" && /\.(cmd|bat)$/i.test(String(claudeBinary)),
  });
}

function samePath(left, right) {
  if (!left || !right) {
    return false;
  }
  return path.resolve(left).toLowerCase() === path.resolve(right).toLowerCase();
}

function listInstalledPlugins(claudeBinary, targetRoot) {
  const result = runClaude(claudeBinary, ["plugin", "list", "--json"], targetRoot);
  if (result.status !== 0 || !result.stdout.trim()) {
    return [];
  }

  try {
    const data = JSON.parse(result.stdout);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function listMarketplaces(claudeBinary, targetRoot) {
  const result = runClaude(claudeBinary, ["plugin", "marketplace", "list", "--json"], targetRoot);
  if (result.status !== 0 || !result.stdout.trim()) {
    return [];
  }

  try {
    const data = JSON.parse(result.stdout);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// `claude plugin install <plugin>@<marketplace>` resolves the marketplace from the
// user-scope registry, not from the target repo's extraKnownMarketplaces, so a
// machine that has never seen this marketplace fails with a bare
// "Plugin not found in marketplace" that says nothing about the real cause.
// Register it first.
function ensureMarketplaceRegistered(spec, targetRoot, claudeBinary) {
  const marketplaceName = spec.marketplaceName;
  if (typeof marketplaceName !== "string" || !marketplaceName) {
    return null;
  }

  const known = listMarketplaces(claudeBinary, targetRoot);
  if (known.some((entry) => entry && entry.name === marketplaceName)) {
    return null;
  }

  const source = spec.marketplaceRepo;
  if (typeof source !== "string" || !source) {
    throw new SetupError(
      `marketplace ${marketplaceName} is not registered on this machine and the registry declares no repository to add it from. Run: claude plugin marketplace add <source>`
    );
  }

  if (process.env.ROA_SETUP_NO_MARKETPLACE_ADD) {
    throw new SetupError(
      `marketplace ${marketplaceName} is not registered. Run: claude plugin marketplace add ${source}`
    );
  }

  const result = runClaude(claudeBinary, ["plugin", "marketplace", "add", source], targetRoot);
  if (result.status !== 0) {
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    throw new SetupError(
      `failed to register marketplace ${marketplaceName} from ${source}. Run it by hand: claude plugin marketplace add ${source}${output ? ` — Claude output: ${output}` : ""}`
    );
  }

  return ["registered marketplace (user scope)", `${marketplaceName} <- ${source}`];
}

// installPluginIfMissing reports one or two lines: the marketplace registration,
// when it had to happen, followed by what became of the plugin itself.
function withMarketplaceNote(registered, entry) {
  return registered ? [registered, entry] : [entry];
}

function isInstalledForProject(plugins, pluginId, targetRoot) {
  return Boolean(findProjectPlugin(plugins, pluginId, targetRoot));
}

function findProjectPlugin(plugins, pluginId, targetRoot) {
  return plugins.find((plugin) => {
    return (
      plugin &&
      plugin.id === pluginId &&
      plugin.scope === "project" &&
      samePath(plugin.projectPath, targetRoot)
    );
  });
}

// `claude plugin install` refuses to work against a marketplace entry that is
// already registered in the target settings, so the entry is pulled out for the
// duration of the call and re-added by updateSettings() afterwards.
function temporarilyRemoveMarketplace(settingsPath, marketplaceName) {
  if (!fs.existsSync(settingsPath)) {
    return null;
  }

  const originalText = readText(settingsPath);
  let data;
  try {
    data = JSON.parse(originalText);
  } catch {
    return null;
  }

  if (!isPlainObject(data.extraKnownMarketplaces) || !data.extraKnownMarketplaces[marketplaceName]) {
    return null;
  }

  delete data.extraKnownMarketplaces[marketplaceName];
  if (Object.keys(data.extraKnownMarketplaces).length === 0) {
    delete data.extraKnownMarketplaces;
  }
  fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  return originalText;
}

function restoreFile(filePath, originalText) {
  if (originalText !== null) {
    fs.writeFileSync(filePath, originalText, "utf8");
  }
}

function installPluginIfMissing(spec, targetRoot, settingsPath) {
  const install = spec.install ?? {};
  if (install.enabled === false) {
    return [["skipped plugin install", spec.enabledPlugin]];
  }
  // Testing/CI escape hatch: generate project files without invoking the Claude CLI.
  if (process.env.ROA_SETUP_SKIP_INSTALL) {
    return [["skipped plugin install (ROA_SETUP_SKIP_INSTALL)", spec.enabledPlugin]];
  }

  const enabledPlugin = spec.enabledPlugin;
  if (typeof enabledPlugin !== "string" || !enabledPlugin.includes("@")) {
    throw new SetupError("enabledPlugin must look like plugin-name@marketplace-name");
  }

  const claudeBinary = findClaudeBinary();
  if (!claudeBinary) {
    throw new SetupError(
      `Claude CLI was not found, so ${enabledPlugin} could not be installed. Install Claude Code or put claude on PATH, then re-run setup.`
    );
  }

  const registered = ensureMarketplaceRegistered(spec, targetRoot, claudeBinary);

  const installed = findProjectPlugin(listInstalledPlugins(claudeBinary, targetRoot), enabledPlugin, targetRoot);
  if (installed) {
    if (spec.pluginVersion && installed.version && installed.version !== spec.pluginVersion) {
      const originalSettings = temporarilyRemoveMarketplace(settingsPath, spec.marketplaceName);
      const updateResult = runClaude(claudeBinary, ["plugin", "update", enabledPlugin, "--scope", "project"], targetRoot);
      if (updateResult.status !== 0) {
        restoreFile(settingsPath, originalSettings);
        const output = `${updateResult.stdout ?? ""}${updateResult.stderr ?? ""}`.trim();
        throw new SetupError(
          `failed to update ${enabledPlugin} from ${installed.version} to ${spec.pluginVersion}.${output ? ` Claude output: ${output}` : ""}`
        );
      }
      return withMarketplaceNote(registered, [`updated plugin (${installed.version} -> ${spec.pluginVersion})`, enabledPlugin]);
    }
    return withMarketplaceNote(registered, ["plugin already installed", enabledPlugin]);
  }

  const scope = typeof install.scope === "string" && install.scope ? install.scope : "project";
  const originalSettings = temporarilyRemoveMarketplace(settingsPath, spec.marketplaceName);
  const result = runClaude(claudeBinary, ["plugin", "install", enabledPlugin, "--scope", scope], targetRoot);

  if (result.status !== 0) {
    restoreFile(settingsPath, originalSettings);
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    throw new SetupError(
      `failed to install ${enabledPlugin} at ${scope} scope.${output ? ` Claude output: ${output}` : ""}`
    );
  }

  return withMarketplaceNote(registered, [`installed plugin (${scope} scope)`, enabledPlugin]);
}

function enablePlugin(spec, targetRoot) {
  const enabledPlugin = spec.enabledPlugin;
  if (process.env.ROA_SETUP_SKIP_INSTALL) {
    return ["skipped plugin enable (ROA_SETUP_SKIP_INSTALL)", enabledPlugin];
  }
  const claudeBinary = findClaudeBinary();
  if (!claudeBinary) {
    return null;
  }

  const result = runClaude(claudeBinary, ["plugin", "enable", enabledPlugin, "--scope", "project"], targetRoot);
  if (result.status !== 0) {
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    if (output.toLowerCase().includes("already enabled")) {
      return ["plugin already enabled", enabledPlugin];
    }
    throw new SetupError(
      `failed to enable ${enabledPlugin}.${output ? ` Claude output: ${output}` : ""}`
    );
  }
  return ["enabled plugin", enabledPlugin];
}

// ---------------------------------------------------------------------------
// Merge helpers
// ---------------------------------------------------------------------------

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeArrayValues(existing, incoming) {
  const merged = Array.isArray(existing) ? [...existing] : [];
  const seen = new Set(merged.map((item) => JSON.stringify(item)));
  for (const item of incoming) {
    const key = JSON.stringify(item);
    if (!seen.has(key)) {
      merged.push(item);
      seen.add(key);
    }
  }
  return merged;
}

function mergeSettingsValue(existing, incoming) {
  if (Array.isArray(incoming)) {
    return mergeArrayValues(existing, incoming);
  }

  if (isPlainObject(incoming)) {
    const target = isPlainObject(existing) ? { ...existing } : {};
    for (const [key, value] of Object.entries(incoming)) {
      target[key] = mergeSettingsValue(target[key], value);
    }
    return target;
  }

  return incoming;
}

function mergeSettingsFragment(target, fragment) {
  for (const [key, value] of Object.entries(fragment)) {
    target[key] = mergeSettingsValue(target[key], value);
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepMerge(target, incoming) {
  if (!isPlainObject(incoming)) {
    return incoming;
  }
  const result = isPlainObject(target) ? { ...target } : {};
  for (const [key, value] of Object.entries(incoming)) {
    result[key] = isPlainObject(value)
      ? deepMerge(result[key], value)
      : deepClone(value);
  }
  return result;
}

// ---------------------------------------------------------------------------
// MCP catalog rendering
// ---------------------------------------------------------------------------

function pathValue(source, dottedPath) {
  let value = source;
  for (const part of String(dottedPath).split(".")) {
    if (!isPlainObject(value) && !Array.isArray(value)) {
      return undefined;
    }
    value = value[part];
    if (value === undefined) return undefined;
  }
  return value;
}

function valueAsText(value, modifier = "") {
  if (value === undefined || value === null) return "";
  if (modifier === "csv") {
    return Array.isArray(value) ? value.join(",") : String(value);
  }
  if (modifier === "json") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return value.join(",");
  }
  return String(value);
}

// `${env:tokenEnv}` becomes a literal `${SONAR_TOKEN}` in .mcp.json, so the
// secret itself is resolved by the process environment, never written to disk.
function renderMcpString(value, variables) {
  return value.replace(/\$\{([^}]+)\}/g, (match, expression) => {
    if (expression.startsWith("env:")) {
      const envName = pathValue(variables, expression.slice(4));
      return envName ? `\${${envName}}` : "";
    }
    const [name, modifier = ""] = expression.split("|", 2);
    if (pathValue(variables, name) !== undefined) {
      return valueAsText(pathValue(variables, name), modifier);
    }
    if (/^[A-Z0-9_]+(:-[^}]*)?$/.test(expression)) {
      return match;
    }
    return "";
  });
}

function renderMcpConfig(value, variables) {
  if (typeof value === "string") {
    return renderMcpString(value, variables);
  }
  if (Array.isArray(value)) {
    return value.map((item) => renderMcpConfig(item, variables));
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, renderMcpConfig(item, variables)])
        .filter(([, item]) => item !== "")
    );
  }
  return value;
}

function slugifyServerName(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "default";
}

function missingRequiredFields(required, values) {
  return required.filter((field) => {
    const value = pathValue(values, field);
    return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
  });
}

function applyMcpDefaults(config, defaults) {
  const result = { ...config };
  for (const key of ["timeout", "alwaysLoad"]) {
    if (defaults[key] !== undefined && result[key] === undefined) {
      result[key] = defaults[key];
    }
  }
  return result;
}

function shouldEnableMcpServer(definition, serverConfig, defaults) {
  if (serverConfig.enabled === false) return false;
  if (serverConfig.enabled === true) return true;
  if (defaults.enabled === false) return false;
  return definition.enabledByDefault !== false;
}

function addEnvFromConfig(config, definition, values) {
  if (!isPlainObject(definition.envFromConfig)) {
    return config;
  }
  const env = { ...(isPlainObject(config.env) ? config.env : {}) };
  for (const [envName, template] of Object.entries(definition.envFromConfig)) {
    const rendered = renderMcpString(String(template), values);
    if (rendered) {
      env[envName] = rendered;
    }
  }
  return Object.keys(env).length > 0 ? { ...config, env } : config;
}

// A definition with an `instancePath` fans out into one server entry per item
// (for example one entry per database); without it there is a single entry.
function buildMcpServerEntries(name, definition, serverConfig, defaults, warnings) {
  const enabled = shouldEnableMcpServer(definition, serverConfig, defaults);
  if (!enabled) {
    return [];
  }

  const required = Array.isArray(definition.required) ? definition.required : [];
  const instancePath = definition.instancePath;
  const entries = [];

  if (instancePath) {
    const instances = pathValue(serverConfig, instancePath);
    if (!Array.isArray(instances) || instances.length === 0) {
      warnings.push(`MCP ${name} is enabled but has no ${instancePath}; no server entry was generated.`);
      return [];
    }

    for (const item of instances) {
      const values = isPlainObject(item) ? { ...serverConfig, ...item } : { ...serverConfig, value: item };
      const missing = missingRequiredFields(required, values);
      if (missing.length > 0) {
        warnings.push(`MCP ${name} entry is missing ${missing.join(", ")}; skipped.`);
        continue;
      }
      const serverName = renderMcpString(String(definition.serverNameTemplate ?? name), values)
        .split("/")
        .map(slugifyServerName)
        .join("-");
      let config = renderMcpConfig(deepClone(definition.config ?? {}), values);
      config = applyMcpDefaults(config, defaults);
      config = addEnvFromConfig(config, definition, values);
      config = deepMerge(config, renderMcpConfig(serverConfig.overrides ?? {}, values));
      entries.push([serverName, config]);
    }
    return entries;
  }

  const missing = missingRequiredFields(required, serverConfig);
  if (missing.length > 0) {
    warnings.push(`MCP ${name} is enabled but missing ${missing.join(", ")}; skipped.`);
    return [];
  }

  let config = renderMcpConfig(deepClone(definition.config ?? {}), serverConfig);
  config = applyMcpDefaults(config, defaults);
  config = addEnvFromConfig(config, definition, serverConfig);
  config = deepMerge(config, renderMcpConfig(serverConfig.overrides ?? {}, serverConfig));
  return [[name, config]];
}

function loadMcpCatalogs(spec) {
  const servers = {};
  for (const rel of spec.mcpTemplates ?? []) {
    const catalog = loadGeneratedJson(rel, "MCP template");
    const catalogServers = requireObject(catalog.servers ?? {}, `${rel}.servers`);
    for (const [name, definition] of Object.entries(catalogServers)) {
      servers[name] = requireObject(definition, `${rel}.servers.${name}`);
    }
  }
  return servers;
}

function loadOrCreateAiConfig(targetRoot, spec) {
  const aiConfigPath = resolveTargetPath(targetRoot, "ai-config.yaml");
  if (!fs.existsSync(aiConfigPath)) {
    if (!spec.aiConfigTemplate) {
      return [{}, null, false];
    }
    const templatePath = path.join(SKILL_ROOT, spec.aiConfigTemplate);
    const template = readText(templatePath);
    writeIfChanged(aiConfigPath, template);
    return [parseYamlText(template, "ai-config.yaml"), ["created", aiConfigPath], true];
  }

  const parsed = parseYamlText(readText(aiConfigPath), "ai-config.yaml");
  if (containsInlineSecret(parsed)) {
    throw new SetupError(
      "ai-config.yaml appears to contain inline secrets. Store tokens/passwords in environment variables and reference them with fields like ${env:VAR_NAME}."
    );
  }
  return [parsed, null, false];
}

function updateProjectMcp(targetRoot, spec) {
  const catalogs = loadMcpCatalogs(spec);
  if (Object.keys(catalogs).length === 0) {
    return { changed: [], warnings: [] };
  }

  const [aiConfig, aiConfigChange, createdStarterConfig] = loadOrCreateAiConfig(targetRoot, spec);
  const mcpConfig = requireObject(aiConfig.mcp ?? {}, "ai-config.yaml.mcp");
  const defaults = requireObject(mcpConfig.defaults ?? {}, "ai-config.yaml.mcp.defaults");
  const serversConfig = requireObject(mcpConfig.servers ?? {}, "ai-config.yaml.mcp.servers");
  const warnings = [];
  const mcpServers = {};

  for (const [name, definition] of Object.entries(catalogs)) {
    const serverConfig = requireObject(serversConfig[name] ?? {}, `ai-config.yaml.mcp.servers.${name}`);
    for (const [serverName, serverValue] of buildMcpServerEntries(name, definition, serverConfig, defaults, warnings)) {
      mcpServers[serverName] = serverValue;
    }
  }

  const changed = [];
  if (aiConfigChange) {
    changed.push(aiConfigChange);
  }

  if (createdStarterConfig) {
    warnings.push("Created starter ai-config.yaml. Fill it with real non-secret repo values and rerun setup to generate .mcp.json.");
    return { changed, warnings };
  }

  if (Object.keys(mcpServers).length > 0) {
    const mcpPath = resolveTargetPath(targetRoot, ".mcp.json");
    changed.push([writeIfChanged(mcpPath, JSON.stringify({ mcpServers }, null, 2) + "\n"), mcpPath]);
  } else {
    warnings.push("No MCP servers were generated. Fill ai-config.yaml and rerun setup.");
  }

  return { changed, warnings };
}

function resolveLogFile(targetRoot) {
  const aiConfigPath = resolveTargetPath(targetRoot, "ai-config.yaml");
  if (!fs.existsSync(aiConfigPath)) {
    return "";
  }
  const parsed = parseYamlText(readText(aiConfigPath), "ai-config.yaml");
  const logs = parsed.logs;
  if (isPlainObject(logs) && typeof logs.file === "string" && logs.file.trim()) {
    return logs.file.trim();
  }
  return "";
}

function updateLogEnv(filePath, logFile) {
  if (!logFile) {
    return null;
  }
  const data = loadSettings(filePath);
  if (!isPlainObject(data.env)) {
    data.env = {};
  }
  data.env.ROA_LOG_FILE = logFile;
  return writeIfChanged(filePath, JSON.stringify(data, null, 2) + "\n");
}

function updateSettings(filePath, spec, notes = []) {
  const data = loadSettings(filePath);
  for (const fragmentPath of spec.settingsFragments ?? []) {
    mergeSettingsFragment(data, loadSettingsFragment(fragmentPath));
  }

  const marketplaceName = spec.marketplaceName;
  const enabledPlugin = spec.enabledPlugin;

  if (!data.extraKnownMarketplaces) {
    data.extraKnownMarketplaces = {};
  }
  if (typeof data.extraKnownMarketplaces !== "object" || Array.isArray(data.extraKnownMarketplaces)) {
    throw new SetupError("extraKnownMarketplaces exists but is not an object");
  }

  const previousRef = data.extraKnownMarketplaces[marketplaceName]?.source?.ref;
  if (previousRef && previousRef !== spec.marketplaceRef) {
    const alsoAffected = Object.keys(data.enabledPlugins ?? {})
      .filter((entry) => entry.endsWith(`@${marketplaceName}`) && entry !== enabledPlugin)
      .sort();
    notes.push(
      `marketplace ${marketplaceName} moves ${previousRef} -> ${spec.marketplaceRef}.` +
        (alsoAffected.length > 0
          ? ` This also repoints ${alsoAffected.join(", ")}; rerun setup for those plugins so their generated docs match.`
          : "")
    );
  }

  data.extraKnownMarketplaces[marketplaceName] = {
    source: {
      source: "github",
      repo: spec.marketplaceRepo,
      ref: spec.marketplaceRef,
    },
  };

  if (!data.enabledPlugins) {
    data.enabledPlugins = {};
  }
  if (typeof data.enabledPlugins !== "object" || Array.isArray(data.enabledPlugins)) {
    throw new SetupError("enabledPlugins exists but is not an object");
  }

  data.enabledPlugins[enabledPlugin] = true;

  return writeIfChanged(filePath, JSON.stringify(data, null, 2) + "\n");
}

function workspaceTrusted(targetRoot) {
  const home = process.env.USERPROFILE || process.env.HOME;
  if (!home) {
    return null;
  }
  const configPath = path.join(home, ".claude.json");
  if (!fs.existsSync(configPath)) {
    return null;
  }

  let data;
  try {
    data = JSON.parse(readText(configPath));
  } catch {
    return null;
  }

  const projects = data?.projects;
  if (!projects || typeof projects !== "object" || Array.isArray(projects)) {
    return null;
  }

  const key = path.resolve(targetRoot).split(path.sep).join("/");
  let entry = projects[key];
  if (!entry && process.platform === "win32") {
    const match = Object.keys(projects).find(
      (candidate) => candidate.toLowerCase() === key.toLowerCase()
    );
    entry = match ? projects[match] : undefined;
  }

  if (!entry || typeof entry !== "object") {
    return false; // never opened here, so certainly not trusted yet
  }
  return entry.hasTrustDialogAccepted === true;
}

function run(options) {
  const { pluginName, mode } = options;
  const plugins = loadSetupRegistry();
  if (!Object.hasOwn(plugins, pluginName)) {
    const available = Object.keys(plugins).sort().join(", ");
    throw new SetupError(`unknown plugin ${JSON.stringify(pluginName)}. Available plugins: ${available}`);
  }

  const spec = structuredClone(plugins[pluginName]);
  if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
    throw new SetupError(`config for ${pluginName} must be an object`);
  }
  const requestedRef = normalizeRequestedRef(options.requestedRef);
  if (mode === "update" && !requestedRef) {
    throw new SetupError(
      "missing version/ref. Use: /roa-base:update <plugin-name> <version> or ref=<plugin-ref>"
    );
  }
  if (requestedRef) {
    spec.marketplaceRef = requestedRef;
    if (spec.templateValues && typeof spec.templateValues === "object") {
      spec.templateValues.marketplace_ref = requestedRef;
    }
  }

  const targetRoot = process.cwd();
  const values = Object.fromEntries(
    Object.entries(spec.templateValues ?? {}).map(([key, value]) => [key, String(value)])
  );
  if (!values.plugin_name) {
    values.plugin_name = pluginName;
  }

  const changed = [];
  const settingsPath = resolveTargetPath(targetRoot, ".claude/settings.json");
  changed.push(...installPluginIfMissing(spec, targetRoot, settingsPath));

  for (const directory of spec.extraDirectories ?? []) {
    const result = ensureDirectory(targetRoot, directory);
    if (result) {
      changed.push(result);
    }
  }

  const claudeTemplate = renderTemplate(path.join(SKILL_ROOT, spec.claudeTemplate), values);
  changed.push([
    `${upsertManagedBlock(resolveTargetPath(targetRoot, "CLAUDE.md"), pluginName, claudeTemplate)} block`,
    resolveTargetPath(targetRoot, "CLAUDE.md"),
  ]);

  const ruleText = renderTemplate(path.join(SKILL_ROOT, spec.ruleTemplate), values);
  const rulePath = resolveTargetPath(targetRoot, spec.ruleFile);
  changed.push([
    `${upsertManagedBlock(rulePath, pluginName, ruleText)} block`,
    rulePath,
  ]);

  for (const rule of spec.rules ?? []) {
    if (!rule || typeof rule !== "object" || typeof rule.to !== "string" || typeof rule.target !== "string") {
      throw new SetupError(`invalid rule entry in registry for ${pluginName}`);
    }
    const text = renderTemplate(path.join(SKILL_ROOT, rule.to), values);
    const ruleTargetPath = resolveTargetPath(targetRoot, rule.target);
    const marker = typeof rule.marker === "string" && rule.marker ? rule.marker : rule.target;
    changed.push([
      `${upsertManagedBlock(ruleTargetPath, marker, text)} block`,
      ruleTargetPath,
    ]);
  }

  const settingsNotes = [];
  changed.push([updateSettings(settingsPath, spec, settingsNotes), settingsPath]);
  const mcpResult = updateProjectMcp(targetRoot, spec);
  changed.push(...mcpResult.changed);

  // Point the log monitor at the log file declared in ai-config.yaml (if any).
  const logFile = resolveLogFile(targetRoot);
  if (logFile) {
    const logEnvStatus = updateLogEnv(settingsPath, logFile);
    if (logEnvStatus) {
      changed.push([`${logEnvStatus} (env.ROA_LOG_FILE=${logFile})`, settingsPath]);
    }
  }

  const enabledResult = enablePlugin(spec, targetRoot);
  if (enabledResult) {
    changed.push(enabledResult);
  }

  console.log(`\n${mode === "update" ? "Updated" : "Configured"} ${pluginName} in ${targetRoot}:`);
  for (const [status, target] of changed) {
    const display = path.isAbsolute(target)
      ? path.relative(targetRoot, target).split(path.sep).join("/")
      : target;
    console.log(`- ${status}: ${display}`);
  }
  console.log();
  console.log("Next step: run /reload-plugins --force or restart Claude Code so MCP-backed plugin changes are picked up.");
  if (workspaceTrusted(targetRoot) === false) {
    console.log();
    console.log(
      "Trust this workspace, or the permissions above do not apply: Claude Code ignores\n" +
        "permissions.allow in .claude/settings.json until the repository is trusted, so you\n" +
        "will still be prompted for the commands this setup just allowed. Open Claude Code\n" +
        "interactively here once and accept the trust prompt. Skills, agents, rules and\n" +
        "hooks all work either way - only the permission allowlist is withheld."
    );
  }
  console.log(`Expected enabled plugin: ${spec.enabledPlugin}`);
  console.log(`Pinned marketplace ref: ${spec.marketplaceRef} (applies to every ${spec.marketplaceName} plugin in this repository)`);
  if (settingsNotes.length > 0) {
    console.log();
    console.log("Marketplace notes:");
    for (const note of settingsNotes) {
      console.log(`- ${note}`);
    }
  }
  if (mcpResult.warnings.length > 0) {
    console.log();
    console.log("MCP notes:");
    for (const warning of mcpResult.warnings) {
      console.log(`- ${warning}`);
    }
  }
}

// Exit-code contract: 2 for an expected setup problem with a readable message,
// anything else rethrows so programming errors are not silently swallowed.
try {
  run(parseArgs(process.argv.slice(2)));
} catch (error) {
  if (error instanceof SetupError) {
    console.error(`setup failed: ${error.message}`);
    process.exit(2);
  }
  throw error;
}
