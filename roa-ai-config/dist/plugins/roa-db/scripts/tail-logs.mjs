#!/usr/bin/env node
// Stream new lines from the project's log file into the session.
//
// The log path comes from, in order of precedence:
//   1. ROA_LOG_FILE          - written into .claude/settings.json by setup.mjs
//   2. logs.file in ai-config.yaml
//   3. logs/app.log          - fallback
//
// Node.js built-ins only. Polls by size so it works on Windows, where fs.watch
// on an actively-appended file is unreliable.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const projectDir = process.cwd();
const POLL_MS = 1000;

// Deliberately minimal: this only needs `logs:` -> `file:`, not a YAML parser.
function logFileFromAiConfig() {
  try {
    const configPath = path.join(projectDir, "ai-config.yaml");
    if (!fs.existsSync(configPath)) return "";
    const text = fs.readFileSync(configPath, "utf8").replace(/\r\n/g, "\n");
    const match = /^logs:\s*$\n(?:\s+.*\n)*?\s+file:\s*(.+)$/m.exec(text);
    if (match) {
      return match[1].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // ignore; fall through to default
  }
  return "";
}

const configuredLog = process.env.ROA_LOG_FILE || logFileFromAiConfig() || path.join("logs", "app.log");
const logFile = path.isAbsolute(configuredLog) ? configuredLog : path.join(projectDir, configuredLog);

let offset = 0;
let announcedMissing = false;
let initialized = false;

function sizeOf(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return null;
  }
}

function initializeOffset() {
  const size = sizeOf(logFile);
  if (size === null) {
    if (!announcedMissing) {
      console.log(`roa log monitor: ${logFile} does not exist yet; create it to stream log events.`);
      announcedMissing = true;
    }
    return false;
  }
  // Start at the end: only new lines are interesting.
  offset = size;
  initialized = true;
  announcedMissing = false;
  console.log(`roa log monitor: tailing ${logFile}`);
  return true;
}

function readNewLines() {
  const size = sizeOf(logFile);
  if (size === null) {
    initialized = false;
    return;
  }

  // Truncated or rotated: start over from the beginning of the new file.
  if (size < offset) {
    offset = 0;
  }
  if (size === offset) {
    return;
  }

  const stream = fs.createReadStream(logFile, { start: offset, end: size - 1, encoding: "utf8" });
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk;
  });
  stream.on("end", () => {
    offset = size;
    for (const line of buffer.split(/\r?\n/)) {
      if (line.trim()) console.log(line);
    }
  });
  stream.on("error", () => {
    initialized = false;
  });
}

function tick() {
  if (!initialized && !initializeOffset()) {
    return;
  }
  readNewLines();
}

tick();
setInterval(tick, POLL_MS);
