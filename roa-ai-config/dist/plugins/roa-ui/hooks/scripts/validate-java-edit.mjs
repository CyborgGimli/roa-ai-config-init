#!/usr/bin/env node
// PostToolUse gate for Write|Edit|MultiEdit: compile the modules that changed.
//
// Fast feedback beats a broken tree discovered ten edits later. The gate exits 0
// immediately when the change touched nothing Java-related, so ordinary editing
// is never slowed down (hook requirement: exit fast when irrelevant).

import path from "node:path";
import process from "node:process";
import {
  readPayload, currentWorkingDirectory, extractTouchedPaths, resolveToolPath,
  isJavaPath, isPomPath, isTestJavaPath, pathExists, findMavenCommand,
  block, runCommand, withWorkspaceLock, groupByModule, formatCommandFailure,
} from "./maven-hook-utils.mjs";

const EDIT_GATE_TIMEOUT_MS = 120000;
const LOCK_WAIT_MS = 15000;

function compileModule(moduleDir, files) {
  const maven = findMavenCommand(moduleDir);
  // Only reach for test-compile when a test source actually changed; it is slower.
  const goals = files.some(isTestJavaPath) ? ["test-compile"] : ["compile"];
  const result = runCommand(maven, ["-o", ...goals], {
    cwd: moduleDir,
    timeoutMs: EDIT_GATE_TIMEOUT_MS,
  });

  // Offline mode fails when the local repository is cold; that is an environment
  // problem, not a code problem, so retry online rather than blocking the edit.
  if (result.status !== 0 && /offline|cannot access|not resolve/i.test(`${result.stdout}${result.stderr}`)) {
    const online = runCommand(maven, [...goals], {
      cwd: moduleDir,
      timeoutMs: EDIT_GATE_TIMEOUT_MS,
    });
    if (online.status === 0) return;
    if (online.error?.code === "ETIMEDOUT") return; // slow network: do not punish the edit
    block(formatCommandFailure(online, "Compile", files));
  }

  if (result.status !== 0) {
    if (result.error?.code === "ETIMEDOUT") return;
    block(formatCommandFailure(result, "Compile", files));
  }
}

function main() {
  const payload = readPayload();
  if (!["Write", "Edit", "MultiEdit"].includes(payload?.tool_name)) {
    process.exit(0);
  }

  const cwd = currentWorkingDirectory(payload);
  const touched = extractTouchedPaths(payload).map((p) => resolveToolPath(cwd, p));
  const relevant = touched.filter((p) => isJavaPath(p) || isPomPath(p));
  if (relevant.length === 0) {
    process.exit(0);
  }

  const existing = relevant.filter(pathExists);
  if (existing.length === 0) {
    process.exit(0); // deleted or moved; nothing to compile
  }

  withWorkspaceLock(cwd, "maven", { waitMs: LOCK_WAIT_MS, staleMs: EDIT_GATE_TIMEOUT_MS + 30000 }, () => {
    const groups = groupByModule(existing, cwd);
    if (groups.size === 0) {
      // No pom.xml anywhere above the file: not a Maven repo, so nothing to enforce.
      process.exit(0);
    }
    for (const [moduleDir, files] of groups) {
      compileModule(moduleDir, files);
    }
  });

  process.exit(0);
}

main();
