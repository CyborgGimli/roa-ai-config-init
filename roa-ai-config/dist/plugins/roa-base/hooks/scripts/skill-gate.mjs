#!/usr/bin/env node
// ROA PreToolUse gate: the ai-compass / ai-teacher rules, enforced.
//
// The rules tell the model to load `ai-compass` before writing code that uses an
// io.cyborgcode.roa type and `ai-teacher` before creating a Java class. Written
// rules are advice; this hook makes them hold. Before a Write/Edit/MultiEdit of a
// .java file it checks the session transcript for the Skill call:
//
//   - new or changed code that mentions io.cyborgcode.roa  -> ai-compass required
//   - Write of a .java file that does not exist yet         -> ai-teacher required
//
// It fails open: no transcript, an unreadable transcript, or ROA_SKILL_GATE=off
// lets the edit through, so a Claude Code change to the transcript format can
// never lock anyone out of editing.

import fs from "node:fs";
import path from "node:path";
import {
    currentWorkingDirectory,
    readPayload,
    resolveToolPath,
} from "./java-hook-utils.mjs";

const ROA_TYPE = /io\.cyborgcode\.roa\b/;

function newText(toolName, input) {
    if (toolName === "Write") {
        return String(input.content ?? "");
    }
    if (toolName === "Edit") {
        return String(input.new_string ?? "");
    }
    if (toolName === "MultiEdit" && Array.isArray(input.edits)) {
        return input.edits.map((edit) => String(edit?.new_string ?? "")).join("\n");
    }
    return "";
}

function readIfExists(filePath) {
    try {
        return fs.readFileSync(filePath, "utf8");
    } catch {
        return null;
    }
}

// The main transcript plus any subagent transcripts stored beside it
// (<session>.jsonl and <session>/subagents/*.jsonl), because the skill may have
// been loaded by the orchestrating session or by the subagent doing the edit.
function transcriptFiles(payload) {
    const files = new Set();

    for (const key of ["transcript_path", "agent_transcript_path"]) {
        if (typeof payload[key] === "string" && payload[key]) {
            files.add(payload[key]);
        }
    }

    for (const file of [...files]) {
        const sessionDir = path.join(path.dirname(file), path.basename(file, ".jsonl"));
        const subagentDir = path.join(sessionDir, "subagents");
        try {
            for (const entry of fs.readdirSync(subagentDir)) {
                if (entry.endsWith(".jsonl")) {
                    files.add(path.join(subagentDir, entry));
                }
            }
        } catch {
            // no subagent transcripts
        }
    }

    return [...files];
}

// Matches only an actual Skill tool call, e.g.
//   "type":"tool_use","id":"toolu_…","name":"Skill","input":{"skill":"roa-ui:ai-compass"
// — not the tool schema or the skill listing, which also mention both words.
function skillCallPattern(skill) {
    return new RegExp(`"name":"Skill","input":\\{"skill":"(?:[\\w.-]+:)?${skill}"`);
}

// Returns true / false when the transcripts could be read, null when none could.
function skillWasLoaded(payload, skill) {
    const pattern = skillCallPattern(skill);
    let readAny = false;

    for (const file of transcriptFiles(payload)) {
        const text = readIfExists(file);
        if (text === null) {
            continue;
        }
        readAny = true;

        if (pattern.test(text)) {
            return true;
        }
    }

    return readAny ? false : null;
}

function deny(reason) {
    console.log(
        JSON.stringify({
            hookSpecificOutput: {
                hookEventName: "PreToolUse",
                permissionDecision: "deny",
                permissionDecisionReason: `ROA skill gate: ${reason}`,
            },
        }),
    );
}

const payload = readPayload();
const toolName = String(payload.tool_name ?? "");
const input = payload.tool_input ?? {};
const rawPath = input.file_path ?? input.path;

if (
    process.env.ROA_SKILL_GATE === "off" ||
    !["Write", "Edit", "MultiEdit"].includes(toolName) ||
    typeof rawPath !== "string" ||
    !rawPath.toLowerCase().endsWith(".java")
) {
    process.exit(0);
}

const filePath = resolveToolPath(currentWorkingDirectory(payload), rawPath);
const existing = readIfExists(filePath);
const incoming = newText(toolName, input);

const needs = [];

if (toolName === "Write" && existing === null) {
    needs.push(["ai-teacher", "creating a new Java class"]);
}

if (ROA_TYPE.test(incoming) || (existing !== null && ROA_TYPE.test(existing))) {
    needs.push(["ai-compass", "writing code that uses io.cyborgcode.roa types"]);
}

const missing = [];

for (const [skill, why] of needs) {
    const loaded = skillWasLoaded(payload, skill);
    if (loaded === null) {
        process.exit(0); // cannot tell; fail open
    }
    if (!loaded) {
        missing.push(`\`${skill}\` (required before ${why})`);
    }
}

if (missing.length > 0) {
    deny(
        `invoke the ${missing.join(" and ")} skill with the Skill tool first, ` +
            "read what it points you to for the types and patterns involved, then retry this edit.",
    );
}
