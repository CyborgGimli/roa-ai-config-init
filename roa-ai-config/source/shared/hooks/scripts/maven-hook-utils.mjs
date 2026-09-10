#!/usr/bin/env node
// Shared helpers for the Maven/Java hooks. Node.js built-ins only.
//
// Hooks run on every matching tool call, so everything here is cheap, synchronous,
// and fails open: a helper that cannot answer returns a neutral value rather than
// blocking ordinary work.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

export function readPayload() {
  try {
    const text = fs.readFileSync(0, "utf8").replace(/^﻿/, "");
    return text.trim() ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export function currentWorkingDirectory(payload) {
  return payload?.cwd || process.cwd();
}

// CLAUDE_PLUGIN_ROOT is set when Claude Code runs the hook; the fallback keeps the
// script usable when invoked directly for testing.
export function pluginRoot(importMetaUrl) {
  if (process.env.CLAUDE_PLUGIN_ROOT) {
    return process.env.CLAUDE_PLUGIN_ROOT;
  }
  return path.resolve(path.dirname(fileURLToPath(importMetaUrl)), "..", "..");
}

export function extractTouchedPaths(payload) {
  const input = payload?.tool_input ?? {};
  const paths = [];
  for (const key of ["file_path", "filePath", "path", "notebook_path"]) {
    if (typeof input[key] === "string" && input[key]) paths.push(input[key]);
  }
  if (Array.isArray(input.edits)) {
    for (const edit of input.edits) {
      if (edit && typeof edit.file_path === "string") paths.push(edit.file_path);
    }
  }
  if (Array.isArray(input.file_paths)) {
    for (const p of input.file_paths) if (typeof p === "string") paths.push(p);
  }
  return [...new Set(paths)];
}

export function resolveToolPath(cwd, candidate) {
  return path.isAbsolute(candidate) ? candidate : path.resolve(cwd, candidate);
}

// Marks that this session actually edited Java. The Stop gate runs the suite only
// when the marker exists, so a session that asked a question or edited a README
// does not pay for a full `mvn test`.
function sessionMarkerPath(cwd, sessionId) {
  const key = createHash("sha1")
    .update(`${path.resolve(cwd)}::${sessionId || "no-session"}`)
    .digest("hex")
    .slice(0, 16);
  return path.join(os.tmpdir(), `roa-java-touched-${key}.marker`);
}

export function markJavaTouched(cwd, sessionId) {
  try {
    fs.writeFileSync(sessionMarkerPath(cwd, sessionId), String(Date.now()));
  } catch {
    // A marker we cannot write only costs a skipped gate, never a failed edit.
  }
}

export function consumeJavaTouched(cwd, sessionId) {
  const marker = sessionMarkerPath(cwd, sessionId);
  try {
    fs.readFileSync(marker, "utf8");
  } catch {
    return false;
  }
  try {
    fs.unlinkSync(marker);
  } catch {
    /* already gone */
  }
  return true;
}

export function isPathWithin(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

// Pandora writes metadata and AI Teacher lessons under target/. Editing either by
// hand produces guidance that the next regeneration silently discards.
export const isPandoraGeneratedPath = (p) =>
  /[\\/]target[\\/]pandora[\\/]/i.test(String(p));

export const isJavaPath = (p) => /\.java$/i.test(p);
export const isPomPath = (p) => /(^|[\\/])pom\.xml$/i.test(p);
export const isTestJavaPath = (p) => /[\\/]src[\\/]test[\\/]java[\\/]/i.test(p);

export function pathExists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

export function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

// Walk up from `startDir` looking for the nearest pom.xml.
export function findMavenRoot(startDir) {
  let dir = path.resolve(startDir);
  for (;;) {
    if (isFile(path.join(dir, "pom.xml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

// Prefer the repository's own wrapper so the hook uses the same Maven the project does.
export function findMavenCommand(dir) {
  if (process.platform === "win32" && isFile(path.join(dir, "mvnw.cmd"))) {
    return path.join(dir, "mvnw.cmd");
  }
  if (isFile(path.join(dir, "mvnw"))) {
    return path.join(dir, "mvnw");
  }
  return "mvn";
}

export function block(message) {
  console.error(message);
  process.exit(2);
}

export function runCommand(command, args, options = {}) {
  // On Windows the Maven entry point is mvn.cmd / mvnw.cmd, which Node refuses to
  // spawn directly (CVE-2024-27980). Go through the shell as one command string;
  // args here are fixed tokens (-q, -o, compile), never user paths.
  if (process.platform === "win32") {
    // Quote only a path; quoting a bare name ("mvn") confuses cmd and loses output.
    const head = /[\\\/\s]/.test(command) ? JSON.stringify(command) : command;
    const line = [head, ...args].join(" ");
    return spawnSync(line, {
      cwd: options.cwd,
      stdio: "pipe",
      encoding: "utf8",
      timeout: options.timeoutMs,
      shell: true,
    });
  }
  return spawnSync(command, args, {
    cwd: options.cwd,
    stdio: "pipe",
    encoding: "utf8",
    timeout: options.timeoutMs,
  });
}

// Two PostToolUse handlers can fire while an earlier Maven run is still going.
// A lock file keeps them from tripping over the same target/ directory.
export function withWorkspaceLock(cwd, name, options, callback) {
  const key = createHash("sha1").update(path.resolve(cwd)).digest("hex").slice(0, 16);
  const lockPath = path.join(os.tmpdir(), `roa-${name}-${key}.lock`);
  const waitMs = options?.waitMs ?? 15000;
  const staleMs = options?.staleMs ?? 120000;
  const deadline = Date.now() + waitMs;

  for (;;) {
    try {
      fs.writeFileSync(lockPath, String(process.pid), { flag: "wx" });
      break;
    } catch {
      // Someone else holds it. Reclaim it if they died and left it behind.
      try {
        if (Date.now() - fs.statSync(lockPath).mtimeMs > staleMs) {
          fs.unlinkSync(lockPath);
          continue;
        }
      } catch {
        continue;
      }
      if (Date.now() > deadline) {
        return callback(); // Waited long enough; proceeding beats blocking the user.
      }
      sleepSync(200);
    }
  }

  try {
    return callback();
  } finally {
    try { fs.unlinkSync(lockPath); } catch { /* already gone */ }
  }
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// Group changed files by their nearest Maven module, so a multi-module repo
// compiles only what actually changed.
export function groupByModule(files, cwd) {
  const groups = new Map();
  for (const file of files) {
    const moduleDir = findMavenRoot(path.dirname(file)) ?? findMavenRoot(cwd);
    if (!moduleDir) continue;
    if (!groups.has(moduleDir)) groups.set(moduleDir, []);
    groups.get(moduleDir).push(file);
  }
  return groups;
}

export function formatCommandFailure(result, label, files) {
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  const lines = [`${label} failed for: ${files.map((f) => path.basename(f)).join(", ")}`];
  if (result.error) lines.push(`  ${result.error.message}`);
  if (output) {
    lines.push("", relevantOutput(output));
  }
  lines.push("", "Fix the cause and re-apply the edit.");
  return lines.join("\n");
}

// Maven is extremely verbose; surface only the lines that explain the failure.
export function relevantOutput(output, limit = 40) {
  const patterns = [
    /\bERROR\b/, /\bBUILD FAILURE\b/, /\bFailed tests?:/, /<<< FAILURE!/, /<<< ERROR!/,
    /expected:/i, /actual:/i, /AssertionError/, /\.java:\[\d+/, /symbol:/, /required:/,
  ];
  const lines = output.split(/\r?\n/).filter((line) => patterns.some((p) => p.test(line)));
  const chosen = (lines.length > 0 ? lines : output.split(/\r?\n/)).filter(Boolean);
  return chosen.slice(0, limit).join("\n");
}
