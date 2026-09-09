#!/usr/bin/env node
// Build ROA Claude Code marketplace plugins from source using only Node.js built-ins.
//
// A small, safety-conscious compiler: it reads plugin configuration and source
// assets, resolves dependencies and placeholders, assembles self-contained
// plugins under dist/, embeds setup knowledge into roa-base, merges hook/MCP
// definitions, generates the marketplace catalog, and rejects invalid or unsafe
// configurations before publishing the result.
//
// It is configuration-driven: this file contains no hardcoded list of UI, API or
// DB files. Each plugin's plugin-config.json declares its own copy/render/
// mergeHooks/mergeMcp/executable/setup operations, so a new plugin is added by
// creating source/plugins/<name>/plugin-config.json — not by editing this script.
//
// High-level flow:
//    1. Load build-config.json
//    2. Discover source/plugins/*/plugin-config.json
//    3. Validate plugin names and dependencies
//    4. Order plugins by local dependencies
//    5. Build a setup registry
//    6. Delete/recreate dist/plugins
//    7. Build every plugin
//    8. Copy setup assets into roa-base
//    9. Validate the generated setup assets
//   10. Generate marketplace.json
//   11. Print success

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUILD_CONFIG_PATH = path.join(ROOT, "build-config.json");

class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigError";
  }
}

function fail(message) {
  throw new ConfigError(message);
}

// Every configured path is confined to the repository, so a config value like
// "../../secrets" is rejected rather than read or written.
function ensureInsideRepo(candidate) {
  const resolved = path.resolve(candidate);
  const relative = path.relative(ROOT, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    fail(`path escapes repository root: ${resolved}`);
  }
}

function repoPath(value) {
  if (typeof value !== "string" || value.length === 0) {
    fail(`invalid path value: ${JSON.stringify(value)}`);
  }
  const resolved = path.resolve(ROOT, value);
  ensureInsideRepo(resolved);
  return resolved;
}

function repoRelative(candidate) {
  return path.relative(ROOT, candidate).split(path.sep).join("/");
}

// Claude Code resolves a marketplace at <checkout>/.claude-plugin/marketplace.json,
// and this package is a subdirectory of the repository, so the manifest has to be
// written to the repository root. That is the one configured path allowed to sit
// outside ROOT - and only exactly one level up, never further.
const REPO_ROOT = path.resolve(ROOT, "..");

function marketplaceManifestPath(value) {
  if (typeof value !== "string" || value.length === 0) {
    fail(`invalid path value: ${JSON.stringify(value)}`);
  }
  const resolved = path.resolve(ROOT, value);
  const relative = path.relative(REPO_ROOT, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    fail(`marketplace manifest escapes the repository: ${resolved}`);
  }
  if (
    path.basename(resolved) !== "marketplace.json" ||
    path.basename(path.dirname(resolved)) !== ".claude-plugin"
  ) {
    fail(`marketplace manifest must be named .claude-plugin/marketplace.json: ${resolved}`);
  }
  return resolved;
}

// Plugin sources in the manifest are relative to the directory that holds
// .claude-plugin, which is not necessarily this package.
function pluginSourcePrefix(marketplacePath, distRoot) {
  const marketplaceRoot = path.dirname(path.dirname(marketplacePath));
  return path.relative(marketplaceRoot, distRoot).split(path.sep).join("/");
}

function requireObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) {
    fail(`${label} must be an array`);
  }
  return value;
}

function loadJson(filePath) {
  try {
    const data = JSON.parse(readText(filePath));
    return requireObject(data, filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      fail(`missing config file: ${filePath}`);
    }
    if (error instanceof SyntaxError) {
      fail(`invalid JSON in ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

// Supports a single "*" segment, e.g. "source/plugins/*/plugin-config.json".
// Results are sorted so two developers running the build get identical output.
function discoverPluginConfigPaths(pathsConfig) {
  const pattern = pathsConfig.pluginConfigGlob ?? "source/plugins/*/plugin-config.json";
  if (typeof pattern !== "string" || pattern.length === 0) {
    fail("paths.pluginConfigGlob must be a non-empty string");
  }

  if (!pattern.includes("*")) {
    const single = repoPath(pattern);
    if (!fs.existsSync(single)) {
      fail(`no plugin configs matched ${JSON.stringify(pattern)}`);
    }
    return [single];
  }

  const firstStar = pattern.indexOf("*");
  if (pattern.indexOf("*", firstStar + 1) !== -1) {
    fail("paths.pluginConfigGlob supports one '*' segment");
  }

  const beforeStar = pattern.slice(0, firstStar).replace(/[\\\/]+$/, "");
  const afterStar = pattern.slice(firstStar + 1).replace(/^[\\\/]+/, "");
  const baseDir = repoPath(beforeStar);
  if (!fs.existsSync(baseDir) || !fs.statSync(baseDir).isDirectory()) {
    fail(`plugin config base directory does not exist: ${baseDir}`);
  }

  const matches = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(baseDir, entry.name, afterStar))
    .filter((candidate) => fs.existsSync(candidate))
    .sort((a, b) => repoRelative(a).localeCompare(repoRelative(b)));

  if (matches.length === 0) {
    fail(`no plugin configs matched ${JSON.stringify(pattern)}`);
  }

  matches.forEach((match) => ensureInsideRepo(match));
  return matches;
}

// Only dependencies inside this marketplace affect build order. A dependency
// carrying a "marketplace" field points at an external plugin and is ignored here.
function localDependencies(plugin, knownNames) {
  const deps = new Set();
  for (const dep of plugin.dependencies ?? []) {
    if (typeof dep === "string" && knownNames.has(dep)) {
      deps.add(dep);
    } else if (
      dep &&
      typeof dep === "object" &&
      !Array.isArray(dep) &&
      (dep.marketplace === undefined || dep.marketplace === null || dep.marketplace === "")
    ) {
      if (typeof dep.name === "string" && knownNames.has(dep.name)) {
        deps.add(dep.name);
      }
    }
  }
  return deps;
}

function orderPlugins(plugins) {
  const byName = new Map();
  for (const plugin of plugins) {
    const { name } = plugin;
    if (typeof name !== "string" || name.length === 0) {
      fail("each plugin config must have a non-empty name");
    }
    if (byName.has(name)) {
      fail(`duplicate plugin name: ${name}`);
    }
    byName.set(name, plugin);
  }

  const ordered = [];
  const visiting = new Set();
  const visited = new Set();
  const knownNames = new Set(byName.keys());

  function visit(name) {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      fail(`cycle in plugin dependencies involving ${name}`);
    }
    visiting.add(name);
    for (const dep of [...localDependencies(byName.get(name), knownNames)].sort()) {
      visit(dep);
    }
    visiting.delete(name);
    visited.add(name);
    ordered.push(byName.get(name));
  }

  for (const name of [...byName.keys()].sort()) {
    visit(name);
  }
  return ordered;
}

function loadPluginConfigs(pathsConfig) {
  const plugins = [];
  for (const configPath of discoverPluginConfigPaths(pathsConfig)) {
    const plugin = loadJson(configPath);
    const sourceDir = repoRelative(path.dirname(configPath));
    const folderName = path.basename(path.dirname(configPath));
    plugin._config_path = repoRelative(configPath);
    plugin._source_dir = sourceDir;

    if (typeof plugin.name !== "string" || plugin.name.length === 0) {
      fail(`${configPath} must define a non-empty plugin name`);
    }
    // Folder and declared name must agree, or the generated system becomes
    // impossible to reason about (plugin ids, refs and paths would diverge).
    if (plugin.name !== folderName) {
      fail(`${configPath} plugin name ${JSON.stringify(plugin.name)} must match folder ${JSON.stringify(folderName)}`);
    }
    plugins.push(plugin);
  }
  return orderPlugins(plugins);
}

function copyPath(src, dst) {
  if (!fs.existsSync(src)) {
    fail(`configured source path does not exist: ${src}`);
  }
  ensureInsideRepo(src);
  ensureInsideRepo(dst);
  fs.mkdirSync(path.dirname(dst), { recursive: true });

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (fs.existsSync(dst) && !fs.statSync(dst).isDirectory()) {
      fail(`cannot copy directory over file: ${dst}`);
    }
    fs.cpSync(src, dst, { recursive: true, force: true });
  } else {
    if (fs.existsSync(dst) && fs.statSync(dst).isDirectory()) {
      fail(`cannot copy file over directory: ${dst}`);
    }
    fs.copyFileSync(src, dst);
  }
}

// Plain string substitution. An undefined placeholder is left in place; the
// validate script flags leaked placeholders in generated files. Some setup
// templates keep theirs deliberately — setup.mjs renders those in the target repo.
function renderText(template, placeholders) {
  let rendered = template;
  for (const [key, value] of Object.entries(placeholders)) {
    rendered = rendered.split("${" + key + "}").join(String(value));
  }
  return rendered;
}

function renderFile(src, dst, placeholders) {
  if (!fs.existsSync(src)) {
    fail(`configured template path does not exist: ${src}`);
  }
  ensureInsideRepo(src);
  ensureInsideRepo(dst);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, renderText(fs.readFileSync(src, "utf8"), placeholders), "utf8");
}

function loadRenderedJson(src, placeholders, label) {
  if (!fs.existsSync(src)) {
    fail(`configured JSON source does not exist: ${src}`);
  }
  ensureInsideRepo(src);
  try {
    return JSON.parse(renderText(readText(src), placeholders));
  } catch (error) {
    if (error instanceof SyntaxError) {
      fail(`invalid JSON in ${label}: ${error.message}`);
    }
    throw error;
  }
}

function mergeHookConfigs(sources, description) {
  const merged = {
    description,
    hooks: {},
  };
  const descriptions = [];

  for (const { filePath, data } of sources) {
    const config = requireObject(data, filePath);
    if (typeof config.description === "string" && config.description.trim()) {
      descriptions.push(config.description.trim());
    }
    const hooks = requireObject(config.hooks ?? {}, `${filePath}.hooks`);
    for (const [eventName, groups] of Object.entries(hooks)) {
      if (!Array.isArray(groups)) {
        fail(`${filePath}.hooks.${eventName} must be an array`);
      }
      if (!merged.hooks[eventName]) {
        merged.hooks[eventName] = [];
      }
      merged.hooks[eventName].push(...groups);
    }
  }

  if (!description && descriptions.length > 0) {
    merged.description = descriptions.join(" ");
  }
  if (!merged.description) {
    delete merged.description;
  }
  return merged;
}

function writeMergedHooks(rule, outDir, placeholders, pluginName, index) {
  const from = requireArray(rule.from, `${pluginName}.mergeHooks[${index}].from`);
  const sources = from.map((sourceValue, sourceIndex) => {
    if (typeof sourceValue !== "string" || sourceValue.length === 0) {
      fail(`${pluginName}.mergeHooks[${index}].from[${sourceIndex}] must be a non-empty string`);
    }
    const filePath = repoPath(renderText(sourceValue, placeholders));
    return {
      filePath,
      data: loadRenderedJson(filePath, placeholders, repoRelative(filePath)),
    };
  });

  const to = rule.to;
  if (typeof to !== "string" || to.length === 0) {
    fail(`${pluginName}.mergeHooks[${index}].to must be a non-empty string`);
  }

  const description =
    typeof rule.description === "string"
      ? renderText(rule.description, placeholders)
      : undefined;
  const dst = path.resolve(outDir, renderText(to, placeholders));
  ensureInsideRepo(dst);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, JSON.stringify(mergeHookConfigs(sources, description), null, 2) + "\n", "utf8");
}

// Unlike hooks, MCP server names must stay unique: two catalogs defining the
// same server would silently shadow one another.
function mergeMcpConfigs(sources) {
  const merged = {
    mcpServers: {},
  };

  for (const { filePath, data } of sources) {
    const config = requireObject(data, filePath);
    const servers = requireObject(config.mcpServers ?? {}, `${filePath}.mcpServers`);
    for (const [serverName, serverConfig] of Object.entries(servers)) {
      if (Object.hasOwn(merged.mcpServers, serverName)) {
        fail(`duplicate MCP server ${JSON.stringify(serverName)} while merging ${filePath}`);
      }
      merged.mcpServers[serverName] = requireObject(
        serverConfig,
        `${filePath}.mcpServers.${serverName}`
      );
    }

    if (config.inputs !== undefined) {
      if (!Array.isArray(config.inputs)) {
        fail(`${filePath}.inputs must be an array when provided`);
      }
      merged.inputs = [...(merged.inputs ?? []), ...config.inputs];
    }
  }

  return merged;
}

function writeMergedMcp(rule, outDir, placeholders, pluginName, index) {
  const from = requireArray(rule.from, `${pluginName}.mergeMcp[${index}].from`);
  const sources = from.map((sourceValue, sourceIndex) => {
    if (typeof sourceValue !== "string" || sourceValue.length === 0) {
      fail(`${pluginName}.mergeMcp[${index}].from[${sourceIndex}] must be a non-empty string`);
    }
    const filePath = repoPath(renderText(sourceValue, placeholders));
    return {
      filePath,
      data: loadRenderedJson(filePath, placeholders, repoRelative(filePath)),
    };
  });

  const to = rule.to;
  if (typeof to !== "string" || to.length === 0) {
    fail(`${pluginName}.mergeMcp[${index}].to must be a non-empty string`);
  }

  const dst = path.resolve(outDir, renderText(to, placeholders));
  ensureInsideRepo(dst);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, JSON.stringify(mergeMcpConfigs(sources), null, 2) + "\n", "utf8");
}

function chmodExecutable(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`configured executable does not exist: ${filePath}`);
  }
  const mode = fs.statSync(filePath).mode;
  fs.chmodSync(filePath, mode | 0o111);
}

function pluginPlaceholders(marketplace, plugin, extraPlaceholders = {}) {
  const owner = requireObject(marketplace.owner, "marketplace.owner");
  const placeholders = {
    marketplace_name: marketplace.name ?? "",
    marketplace_owner: owner.name ?? "",
    marketplace_owner_email: owner.email ?? "",
    marketplace_repo: marketplace.repository ?? "",
    plugin_name: plugin.name ?? "",
    plugin_display_name: plugin.displayName ?? plugin.name ?? "",
    plugin_version: plugin.version ?? "",
    plugin_description: plugin.description ?? "",
    marketplace_version: marketplace.version ?? "",
    // One repository holds one marketplace, and a target repo pins that
    // marketplace once - .claude/settings.json has a single
    // extraKnownMarketplaces entry per marketplace name, with a single ref.
    // So the ref has to be marketplace-wide; a per-plugin ref would be
    // silently overwritten by whichever plugin was set up last.
    marketplace_ref: `v${marketplace.version ?? ""}`,
    plugin_dir: plugin._source_dir ?? `source/plugins/${plugin.name ?? ""}`,
    plugin_config_path: plugin._config_path ?? "",
    shared_dir: "source/shared",
    plugin_tags_json: JSON.stringify(plugin.tags ?? []),
    plugin_dependencies_json: JSON.stringify(plugin.dependencies ?? []),
    plugin_default_enabled_json: JSON.stringify(plugin.defaultEnabled ?? true),
    ...requireObject(plugin.placeholders ?? {}, `${plugin.name}.placeholders`),
    ...extraPlaceholders,
  };

  return Object.fromEntries(
    Object.entries(placeholders).map(([key, value]) => [key, String(value)])
  );
}

function cleanDist(distRoot) {
  ensureInsideRepo(distRoot);
  if (fs.existsSync(distRoot)) {
    try {
      fs.rmSync(distRoot, { recursive: true, force: true });
    } catch (error) {
      // On Windows an editor or antivirus can hold a handle on dist/. Overwriting
      // in place still produces a correct build, so warn instead of aborting.
      if (error.code !== "EPERM" && error.code !== "EBUSY") {
        throw error;
      }
      console.warn(
        `Warning: ${repoRelative(distRoot)} is locked by another process; overwriting generated files in place.`
      );
    }
  }
  fs.mkdirSync(distRoot, { recursive: true });
}

function renderConfigValue(value, placeholders) {
  if (typeof value === "string") {
    return renderText(value, placeholders);
  }
  if (Array.isArray(value)) {
    return value.map((item) => renderConfigValue(item, placeholders));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, renderConfigValue(item, placeholders)])
    );
  }
  return value;
}

// Produces the runtime contract consumed by roa-base's setup.mjs: one entry per
// setup-enabled plugin, with every path already resolved relative to the skill root.
function buildSetupRegistry(config) {
  const marketplace = requireObject(config.marketplace, "marketplace");
  const registry = {};
  const plugins = requireArray(config.plugins, "plugins").map((item) => requireObject(item, "plugins[]"));

  for (const plugin of plugins) {
    const setupValue = plugin.setup;
    if (setupValue === undefined || setupValue === null) continue;
    const setup = requireObject(setupValue, `${plugin.name}.setup`);
    if (setup.enabled === false) continue;

    const name = plugin.name;
    if (typeof name !== "string" || name.length === 0) {
      fail("setup-enabled plugins must have a non-empty name");
    }

    const placeholders = pluginPlaceholders(marketplace, plugin);
    const marketplaceRef = renderText(String(setup.marketplaceRef ?? "${marketplace_ref}"), placeholders);
    const setupPlaceholders = {
      ...placeholders,
      marketplace_ref: marketplaceRef,
      enabled_plugin: renderText(
        String(setup.enabledPlugin ?? "${plugin_name}@${marketplace_name}"),
        placeholders
      ),
    };

    const templateValues = {
      plugin_name: name,
      plugin_display_name: plugin.displayName ?? name,
      marketplace_name: marketplace.name ?? "",
      marketplace_repo: marketplace.repository ?? "",
      marketplace_ref: marketplaceRef,
      enabled_plugin: setupPlaceholders.enabled_plugin,
      ...requireObject(setup.templateValues ?? {}, `${name}.setup.templateValues`),
    };
    const settingsFragments = requireArray(
      setup.settingsFragments ?? [],
      `${name}.setup.settingsFragments`
    ).map((fragment, index) => {
      const fragmentConfig = requireObject(fragment, `${name}.setup.settingsFragments[${index}]`);
      if (typeof fragmentConfig.to !== "string" || fragmentConfig.to.length === 0) {
        fail(`${name}.setup.settingsFragments[${index}].to must be a non-empty string`);
      }
      return renderText(fragmentConfig.to, setupPlaceholders);
    });
    const mcpTemplates = requireArray(
      setup.mcpTemplates ?? [],
      `${name}.setup.mcpTemplates`
    ).map((template, index) => {
      const templateConfig = requireObject(template, `${name}.setup.mcpTemplates[${index}]`);
      if (typeof templateConfig.to !== "string" || templateConfig.to.length === 0) {
        fail(`${name}.setup.mcpTemplates[${index}].to must be a non-empty string`);
      }
      return renderText(templateConfig.to, setupPlaceholders);
    });
    const rules = requireArray(setup.rules ?? [], `${name}.setup.rules`).map((rule, index) => {
      const ruleConfig = requireObject(rule, `${name}.setup.rules[${index}]`);
      if (typeof ruleConfig.to !== "string" || ruleConfig.to.length === 0) {
        fail(`${name}.setup.rules[${index}].to must be a non-empty string`);
      }
      if (typeof ruleConfig.target !== "string" || ruleConfig.target.length === 0) {
        fail(`${name}.setup.rules[${index}].target must be a non-empty string`);
      }
      return {
        to: renderText(ruleConfig.to, setupPlaceholders),
        target: renderText(ruleConfig.target, setupPlaceholders),
        marker: renderText(String(ruleConfig.marker ?? ruleConfig.target), setupPlaceholders),
      };
    });

    let aiConfigTemplate = "";
    if (setup.aiConfigTemplate !== undefined && setup.aiConfigTemplate !== null) {
      const templateConfig = requireObject(setup.aiConfigTemplate, `${name}.setup.aiConfigTemplate`);
      if (typeof templateConfig.to !== "string" || templateConfig.to.length === 0) {
        fail(`${name}.setup.aiConfigTemplate.to must be a non-empty string`);
      }
      aiConfigTemplate = renderText(templateConfig.to, setupPlaceholders);
    }

    const setupEntry = {
      marketplaceName: marketplace.name ?? "",
      marketplaceRepo: marketplace.repository ?? "",
      marketplaceRef,
      enabledPlugin: setupPlaceholders.enabled_plugin,
      pluginVersion: plugin.version ?? "",
      install: renderConfigValue(
        setup.install ?? {
          enabled: true,
          scope: "project",
        },
        setupPlaceholders
      ),
      ruleFile: renderText(String(setup.ruleFile ?? `.claude/rules/${name}.md`), setupPlaceholders),
      ruleTemplate: renderText(
        String(setup.ruleTemplate ?? `generated/templates/${name}/rules.md`),
        setupPlaceholders
      ),
      claudeTemplate: renderText(
        String(setup.claudeTemplate ?? `generated/templates/${name}/CLAUDE.md`),
        setupPlaceholders
      ),
      extraDirectories: renderConfigValue(
        setup.extraDirectories ?? [".claude", ".claude/rules"],
        setupPlaceholders
      ),
      settingsFragments,
      aiConfigTemplate,
      mcpTemplates,
      rules,
      templateValues: renderConfigValue(templateValues, setupPlaceholders),
    };

    registry[name] = setupEntry;
  }

  // A target repo records one ref per marketplace name, so two plugins that
  // share a marketplace but disagree on the ref cannot both be honoured: the
  // last /roa-base:setup to run would silently repoint the others. Fail here
  // rather than ship a registry that cannot be applied faithfully.
  const refsByMarketplace = new Map();
  for (const [name, entry] of Object.entries(registry)) {
    const key = entry.marketplaceName;
    if (!refsByMarketplace.has(key)) {
      refsByMarketplace.set(key, new Map());
    }
    const seen = refsByMarketplace.get(key);
    if (!seen.has(entry.marketplaceRef)) {
      seen.set(entry.marketplaceRef, []);
    }
    seen.get(entry.marketplaceRef).push(name);
  }
  for (const [marketplaceName, seen] of refsByMarketplace) {
    if (seen.size > 1) {
      const detail = [...seen]
        .map(([ref, names]) => `${ref} (${names.sort().join(", ")})`)
        .sort()
        .join("; ");
      fail(
        `plugins in marketplace ${JSON.stringify(marketplaceName)} disagree on setup.marketplaceRef: ${detail}. ` +
          "A target repository pins one ref per marketplace, so every plugin in a marketplace must resolve to the same ref."
      );
    }
  }

  return registry;
}

function buildPlugin(marketplace, plugin, distRoot, extraPlaceholders = {}) {
  const name = plugin.name;
  if (typeof name !== "string" || name.length === 0) {
    fail("each plugin must have a non-empty name");
  }

  const outDir = path.join(distRoot, name);
  fs.mkdirSync(outDir, { recursive: true });
  const placeholders = pluginPlaceholders(marketplace, plugin, extraPlaceholders);

  requireArray(plugin.copy ?? [], `${name}.copy`).forEach((item, index) => {
    const rule = requireObject(item, `${name}.copy[${index}]`);
    const src = repoPath(renderText(String(rule.from ?? ""), placeholders));
    const dst = path.resolve(outDir, renderText(String(rule.to ?? ""), placeholders));
    copyPath(src, dst);
  });

  requireArray(plugin.render ?? [], `${name}.render`).forEach((item, index) => {
    const rule = requireObject(item, `${name}.render[${index}]`);
    const src = repoPath(renderText(String(rule.from ?? ""), placeholders));
    const dst = path.resolve(outDir, renderText(String(rule.to ?? ""), placeholders));
    renderFile(src, dst, placeholders);
  });

  requireArray(plugin.mergeHooks ?? [], `${name}.mergeHooks`).forEach((item, index) => {
    const rule = requireObject(item, `${name}.mergeHooks[${index}]`);
    writeMergedHooks(rule, outDir, placeholders, name, index);
  });

  requireArray(plugin.mergeMcp ?? [], `${name}.mergeMcp`).forEach((item, index) => {
    const rule = requireObject(item, `${name}.mergeMcp[${index}]`);
    writeMergedMcp(rule, outDir, placeholders, name, index);
  });

  for (const rel of requireArray(plugin.executable ?? [], `${name}.executable`)) {
    if (typeof rel !== "string") {
      fail(`${name}.executable entries must be strings`);
    }
    chmodExecutable(path.resolve(outDir, rel));
  }
}

function marketplaceCatalog(config, sourcePrefix) {
  const marketplace = requireObject(config.marketplace, "marketplace");
  const owner = requireObject(marketplace.owner, "marketplace.owner");
  const metadata = requireObject(marketplace.metadata ?? {}, "marketplace.metadata");
  const distPlugins = String(sourcePrefix)
    .replace(/^[.\\\/]+/, "")
    .replace(/\\/g, "/")
    .replace(/\/+$/, "");
  const plugins = requireArray(config.plugins, "plugins").map((item) => {
    const plugin = requireObject(item, "plugins[]");
    return {
      name: plugin.name,
      displayName: plugin.displayName ?? plugin.name,
      source: `./${distPlugins}/${plugin.name}`,
      description: plugin.description ?? "",
      category: plugin.category ?? "internal",
      tags: plugin.tags ?? [],
      defaultEnabled: plugin.defaultEnabled ?? true,
    };
  });

  const catalog = {
    name: marketplace.name,
    owner,
    description: marketplace.description ?? "",
    version: marketplace.version ?? "0.1.0",
    plugins,
  };

  if (Object.keys(metadata).length > 0) {
    catalog.metadata = metadata;
  }

  if (marketplace.allowCrossMarketplaceDependenciesOn) {
    catalog.allowCrossMarketplaceDependenciesOn = marketplace.allowCrossMarketplaceDependenciesOn;
  }
  return catalog;
}

function writeJson(filePath, data) {
  ensureInsideRepo(filePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

// The marketplace manifest is the one generated file written outside ROOT, so it
// carries its own guard (marketplaceManifestPath) instead of ensureInsideRepo.
function writeMarketplaceJson(filePath, data) {
  marketplaceManifestPath(filePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function writeDistNotice(distRoot) {
  const distDir = path.dirname(distRoot);
  ensureInsideRepo(distDir);
  fs.mkdirSync(distDir, { recursive: true });
  const notice = `# Generated Distribution

This folder is generated by \`scripts/build.mjs\`.

Do not edit files under \`dist/\` by hand. Update \`source/\`, plugin-owned
\`plugin-config.json\` files, shared templates, or the build script, then rebuild.

On pull requests, generated output should normally stay out of the PR diff.
The GitHub workflow rebuilds it for validation. On push to \`main\`, the workflow
commits regenerated \`dist/\` files back to \`main\` when they changed.
`;
  fs.writeFileSync(path.join(distDir, "README.md"), notice, "utf8");
  fs.writeFileSync(
    path.join(distDir, ".generated-by-build"),
    "Generated by scripts/build.mjs. Do not edit dist/ manually.\n",
    "utf8"
  );
}

// The registry is only useful if every file it points at actually exists; this
// catches a broken setup contract at build time rather than in a target repo.
function validateSetupAssets(registryPath, registry) {
  const setupRoot = path.dirname(path.dirname(registryPath));
  for (const [name, value] of Object.entries(registry)) {
    const spec = requireObject(value, `setup registry ${name}`);
    for (const key of ["ruleTemplate", "claudeTemplate"]) {
      const rel = spec[key];
      if (typeof rel !== "string" || rel.length === 0) {
        fail(`setup registry ${name}.${key} must be a non-empty string`);
      }
      const filePath = path.resolve(setupRoot, rel);
      ensureInsideRepo(filePath);
      if (!fs.existsSync(filePath)) {
        fail(`setup registry for ${name} references missing ${key}: ${filePath}`);
      }
    }
    for (const [index, rel] of requireArray(spec.settingsFragments ?? [], `setup registry ${name}.settingsFragments`).entries()) {
      if (typeof rel !== "string" || rel.length === 0) {
        fail(`setup registry ${name}.settingsFragments[${index}] must be a non-empty string`);
      }
      const filePath = path.resolve(setupRoot, rel);
      ensureInsideRepo(filePath);
      if (!fs.existsSync(filePath)) {
        fail(`setup registry for ${name} references missing settings fragment: ${filePath}`);
      }
      loadJson(filePath);
    }
    for (const [index, rel] of requireArray(spec.mcpTemplates ?? [], `setup registry ${name}.mcpTemplates`).entries()) {
      if (typeof rel !== "string" || rel.length === 0) {
        fail(`setup registry ${name}.mcpTemplates[${index}] must be a non-empty string`);
      }
      const filePath = path.resolve(setupRoot, rel);
      ensureInsideRepo(filePath);
      if (!fs.existsSync(filePath)) {
        fail(`setup registry for ${name} references missing MCP template: ${filePath}`);
      }
      loadJson(filePath);
    }
    for (const [index, rule] of requireArray(spec.rules ?? [], `setup registry ${name}.rules`).entries()) {
      const ruleConfig = requireObject(rule, `setup registry ${name}.rules[${index}]`);
      for (const key of ["to", "target", "marker"]) {
        if (typeof ruleConfig[key] !== "string" || ruleConfig[key].length === 0) {
          fail(`setup registry ${name}.rules[${index}].${key} must be a non-empty string`);
        }
      }
      const filePath = path.resolve(setupRoot, ruleConfig.to);
      ensureInsideRepo(filePath);
      if (!fs.existsSync(filePath)) {
        fail(`setup registry for ${name} references missing rule template: ${filePath}`);
      }
    }
    if (spec.aiConfigTemplate) {
      if (typeof spec.aiConfigTemplate !== "string") {
        fail(`setup registry ${name}.aiConfigTemplate must be a string`);
      }
      const filePath = path.resolve(setupRoot, spec.aiConfigTemplate);
      ensureInsideRepo(filePath);
      if (!fs.existsSync(filePath)) {
        fail(`setup registry for ${name} references missing ai-config template: ${filePath}`);
      }
    }
  }
}

// Setup resources are owned by each plugin but must ship inside roa-base, because
// roa-base is the plugin a fresh target repository installs first.
function copySetupAssets(config, registryPath, registry) {
  const marketplace = requireObject(config.marketplace, "marketplace");
  const setupRoot = path.dirname(path.dirname(registryPath));

  for (const plugin of requireArray(config.plugins, "plugins").map((item) => requireObject(item, "plugins[]"))) {
    const setupValue = plugin.setup;
    if (setupValue === undefined || setupValue === null) continue;
    const setup = requireObject(setupValue, `${plugin.name}.setup`);
    if (setup.enabled === false) continue;

    const { name } = plugin;
    if (typeof name !== "string" || !registry[name]) {
      fail(`missing generated setup registry entry for ${JSON.stringify(name)}`);
    }

    const placeholders = pluginPlaceholders(marketplace, plugin);
    const templateSources = {
      ruleTemplate: setup.ruleTemplateSource ?? `source/plugins/${name}/setup/rules.md`,
      claudeTemplate: setup.claudeTemplateSource ?? `source/plugins/${name}/setup/CLAUDE.md`,
    };

    for (const [registryKey, sourceValue] of Object.entries(templateSources)) {
      if (typeof sourceValue !== "string" || sourceValue.length === 0) {
        fail(`${name}.setup.${registryKey}Source must be a string`);
      }
      const src = repoPath(renderText(sourceValue, placeholders));
      const dstRel = registry[name][registryKey];
      if (typeof dstRel !== "string" || dstRel.length === 0) {
        fail(`setup registry ${name}.${registryKey} is invalid`);
      }
      copyPath(src, path.resolve(setupRoot, dstRel));
    }

    for (const [index, fragment] of requireArray(setup.settingsFragments ?? [], `${name}.setup.settingsFragments`).entries()) {
      const fragmentConfig = requireObject(fragment, `${name}.setup.settingsFragments[${index}]`);
      if (typeof fragmentConfig.from !== "string" || fragmentConfig.from.length === 0) {
        fail(`${name}.setup.settingsFragments[${index}].from must be a non-empty string`);
      }
      if (typeof fragmentConfig.to !== "string" || fragmentConfig.to.length === 0) {
        fail(`${name}.setup.settingsFragments[${index}].to must be a non-empty string`);
      }

      const src = repoPath(renderText(fragmentConfig.from, placeholders));
      const dst = path.resolve(setupRoot, renderText(fragmentConfig.to, placeholders));
      renderFile(src, dst, placeholders);
      loadJson(dst);
    }

    for (const [index, template] of requireArray(setup.mcpTemplates ?? [], `${name}.setup.mcpTemplates`).entries()) {
      const templateConfig = requireObject(template, `${name}.setup.mcpTemplates[${index}]`);
      if (typeof templateConfig.from !== "string" || templateConfig.from.length === 0) {
        fail(`${name}.setup.mcpTemplates[${index}].from must be a non-empty string`);
      }
      if (typeof templateConfig.to !== "string" || templateConfig.to.length === 0) {
        fail(`${name}.setup.mcpTemplates[${index}].to must be a non-empty string`);
      }

      const src = repoPath(renderText(templateConfig.from, placeholders));
      const dst = path.resolve(setupRoot, renderText(templateConfig.to, placeholders));
      renderFile(src, dst, placeholders);
      loadJson(dst);
    }

    for (const [index, rule] of requireArray(setup.rules ?? [], `${name}.setup.rules`).entries()) {
      const ruleConfig = requireObject(rule, `${name}.setup.rules[${index}]`);
      if (typeof ruleConfig.from !== "string" || ruleConfig.from.length === 0) {
        fail(`${name}.setup.rules[${index}].from must be a non-empty string`);
      }
      if (typeof ruleConfig.to !== "string" || ruleConfig.to.length === 0) {
        fail(`${name}.setup.rules[${index}].to must be a non-empty string`);
      }

      // Copy (not render) so ${...} markers/placeholders are rendered by setup.mjs at runtime.
      const src = repoPath(renderText(ruleConfig.from, placeholders));
      const dst = path.resolve(setupRoot, renderText(ruleConfig.to, placeholders));
      copyPath(src, dst);
    }

    if (setup.aiConfigTemplate !== undefined && setup.aiConfigTemplate !== null) {
      const templateConfig = requireObject(setup.aiConfigTemplate, `${name}.setup.aiConfigTemplate`);
      if (typeof templateConfig.from !== "string" || templateConfig.from.length === 0) {
        fail(`${name}.setup.aiConfigTemplate.from must be a non-empty string`);
      }
      if (typeof templateConfig.to !== "string" || templateConfig.to.length === 0) {
        fail(`${name}.setup.aiConfigTemplate.to must be a non-empty string`);
      }

      const src = repoPath(renderText(templateConfig.from, placeholders));
      const dst = path.resolve(setupRoot, renderText(templateConfig.to, placeholders));
      renderFile(src, dst, placeholders);
    }
  }
}

function main() {
  const config = loadJson(BUILD_CONFIG_PATH);
  const marketplace = requireObject(config.marketplace, "marketplace");
  const paths = requireObject(config.paths, "paths");
  config.plugins = loadPluginConfigs(paths);

  const distRoot = repoPath(paths.distPlugins ?? "dist/plugins");
  const marketplacePath = marketplaceManifestPath(paths.marketplaceFile ?? "../.claude-plugin/marketplace.json");
  const setupRegistryPath = repoPath(
    paths.setupRegistryFile ?? "dist/plugins/roa-base/skills/setup/generated/setup-registry.json"
  );
  const registry = buildSetupRegistry(config);

  cleanDist(distRoot);
  writeDistNotice(distRoot);
  for (const plugin of requireArray(config.plugins, "plugins")) {
    buildPlugin(marketplace, requireObject(plugin, "plugins[]"), distRoot);
  }
  copySetupAssets(config, setupRegistryPath, registry);
  validateSetupAssets(setupRegistryPath, registry);
  writeJson(setupRegistryPath, { plugins: registry });
  writeMarketplaceJson(marketplacePath, marketplaceCatalog(config, pluginSourcePrefix(marketplacePath, distRoot)));

  console.log(`Built ${repoRelative(distRoot)}`);
  console.log(`Updated ${repoRelative(marketplacePath)}`);
}

try {
  main();
} catch (error) {
  if (error instanceof ConfigError) {
    console.error(`build failed: ${error.message}`);
    process.exit(2);
  }
  throw error;
}
