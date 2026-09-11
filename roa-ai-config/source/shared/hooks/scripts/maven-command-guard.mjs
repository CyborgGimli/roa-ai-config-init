#!/usr/bin/env node
// ROA PreToolUse guard for Maven commands that bypass or hide test failures.

import fs from "node:fs";
import process from "node:process";

function readInput() {
    try {
        return fs.readFileSync(0, "utf8").replace(/^\uFEFF/, "");
    } catch {
        return "";
    }
}

function parseInput(text) {
    try {
        return text.trim() ? JSON.parse(text) : {};
    } catch {
        return {};
    }
}

function isMavenCommand(command) {
    return /(^|[\s;&|()])(?:(?:\.?[\\/])?mvnw(?:\.cmd)?|mvn(?:\.cmd)?)(?=\s|$)/i.test(
        command,
    );
}

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Match Maven -D properties that are enabled either explicitly with =true
 * or implicitly by providing the property without a value.
 *
 * Examples:
 *   -DskipTests
 *   -DskipTests=true
 *
 * Does not match:
 *   -DskipTests=false
 */
function hasEnabledProperty(command, property) {
    const escapedProperty = escapeRegExp(property);

    return new RegExp(
        `(^|\\s)["']?-D${escapedProperty}(?:=true)?["']?(?=\\s|$)`,
        "i",
    ).test(command);
}

function findViolation(command) {
    if (
        hasEnabledProperty(command, "skipTests") ||
        hasEnabledProperty(command, "maven.test.skip")
    ) {
        return "Maven tests must not be skipped by default";
    }

    if (hasEnabledProperty(command, "maven.test.failure.ignore")) {
        return "Maven test failures must not be ignored";
    }

    if (
        /(^|\s)["']?(?:-fn|--fail-never)["']?(?=\s|$)/i.test(
            command,
        )
    ) {
        return "Maven --fail-never must not hide build or test failures";
    }

    return null;
}

function deny(reason) {
    console.log(
        JSON.stringify({
            hookSpecificOutput: {
                hookEventName: "PreToolUse",
                permissionDecision: "deny",
                permissionDecisionReason:
                    `ROA Maven policy: ${reason}. ` +
                    "Run the relevant validation normally instead of bypassing or hiding failures.",
            },
        }),
    );
}

const payload = parseInput(readInput());
const command = String(payload.tool_input?.command ?? "");

const toolName =
    String(
        payload.tool_name ?? "",
    );

if (
    ![
        "Bash",
        "PowerShell",
    ].includes(toolName) ||
    command.trim() === "" ||
    !isMavenCommand(command)
) {
    process.exit(0);
}

const violation = findViolation(command);

if (violation) {
    deny(violation);
}