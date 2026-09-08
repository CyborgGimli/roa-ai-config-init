#!/usr/bin/env node
// PreToolUse guard for Bash: refuse Maven commands that skip tests.
//
// Skipping tests to get a green build is the single most common way an agent
// reports success on work that does not actually pass. Exits 2 to block, 0 to allow.

import process from "node:process";
import { readPayload, block } from "./maven-hook-utils.mjs";

const isMavenCommand = (command) =>
  /(^|[\s;&|()])(\.\/mvnw|mvnw(?:\.cmd)?|mvn)(\s|$)/i.test(command);

const skipsTests = (command) =>
  /(^|\s)(-DskipTests(?:=true)?|-Dmaven\.test\.skip(?:=true)?|-DskipITs(?:=true)?)(\s|$)/i.test(command);

function main() {
  const payload = readPayload();
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
