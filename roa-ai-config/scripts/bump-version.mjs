#!/usr/bin/env node
// Bump all plugin versions, the marketplace version and package.json together,
// and refresh the refs quoted in README.md.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGINS_DIR = path.join(ROOT, "source", "plugins");
const BUILD_CONFIG_PATH = path.join(ROOT, "build-config.json");
const PACKAGE_JSON_PATH = path.join(ROOT, "package.json");
const VALID_INCREMENTS = new Set(["patch", "minor", "major"]);

class BumpError extends Error {
  constructor(message) {
    super(message);
    this.name = "BumpError";
  }
}

function fail(message) {
  throw new BumpError(message);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
  } catch (error) {
    if (error.code === "ENOENT") {
      fail(`missing file: ${filePath}`);
    }
    if (error instanceof SyntaxError) {
      fail(`invalid JSON in ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function parseIncrement(args) {
  const raw = args[0] ?? process.env.VERSION_INCREMENT;
  if (!VALID_INCREMENTS.has(raw)) {
    fail("usage: node scripts/bump-version.mjs <patch|minor|major>");
  }
  return raw;
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    fail(`unsupported version ${JSON.stringify(version)}. Expected x.y.z`);
  }
  return match.slice(1).map((part) => Number.parseInt(part, 10));
}

function bumpVersion(version, increment) {
  let [major, minor, patch] = parseVersion(version);
  if (increment === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (increment === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

function pluginConfigPaths() {
  if (!fs.existsSync(PLUGINS_DIR)) {
    fail(`missing plugins directory: ${PLUGINS_DIR}`);
  }

  return fs
    .readdirSync(PLUGINS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(PLUGINS_DIR, entry.name, "plugin-config.json"))
    .filter((filePath) => fs.existsSync(filePath))
    .sort((a, b) => a.localeCompare(b));
}

function replaceRefsInReadme(pluginNames, oldVersion, newVersion) {
  const readmePath = path.join(ROOT, "README.md");
  if (!fs.existsSync(readmePath)) {
    return;
  }

  let text = fs.readFileSync(readmePath, "utf8");
  for (const pluginName of pluginNames) {
    text = text
      .split(`${pluginName}--v${oldVersion}`)
      .join(`${pluginName}--v${newVersion}`);
  }
  text = text.split(`\`v${oldVersion}\``).join(`\`v${newVersion}\``);
  fs.writeFileSync(readmePath, text, "utf8");
}

function alignMarketplaceVersion(newVersion) {
  if (!fs.existsSync(BUILD_CONFIG_PATH)) {
    return null;
  }
  const config = readJson(BUILD_CONFIG_PATH);
  if (!config.marketplace || typeof config.marketplace !== "object" || Array.isArray(config.marketplace)) {
    fail("build-config.json must contain a marketplace object");
  }
  const oldVersion = config.marketplace.version ?? "0.0.0";
  config.marketplace.version = newVersion;
  writeJson(BUILD_CONFIG_PATH, config);
  return [oldVersion, newVersion];
}

function alignPackageVersion(newVersion) {
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    return null;
  }
  const data = readJson(PACKAGE_JSON_PATH);
  const oldVersion = data.version ?? "0.0.0";
  if (oldVersion === newVersion) {
    return null;
  }
  data.version = newVersion;
  writeJson(PACKAGE_JSON_PATH, data);
  return [oldVersion, newVersion];
}

function main() {
  const increment = parseIncrement(process.argv.slice(2));
  const configs = pluginConfigPaths().map((filePath) => ({
    filePath,
    data: readJson(filePath),
  }));

  if (configs.length === 0) {
    fail("no plugin configs found");
  }

  for (const { filePath, data } of configs) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      fail(`${filePath} must contain a JSON object`);
    }
    if (typeof data.name !== "string" || data.name.length === 0) {
      fail(`${filePath} must define name`);
    }
    if (typeof data.version !== "string") {
      fail(`${filePath} must define version`);
    }
  }

  // A split version means an earlier bump half-failed; refuse rather than
  // guess which version is authoritative.
  const versions = new Set(configs.map(({ data }) => data.version));
  if (versions.size !== 1) {
    fail(`plugin versions are not aligned: ${[...versions].sort().join(", ")}`);
  }

  const oldVersion = configs[0].data.version;
  const newVersion = bumpVersion(oldVersion, increment);
  const pluginNames = configs.map(({ data }) => data.name);

  for (const { filePath, data } of configs) {
    data.version = newVersion;
    if (data.placeholders && typeof data.placeholders === "object" && !Array.isArray(data.placeholders)) {
      delete data.placeholders.plugin_ref;
      if (Object.keys(data.placeholders).length === 0) {
        delete data.placeholders;
      }
    }
    writeJson(filePath, data);
  }

  replaceRefsInReadme(pluginNames, oldVersion, newVersion);
  const marketplaceBump = alignMarketplaceVersion(newVersion);
  const packageBump = alignPackageVersion(newVersion);

  console.log(`Bumped plugins ${oldVersion} -> ${newVersion} (${increment})`);
  for (const pluginName of pluginNames) {
    console.log(`- ${pluginName}@${newVersion}`);
  }
  if (marketplaceBump) {
    console.log(`- marketplace ${marketplaceBump[0]} -> ${marketplaceBump[1]}`);
    console.log(`- pinned marketplace ref: v${marketplaceBump[1]} (release tag to push)`);
  }
  if (packageBump) {
    console.log(`- package.json ${packageBump[0]} -> ${packageBump[1]}`);
  }
  console.log("\nNext step: run node scripts/build.mjs to regenerate dist/ and the marketplace catalog.");
}

try {
  main();
} catch (error) {
  if (error instanceof BumpError) {
    console.error(`version bump failed: ${error.message}`);
    process.exit(2);
  }
  throw error;
}
