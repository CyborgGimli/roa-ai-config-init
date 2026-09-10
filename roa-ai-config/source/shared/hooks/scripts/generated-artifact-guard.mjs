#!/usr/bin/env node
// PreToolUse guard for Write/Edit: refuse edits to generated Pandora output.
//
// Metadata under target/pandora is regenerated from the classpath, so a manual
// edit is discarded on the next run while the model keeps trusting it. Blocking
// the write turns a silent inconsistency into an immediate, fixable message.

import path from "node:path";
import process from "node:process";
import {
  currentWorkingDirectory,
  extractTouchedPaths,
  isPandoraGeneratedPath,
  isPathWithin,
  readPayload,
  resolveToolPath,
} from "./maven-hook-utils.mjs";

const WRITE_TOOLS = new Set(["Write", "Edit", "MultiEdit", "NotebookEdit"]);

function deny(paths) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "ROA generated-artifact policy: everything under target/pandora is generated " +
          `and must not be edited by hand. Blocked: ${paths.join(", ")}. ` +
          "Change the Java source it is generated from, then regenerate with " +
          "`mvn pandora:navigation -U` for metadata or `mvn pandora:teach` for lessons.",
      },
    })
  );
}

function main() {
  const payload = readPayload();
  if (!WRITE_TOOLS.has(String(payload?.tool_name ?? ""))) {
    process.exit(0);
  }

  const cwd = currentWorkingDirectory(payload);
  const blocked = extractTouchedPaths(payload)
    .map((value) => resolveToolPath(cwd, value))
    .filter((filePath) => isPathWithin(cwd, filePath))
    .filter(isPandoraGeneratedPath)
    .map((filePath) => path.relative(cwd, filePath) || filePath);

  if (blocked.length > 0) {
    deny(blocked);
  }
  process.exit(0);
}

main();
