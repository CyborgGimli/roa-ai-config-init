#!/usr/bin/env node
// PreToolUse guard for Bash: refuse Maven commands that skip tests.
//
// Skipping tests to get a green build is the single most common way an agent
// reports success on work that does not actually pass. Exits 2 to block, 0 to allow.

import process from "node:process";
import { readPayload, block } from "./maven-hook-utils.mjs";

// Matches `mvn`, `./mvnw`, `.\mvnw.cmd`, and an `&`-call-operator invocation, so
// the guard covers PowerShell as well as POSIX shells.
const isMavenCommand = (command) =>
  /(^|[\s;&|(])(?:[.][\\/])?mvnw?(?:\.cmd)?(?=\s|$)/i.test(command);

const skipsTests = (command) =>
  /(^|[\s"'])(-DskipTests(?:=true)?|-Dmaven\.test\.skip(?:=true)?|-DskipITs(?:=true)?)(?=[\s"']|$)/i.test(command);

const GUARDED_TOOLS = new Set(["Bash", "PowerShell"]);

function main() {
  const payload = readPayload();
  if (!GUARDED_TOOLS.has(String(payload?.tool_name ?? ""))) {
    process.exit(0);
  }
  const command = payload?.tool_input?.command;
  if (typeof command !== "string" || !command.trim()) {
    process.exit(0);
  }
  if (!isMavenCommand(command) || !skipsTests(command)) {
    process.exit(0);
  }

  block(
    [
      "maven-command-guard: blocked a Maven command that skips tests.",
      "",
      "Skipping tests hides the failure rather than fixing it, and any result reported",
      "from such a build is not evidence that the change works.",
      "",
      "Run the build without -DskipTests / -Dmaven.test.skip. If a test is genuinely",
      "broken for an unrelated reason, say so and fix the cause.",
    ].join("\n")
  );
}

main();
