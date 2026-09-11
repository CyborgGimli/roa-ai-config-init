#!/usr/bin/env node
// ROA Java validation lifecycle hook.
// PostToolUse records relevant Java/POM changes.
// Stop test-compiles those changes before Claude completes the task.

import fs from "node:fs";
import path from "node:path";
import {
    currentWorkingDirectory,
    extractTouchedPaths,
    findMavenCommand,
    formatCommandFailure,
    groupByModule,
    isJavaPath,
    isPathWithin,
    isPomPath,
    readPayload,
    readWorkspaceState,
    removeWorkspaceState,
    resolveToolPath,
    runCommand,
    trimText,
    withWorkspaceLock,
    writeWorkspaceState,
} from "./java-hook-utils.mjs";

const STATE_VERSION = 1;
const STATE_PREFIX = "java-validation";

const COMPILE_TIMEOUT_MS = 5 * 60 * 1000;
const LOCK_WAIT_MS = 30 * 1000;
const LOCK_STALE_MS = COMPILE_TIMEOUT_MS + 60 * 1000;

const WRITE_TOOLS = new Set([
    "Write",
    "Edit",
    "MultiEdit",
]);

function safeSessionId(payload) {
    const value =
        String(
            payload?.session_id ?? "default",
        ).trim() || "default";

    return value
        .replace(
            /[^a-zA-Z0-9._-]+/g,
            "-",
        )
        .slice(0, 120);
}

function stateName(payload) {
    return (
        `${STATE_PREFIX}-` +
        safeSessionId(payload)
    );
}

function stateLockName(payload) {
    return `${stateName(payload)}-state`;
}

function normalizeState(value) {
    const source =
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
            ? value
            : {};

    const files =
        Array.isArray(source.files)
            ? source.files.filter(
                (file) =>
                    typeof file ===
                    "string" &&
                    file.trim(),
            )
            : [];

    return {
        version: STATE_VERSION,

        revision:
            Number.isInteger(
                source.revision,
            ) &&
            source.revision >= 0
                ? source.revision
                : 0,

        lastAttemptRevision:
            Number.isInteger(
                source.lastAttemptRevision,
            ) &&
            source.lastAttemptRevision >= 0
                ? source.lastAttemptRevision
                : 0,

        files: [...new Set(files)],

        updatedAt:
            typeof source.updatedAt ===
            "string"
                ? source.updatedAt
                : "",
    };
}

function relevantTouchedPaths(
    payload,
    cwd,
) {
    return extractTouchedPaths(payload)
        .map((value) =>
            resolveToolPath(
                cwd,
                value,
            ),
        )
        .filter((filePath) =>
            isPathWithin(
                cwd,
                filePath,
            ),
        )
        .filter(
            (filePath) =>
                isJavaPath(filePath) ||
                isPomPath(filePath),
        );
}

function relativeTrackedPath(
    cwd,
    filePath,
) {
    const relative =
        path.relative(
            cwd,
            filePath,
        );

    return (
        relative ||
        path.basename(filePath)
    );
}

function recordChanges(payload) {
    const cwd =
        currentWorkingDirectory(
            payload,
        );

    const touched =
        relevantTouchedPaths(
            payload,
            cwd,
        );

    if (touched.length === 0) {
        return;
    }

    const name =
        stateName(payload);

    withWorkspaceLock(
        cwd,
        stateLockName(payload),
        {
            waitMs: 5000,
            staleMs: 60 * 1000,
        },
        () => {
            const state =
                normalizeState(
                    readWorkspaceState(
                        cwd,
                        name,
                        {},
                    ),
                );

            const files =
                new Set(
                    state.files,
                );

            for (
                const filePath of touched
                ) {
                files.add(
                    relativeTrackedPath(
                        cwd,
                        filePath,
                    ),
                );
            }

            writeWorkspaceState(
                cwd,
                name,
                {
                    version:
                    STATE_VERSION,

                    revision:
                        state.revision + 1,

                    lastAttemptRevision:
                    state.lastAttemptRevision,

                    files:
                        [...files].sort(),

                    updatedAt:
                        new Date()
                            .toISOString(),
                },
            );
        },
    );
}

function stopBlock(reason) {
    console.log(
        JSON.stringify({
            decision: "block",
            reason:
                trimText(reason),
        }),
    );
}

function prepareValidationAttempt(
    payload,
    cwd,
) {
    const name =
        stateName(payload);

    let snapshot = null;

    withWorkspaceLock(
        cwd,
        stateLockName(payload),
        {
            waitMs: 5000,
            staleMs: 60 * 1000,
        },
        () => {
            const state =
                normalizeState(
                    readWorkspaceState(
                        cwd,
                        name,
                        {},
                    ),
                );

            if (
                state.revision === 0 ||
                state.files.length === 0
            ) {
                removeWorkspaceState(
                    cwd,
                    name,
                );

                return;
            }

            /*
             * If Claude is already continuing because this
             * Stop hook blocked once, and no relevant code
             * changed since that failed validation attempt,
             * allow Claude to finish instead of creating an
             * endless Stop-hook loop.
             *
             * If Claude fixes the code, PostToolUse increments
             * revision and the next Stop validates again.
             */
            if (
                payload.stop_hook_active ===
                true &&
                state.lastAttemptRevision ===
                state.revision
            ) {
                return;
            }

            const nextState = {
                ...state,
                lastAttemptRevision:
                state.revision,
            };

            writeWorkspaceState(
                cwd,
                name,
                nextState,
            );

            snapshot =
                nextState;
        },
    );

    return snapshot;
}

function absoluteTrackedFiles(
    cwd,
    state,
) {
    return state.files
        .map((file) =>
            resolveToolPath(
                cwd,
                file,
            ),
        )
        .filter((filePath) =>
            isPathWithin(
                cwd,
                filePath,
            ),
        )
        .filter(
            (filePath) =>
                isJavaPath(filePath) ||
                isPomPath(filePath),
        );
}

function runTestCompile(
    moduleDir,
    files,
    workspaceRoot,
) {
    const maven =
        findMavenCommand(
            moduleDir,
            workspaceRoot,
        );

    const result =
        runCommand(
            maven,
            [
                "-q",
                "test-compile",
            ],
            {
                cwd: moduleDir,
                timeoutMs:
                COMPILE_TIMEOUT_MS,
            },
        );

    if (
        result.status === 0 &&
        !result.error
    ) {
        return;
    }

    throw new Error(
        formatCommandFailure(
            result,
            "ROA test compilation",
            files,
        ),
    );
}

function validateChangedCode(
    cwd,
    files,
) {
    const rootPom =
        path.join(
            cwd,
            "pom.xml",
        );

    /*
     * When Claude Code is running from a Maven reactor
     * root, validate the reactor once. This handles
     * dependencies between changed sibling modules
     * correctly.
     */
    if (
        fs.existsSync(rootPom)
    ) {
        runTestCompile(
            cwd,
            files,
            cwd,
        );

        return;
    }

    /*
     * If the session started inside a lower-level
     * directory, validate the nearest Maven modules
     * containing the changed files without escaping
     * the Claude workspace.
     */
    const groups =
        groupByModule(
            files,
            cwd,
        );

    if (groups.size === 0) {
        throw new Error(
            "ROA validation could not find a pom.xml " +
            "for changed Java/Maven file(s): " +
            files.join(", "),
        );
    }

    for (
        const [
            moduleDir,
            moduleFiles,
        ] of groups
        ) {
        runTestCompile(
            moduleDir,
            moduleFiles,
            cwd,
        );
    }
}

function clearValidatedState(
    payload,
    cwd,
    validatedRevision,
) {
    const name =
        stateName(payload);

    let cleared = false;

    withWorkspaceLock(
        cwd,
        stateLockName(payload),
        {
            waitMs: 5000,
            staleMs: 60 * 1000,
        },
        () => {
            const current =
                normalizeState(
                    readWorkspaceState(
                        cwd,
                        name,
                        {},
                    ),
                );

            if (
                current.revision === 0 ||
                current.files.length === 0
            ) {
                removeWorkspaceState(
                    cwd,
                    name,
                );

                cleared = true;
                return;
            }

            /*
             * Only clear state when nothing changed while
             * Maven validation was running.
             */
            if (
                current.revision ===
                validatedRevision
            ) {
                removeWorkspaceState(
                    cwd,
                    name,
                );

                cleared = true;
            }
        },
    );

    return cleared;
}

function handleStop(payload) {
    const cwd =
        currentWorkingDirectory(
            payload,
        );

    const state =
        prepareValidationAttempt(
            payload,
            cwd,
        );

    if (!state) {
        return;
    }

    const files =
        absoluteTrackedFiles(
            cwd,
            state,
        );

    if (
        files.length === 0
    ) {
        removeWorkspaceState(
            cwd,
            stateName(payload),
        );

        return;
    }

    try {
        withWorkspaceLock(
            cwd,
            "maven-validation",
            {
                waitMs:
                LOCK_WAIT_MS,

                staleMs:
                LOCK_STALE_MS,
            },
            () =>
                validateChangedCode(
                    cwd,
                    files,
                ),
        );
    } catch (error) {
        stopBlock(
            error instanceof Error
                ? error.message
                : (
                    "ROA test compilation failed: " +
                    String(error)
                ),
        );

        return;
    }

    const cleared =
        clearValidatedState(
            payload,
            cwd,
            state.revision,
        );

    if (!cleared) {
        stopBlock(
            "Relevant Java or pom.xml files changed while " +
            "ROA validation was running. Validate the " +
            "latest changes before finishing.",
        );
    }
}

function main() {
    const payload =
        readPayload();

    const eventName =
        String(
            payload.hook_event_name ??
            "",
        );

    if (
        eventName ===
        "PostToolUse"
    ) {
        if (
            WRITE_TOOLS.has(
                String(
                    payload.tool_name ??
                    "",
                ),
            )
        ) {
            recordChanges(
                payload,
            );
        }

        return;
    }

    if (
        eventName === "Stop"
    ) {
        handleStop(
            payload,
        );
    }
}

main();