#!/usr/bin/env node
// Launches Eclipse JDT Language Server for the ROA plugins' Java LSP config.
//
// Claude Code speaks LSP over this process's stdio, so the launcher's only job is
// to find a jdtls the user already has and hand the streams straight through.
// It never downloads a language server: an LSP that silently installs several
// hundred megabytes on first use is not something a test-automation plugin
// should do behind the user's back.
//
// Resolution order:
//   1. ROA_JDTLS_COMMAND  - explicit override, run as-is
//   2. JDTLS_HOME         - a jdtls install directory
//   3. jdtls / jdtls.bat  - on PATH
//
// Exits non-zero with an actionable message when none is found; Claude Code
// surfaces that in the /plugin Errors tab.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn, spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";
const launcherNames = isWindows ? ["jdtls.bat", "jdtls.cmd", "jdtls"] : ["jdtls"];

function fail(message) {
  process.stderr.write(`jdtls-launcher: ${message}\n`);
  process.exit(1);
}

function isExecutableFile(candidate) {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}

function fromExplicitCommand() {
  const override = process.env.ROA_JDTLS_COMMAND?.trim();
  if (!override) return null;
  const [command, ...args] = override.split(/\s+/);
  return { command, args };
}

function fromJdtlsHome() {
  const home = process.env.JDTLS_HOME?.trim();
  if (!home) return null;

  for (const name of launcherNames) {
    const candidate = path.join(home, "bin", name);
    if (isExecutableFile(candidate)) return { command: candidate, args: [] };
  }

  fail(
    `JDTLS_HOME is set to "${home}" but no bin/${launcherNames[0]} was found there. ` +
      "Point JDTLS_HOME at the directory containing bin/jdtls, or unset it to fall back to PATH."
  );
  return null;
}

function fromPath() {
  const probe = isWindows ? "where" : "which";
  for (const name of launcherNames) {
    const result = spawnSync(probe, [name], { encoding: "utf8", shell: isWindows });
    const resolved = result.status === 0 ? result.stdout.split(/\r?\n/)[0]?.trim() : "";
    if (resolved) return { command: resolved, args: [] };
  }
  return null;
}

function resolveLauncher() {
  const found = fromExplicitCommand() ?? fromJdtlsHome() ?? fromPath();
  if (found) return found;

  fail(
    "Eclipse JDT Language Server was not found, so Java code intelligence is unavailable.\n" +
      "Install it, then either add its bin/ directory to PATH or set JDTLS_HOME to the install directory:\n" +
      "  Homebrew   brew install jdtls\n" +
      "  Manual     download from https://download.eclipse.org/jdtls/snapshots/ and set JDTLS_HOME\n" +
      "  Override   set ROA_JDTLS_COMMAND to the exact command to run\n" +
      "jdtls requires Java 17 or newer on PATH."
  );
  return null;
}

function main() {
  const { command, args } = resolveLauncher();

  // A jdtls workspace is per-project state, not per-session: reusing one keeps the
  // index warm instead of reparsing the whole repository on every start.
  const dataDir = process.env.CLAUDE_PLUGIN_DATA
    ? path.join(process.env.CLAUDE_PLUGIN_DATA, "jdtls-workspace")
    : null;
  if (dataDir) {
    fs.mkdirSync(dataDir, { recursive: true });
    args.push("-data", dataDir);
  }

  const child = spawn(command, args, {
    stdio: ["inherit", "inherit", "inherit"],
    shell: isWindows && /\.(bat|cmd)$/i.test(command),
  });

  child.on("error", (error) => fail(`failed to start "${command}": ${error.message}`));
  child.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 0)));

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => child.kill(signal));
  }
}

main();
