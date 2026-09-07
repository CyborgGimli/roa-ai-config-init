#!/usr/bin/env node
// Stop hook: run the test suite when the session finishes, and report the result.
//
// This is the last line of defence against "done" being reported for work that
// does not pass. It surfaces the surefire summary rather than the whole Maven log.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  readPayload, currentWorkingDirectory, findMavenRoot, findMavenCommand,
  block, runCommand, withWorkspaceLock, relevantOutput,
} from "./maven-hook-utils.mjs";

const TEST_TIMEOUT_MS = 10 * 60 * 1000;
const LOCK_WAIT_MS = 30000;

function walkFiles(dir, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

const xmlAttr = (text, name) => {
  const match = new RegExp(`${name}="(\\d+)"`).exec(text);
  return match ? Number.parseInt(match[1], 10) : 0;
};

// Sum the <testsuite> counters across every surefire report in the repo.
function summarizeSurefire(root) {
  const totals = { tests: 0, failures: 0, errors: 0, skipped: 0 };
  let found = false;

  for (const dir of walkFiles(root).filter((f) => /[\\/]target[\\/]surefire-reports[\\/].*\.xml$/i.test(f))) {
    let text;
    try { text = fs.readFileSync(dir, "utf8"); } catch { continue; }
    const suite = /<testsuite\b[^>]*>/.exec(text);
    if (!suite) continue;
    found = true;
    totals.tests += xmlAttr(suite[0], "tests");
    totals.failures += xmlAttr(suite[0], "failures");
    totals.errors += xmlAttr(suite[0], "errors");
    totals.skipped += xmlAttr(suite[0], "skipped");
  }

  return found ? totals : null;
}

function main() {
  const payload = readPayload();

  // Required by the hook contract: a Stop hook must not re-enter itself.
  if (payload?.stop_hook_active) {
    process.exit(0);
  }

  // Opt-out for sessions that legitimately did not touch code.
  if (process.env.ROA_SKIP_STOP_TEST_GATE) {
    process.exit(0);
  }

  const cwd = currentWorkingDirectory(payload);
  const root = findMavenRoot(cwd);
  if (!root) {
    process.exit(0); // not a Maven repository; nothing to gate
  }

  const maven = findMavenCommand(root);
  const result = withWorkspaceLock(
    cwd,
    "maven",
    { waitMs: LOCK_WAIT_MS, staleMs: TEST_TIMEOUT_MS + 60000 },
    () => runCommand(maven, ["test"], { cwd: root, timeoutMs: TEST_TIMEOUT_MS })
  );

  if (result.error?.code === "ETIMEDOUT") {
    process.exit(0); // a slow suite is not a reason to block the session ending
  }

  if (result.status !== 0) {
    const summary = summarizeSurefire(root);
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    block(
      [
        "stop-test-gate: the test suite is not passing.",
        summary
          ? `  tests=${summary.tests} failures=${summary.failures} errors=${summary.errors} skipped=${summary.skipped}`
          : "  (no surefire reports found; the build may have failed before tests ran)",
        "",
        output ? relevantOutput(output) : "",
        "",
        "Do not report this work as done. Fix the failures, or state explicitly which",
        "are pre-existing and unrelated to this change.",
      ].filter(Boolean).join("\n")
    );
  }

  process.exit(0);
}

main();
