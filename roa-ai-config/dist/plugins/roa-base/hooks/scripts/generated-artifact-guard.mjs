#!/usr/bin/env node
// ROA PreToolUse guard for generated Pandora output.

import path from "node:path";
import {
    currentWorkingDirectory,
    extractTouchedPaths,
    isPandoraGeneratedPath,
    isPathWithin,
    readPayload,
    resolveToolPath,
} from "./java-hook-utils.mjs";

const WRITE_TOOLS = new Set([
    "Write",
    "Edit",
    "MultiEdit",
]);

function deny(paths) {
    console.log(
        JSON.stringify({
            hookSpecificOutput: {
                hookEventName: "PreToolUse",
                permissionDecision: "deny",
                permissionDecisionReason:
                    "ROA generated-artifact policy: Pandora output under target/pandora is generated and must not be edited manually. " +
                    `Blocked path(s): ${paths.join(", ")}. ` +
                    "Regenerate metadata with `mvn pandora:navigation -U` (older Pandora: `mvn pandora:open -U`) or AI Teacher output with `mvn pandora:teach`, as appropriate.",
            },
        }),
    );
}

const payload = readPayload();
const toolName = String(
    payload.tool_name ?? "",
);

if (!WRITE_TOOLS.has(toolName)) {
    process.exit(0);
}

const cwd =
    currentWorkingDirectory(payload);

const touchedPaths =
    extractTouchedPaths(payload)
        .map((value) =>
            resolveToolPath(cwd, value),
        )
        .filter((filePath) =>
            isPathWithin(cwd, filePath),
        );

const blockedPaths =
    touchedPaths
        .filter(isPandoraGeneratedPath)
        .map(
            (filePath) =>
                path.relative(cwd, filePath) ||
                filePath,
        );

if (blockedPaths.length > 0) {
    deny(blockedPaths);
}