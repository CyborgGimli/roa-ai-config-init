#!/usr/bin/env node
// Preflight for ROA plugins: verify (and where safe, install) toolchain prerequisites.
// Node.js built-ins only. Idempotent: it checks first and only installs what is missing.
//
// Requirements:
//   - Node.js >= 20   runs ROA setup and hook scripts (hard prerequisite)
//   - git             version control (hard prerequisite)
//   - JDK >= 17       compiles and runs ROA tests
//   - Maven >= 3.8    builds the project and runs `mvn pandora:navigation -U`
//
// Auto-install (unless --check-only): on Windows the JDK and Maven are installed
// through winget, on macOS through Homebrew. Node.js and git are never
// auto-installed (this script runs on Node, and system package installs vary too
// much to do safely). If anything cannot be installed automatically, a MANUAL
// INSTALLATION block is printed listing every requirement with commands for this
// platform.

import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const CHECK_ONLY = process.argv.includes("--check-only");
const MIN_NODE_MAJOR = 20;
const MIN_JAVA_MAJOR = 17;
const isWin = process.platform === "win32";
const isMac = process.platform === "darwin";

// Per-requirement manual-install commands, keyed by platform.
const MANUAL = {
  node: {
    label: "Node.js >= 20",
    purpose: "runs ROA setup and hook scripts",
    win: "winget install OpenJS.NodeJS.LTS   (or https://nodejs.org)",
    unix: "nvm install --lts   (or brew install node / https://nodejs.org)",
  },
  git: {
    label: "git",
    purpose: "version control",
    win: "winget install Git.Git   (or https://git-scm.com/downloads)",
    unix: "brew install git / sudo apt-get install git   (or https://git-scm.com/downloads)",
  },
  java: {
    label: `JDK >= ${MIN_JAVA_MAJOR}`,
    purpose: "compiles and runs ROA tests",
    win: "winget install EclipseAdoptium.Temurin.17.JDK   (or https://adoptium.net)",
    unix: "brew install --cask temurin@17 / sudo apt-get install openjdk-17-jdk   (or https://adoptium.net)",
  },
  maven: {
    label: "Apache Maven >= 3.8",
    purpose: "builds the project and generates Pandora metadata",
    win: "winget install Apache.Maven   (or https://maven.apache.org/download.cgi)",
    unix: "brew install maven / sudo apt-get install maven   (or https://maven.apache.org/download.cgi)",
  },
};

function firstLine(text) {
  return String(text ?? "").trim().split(/\r?\n/)[0] ?? "";
}

// Detect a command by asking for its version. shell:true lets the platform shell resolve PATH.
function detect(cmd, args = "--version") {
  const r = spawnSync(`${cmd} ${args}`, { stdio: "pipe", encoding: "utf8", shell: true });
  return r.status === 0 ? firstLine(r.stdout) || firstLine(r.stderr) || "present" : null;
}

// `java -version` prints e.g. `openjdk version "17.0.10"` — old JDKs print "1.8.0".
function javaMajor(versionLine) {
  const match = /(?:version\s+")?(\d+)(?:\.(\d+))?/.exec(versionLine ?? "");
  if (!match) return 0;
  const major = Number.parseInt(match[1], 10);
  return major === 1 ? Number.parseInt(match[2] ?? "0", 10) : major;
}

function runInstall(label, command) {
  console.log(`\n[install] ${label}`);
  console.log(`> ${command}`);
  const r = spawnSync(command, { stdio: "inherit", encoding: "utf8", shell: true });
  return r.status === 0;
}

const manualCmd = (key) => (isWin ? MANUAL[key].win : MANUAL[key].unix);

// Only Windows (winget) and macOS (Homebrew) have an installer we are willing to
// invoke unattended. Everywhere else the manual block is the answer.
function autoInstallCmd(key) {
  if (isWin) {
    return key === "java"
      ? "winget install --silent --accept-package-agreements --accept-source-agreements EclipseAdoptium.Temurin.17.JDK"
      : "winget install --silent --accept-package-agreements --accept-source-agreements Apache.Maven";
  }
  if (isMac) {
    return key === "java" ? "brew install --cask temurin@17" : "brew install maven";
  }
  return null;
}

const report = [];
const missing = new Set();
let pathChanged = false;
let installFailed = false;

// --- Node.js (hard prerequisite; the script runs on it) ---
const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
if (nodeMajor >= MIN_NODE_MAJOR) {
  report.push(["ok", `node ${process.version}`]);
} else {
  report.push(["FAIL", `node ${process.version} (need >= ${MIN_NODE_MAJOR})`]);
  missing.add("node");
}

// --- git (hard prerequisite; not auto-installed) ---
const git = detect("git");
if (git) {
  report.push(["ok", git]);
} else {
  report.push(["missing", "git"]);
  missing.add("git");
}

// --- JDK (installed if missing, where an installer is available) ---
let java = detect("java", "-version");
if (java && javaMajor(java) < MIN_JAVA_MAJOR) {
  report.push(["FAIL", `${java} (need >= ${MIN_JAVA_MAJOR})`]);
  missing.add("java");
  java = null;
} else if (!java && !CHECK_ONLY) {
  const cmd = autoInstallCmd("java");
  if (cmd && runInstall(MANUAL.java.label, cmd)) {
    pathChanged = true;
    java = detect("java", "-version"); // may still be null this session until PATH refreshes
    if (!java) console.log("  JDK installed but not on PATH yet for this session.");
  } else if (cmd) {
    installFailed = true;
  }
}
if (java) {
  report.push(["ok", java]);
} else if (!missing.has("java")) {
  report.push(["missing", MANUAL.java.label]);
  missing.add("java");
}

// --- Maven (installed if missing, where an installer is available) ---
let maven = detect("mvn", "-version");
if (!maven && !CHECK_ONLY) {
  const cmd = autoInstallCmd("maven");
  if (cmd && runInstall(MANUAL.maven.label, cmd)) {
    pathChanged = true;
    maven = detect("mvn", "-version");
    if (!maven) console.log("  Maven installed but not on PATH yet for this session.");
  } else if (cmd) {
    installFailed = true;
  }
}
if (maven) {
  report.push(["ok", maven]);
} else {
  report.push(["missing", MANUAL.maven.label]);
  missing.add("maven");
}

// --- Summary ---
console.log("\nROA prerequisites:");
for (const [status, detail] of report) {
  const mark = status === "ok" ? "✓" : status === "FAIL" ? "X" : "!";
  console.log(`  ${mark} ${status.padEnd(7)} ${detail}`);
}

// --- Manual-install fallback: printed whenever anything is missing or an install failed ---
if (missing.size > 0 || installFailed) {
  const line = "=".repeat(64);
  console.log(`\n${line}`);
  console.log("MANUAL INSTALLATION REQUIRED");
  console.log("Automatic setup did not install everything. Install the items below,");
  console.log("open a new terminal, then re-run:");
  console.log(`  node "${path.join(SCRIPT_DIR, "install-prereqs.mjs")}"`);
  const order = ["node", "git", "java", "maven"];
  for (const key of order.filter((k) => missing.has(k))) {
    console.log(`\n- ${MANUAL[key].label} (${MANUAL[key].purpose})`);
    console.log(`    ${manualCmd(key)}`);
  }
  console.log("\nFull cross-platform list: see the roa-base plugin README (Requirements).");
} else {
  console.log("\nAll prerequisites are present.");
}

if (pathChanged) {
  console.log(
    "\nA tool was just installed. Open a NEW terminal (or restart Claude Code) so PATH updates take effect, then re-run this check to confirm."
  );
}

// Exit-code contract (consumed by the setup skill's install ladder):
//   0   everything present
//   1   Node.js itself is missing/too old — hard blocker, setup cannot continue
//   2   one or more other tools are still missing after auto-install — the caller may
//       attempt an adaptive install, then fall back to the printed MANUAL block
if (missing.has("node")) process.exit(1);
process.exit(missing.size > 0 ? 2 : 0);
