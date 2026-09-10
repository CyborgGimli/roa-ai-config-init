#!/usr/bin/env node
// SessionStart hook: compare the project's ROA version against the version the
// bundled docs were verified against.
//
// The docs in docs/ quote real signatures rather than hedging, which makes them
// far more useful than "check Pandora for everything" — and means they go quietly
// wrong when the framework moves. Nothing else detects that: stale docs still
// read as authoritative, and the mismatch only surfaces as a confusing compile
// error much later. This states the precedence up front, once per session.
//
// stdout on SessionStart becomes context Claude can see, so a single line here is
// worth more than a warning nobody reads. Silence is the normal case.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT ?? path.resolve(import.meta.dirname, "..");
const MAX_POM_DEPTH = 3;

function readPayload() {
  try {
    const text = fs.readFileSync(0, "utf8").replace(/^﻿/, "");
    return text.trim() ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function readVerifiedAgainst() {
  try {
    return JSON.parse(fs.readFileSync(path.join(PLUGIN_ROOT, "docs", "verified-against.json"), "utf8"));
  } catch {
    return null;
  }
}

function findPoms(dir, depth = 0, found = []) {
  if (depth > MAX_POM_DEPTH || found.length > 40) return found;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.name === "target" || entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findPoms(full, depth + 1, found);
    else if (entry.name === "pom.xml") found.push(full);
  }
  return found;
}

// Resolves the declared ROA version without invoking Maven: a dependency:list at
// session start would cost seconds on every launch, and the common cases are a
// literal version or a property defined in the same reactor.
function resolveRoaVersion(root, groupId) {
  const poms = findPoms(root);
  const properties = new Map();
  const candidates = [];

  for (const pom of poms) {
    let text;
    try {
      text = fs.readFileSync(pom, "utf8");
    } catch {
      continue;
    }

    for (const match of text.matchAll(/<([a-zA-Z0-9._-]*(?:version|Version))>([^<${}]+)<\/\1>/g)) {
      properties.set(match[1], match[2].trim());
    }

    const escaped = groupId.replace(/\./g, "\\.");
    const dependency = new RegExp(
      `<groupId>\\s*${escaped}[^<]*</groupId>\\s*<artifactId>[^<]*</artifactId>\\s*<version>([^<]+)</version>`,
      "g"
    );
    for (const match of text.matchAll(dependency)) {
      candidates.push(match[1].trim());
    }
  }

  for (const raw of candidates) {
    const property = /^\$\{([^}]+)\}$/.exec(raw);
    const resolved = property ? properties.get(property[1]) : raw;
    if (resolved && !resolved.includes("${")) return resolved;
  }
  return null;
}

function main() {
  const payload = readPayload();
  const cwd = payload?.cwd || process.cwd();

  const verified = readVerifiedAgainst();
  if (!verified) process.exit(0);

  const groupId = verified.groupId || "io.cyborgcode.roa";
  const projectVersion = resolveRoaVersion(cwd, groupId);

  // Not a ROA project, or the version is computed somewhere we cannot read
  // cheaply. Either way there is nothing useful to say.
  if (!projectVersion) process.exit(0);

  if (!verified.roaVersion) {
    console.log(
      `ROA docs currency: this project uses ${groupId} ${projectVersion}, but the bundled ` +
        "docs do not record which ROA release they were verified against, so their accuracy " +
        "cannot be checked. Treat target/pandora/metadata (the ai-compass skill) as " +
        "authoritative for any signature."
    );
    process.exit(0);
  }

  if (verified.roaVersion !== projectVersion) {
    console.log(
      `ROA docs currency: this project uses ${groupId} ${projectVersion}, but the bundled docs ` +
        `were verified against ${verified.roaVersion}. Where they disagree, generated metadata ` +
        "wins — load the ai-compass skill and read target/pandora/metadata before relying on a " +
        "signature quoted in docs/."
    );
  }

  process.exit(0);
}

main();
