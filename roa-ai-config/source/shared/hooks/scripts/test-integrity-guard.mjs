#!/usr/bin/env node
// ROA PreToolUse guard: an edit must not switch tests off.
//
// Blocks a Write/Edit/MultiEdit that ADDS a way of not running tests:
//   - @Disabled / @Ignore / @DisabledIf... / Assumptions.assume... in test sources
//   - skipTests / maven.test.skip / testFailureIgnore / failIfNo...Tests=false
//     in a pom.xml or .mvn/maven.config
// Occurrences that already exist are left alone: the check compares the text
// before and after the edit, so touching a file that already has one is fine.

import fs from "node:fs";
import path from "node:path";
import {
    currentWorkingDirectory,
    readPayload,
    resolveToolPath,
} from "./java-hook-utils.mjs";

const TEST_SOURCE_PATTERNS = [
    /@Disabled\b/g,
    /@DisabledIf\w*/g,
    /@DisabledOn\w*/g,
    /@Ignore\b/g,
    /\bAssumptions\s*\.\s*assume\w*/g,
    /\bassume(True|False|That)\s*\(/g,
];

const BUILD_PATTERNS = [
    /<skipTests>\s*true\s*<\/skipTests>/gi,
    /<maven\.test\.skip>\s*true\s*<\/maven\.test\.skip>/gi,
    /<skip>\s*true\s*<\/skip>/gi,
    /<testFailureIgnore>\s*true\s*<\/testFailureIgnore>/gi,
    /<failIfNoSpecifiedTests>\s*false\s*<\/failIfNoSpecifiedTests>/gi,
    /<failIfNoTests>\s*false\s*<\/failIfNoTests>/gi,
    /-DskipTests(=true)?\b/gi,
    /-Dmaven\.test\.skip(=true)?\b/gi,
    /-Dmaven\.test\.failure\.ignore(=true)?\b/gi,
    /-D(surefire\.)?failIfNo(Specified)?Tests=false\b/gi,
];

function count(text, patterns) {
    return patterns.reduce(
        (total, pattern) => total + (String(text ?? "").match(pattern)?.length ?? 0),
        0,
    );
}

function patternsFor(filePath) {
    const normalized = filePath.replace(/\\/g, "/").toLowerCase();

    if (normalized.endsWith(".java") && /(^|\/)src\/test\//.test(normalized)) {
        return TEST_SOURCE_PATTERNS;
    }

    if (path.basename(normalized) === "pom.xml" || normalized.endsWith("/.mvn/maven.config")) {
        return BUILD_PATTERNS;
    }

    return null;
}

function readExisting(filePath) {
    try {
        return fs.readFileSync(filePath, "utf8");
    } catch {
        return "";
    }
}

// Returns [before, after] text pairs describing what the tool call changes.
function changedText(toolName, input, filePath) {
    if (toolName === "Write") {
        return [[readExisting(filePath), input.content]];
    }

    if (toolName === "Edit") {
        return [[input.old_string, input.new_string]];
    }

    if (toolName === "MultiEdit" && Array.isArray(input.edits)) {
        return input.edits.map((edit) => [edit?.old_string, edit?.new_string]);
    }

    return [];
}

const payload = readPayload();
const toolName = String(payload.tool_name ?? "");
const input = payload.tool_input ?? {};
const rawPath = input.file_path ?? input.path;

if (!["Write", "Edit", "MultiEdit"].includes(toolName) || typeof rawPath !== "string") {
    process.exit(0);
}

const filePath = resolveToolPath(currentWorkingDirectory(payload), rawPath);
const patterns = patternsFor(filePath);

if (!patterns) {
    process.exit(0);
}

const added = changedText(toolName, input, filePath).some(
    ([before, after]) => count(after, patterns) > count(before, patterns),
);

if (added) {
    console.log(
        JSON.stringify({
            hookSpecificOutput: {
                hookEventName: "PreToolUse",
                permissionDecision: "deny",
                permissionDecisionReason:
                    `ROA test-integrity policy: this edit to ${path.basename(filePath)} disables, skips, or ignores tests. ` +
                    "Fix the cause or report the failure as BLOCKED instead. If the user explicitly asked for a test to be disabled, " +
                    "tell them this hook prevents the agent from doing it and let them make the change.",
            },
        }),
    );
}
