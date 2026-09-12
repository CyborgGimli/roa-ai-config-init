import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const STATE_DIR_NAME = "roa-hooks";

/**
 * Read the JSON payload supplied by Claude Code to a command hook.
 */
export function readPayload() {
    try {
        const text = fs
            .readFileSync(0, "utf8")
            .replace(/^\uFEFF/, "")
            .trim();

        return text ? JSON.parse(text) : {};
    } catch {
        return {};
    }
}

/**
 * Resolve the target repository working directory from the hook payload.
 */
export function currentWorkingDirectory(payload) {
    return path.resolve(
        String(payload?.cwd || process.cwd()),
    );
}

/**
 * Resolve the installed plugin root.
 */
export function pluginRoot(importMetaUrl) {
    if (process.env.CLAUDE_PLUGIN_ROOT) {
        return path.resolve(
            process.env.CLAUDE_PLUGIN_ROOT,
        );
    }

    return path.resolve(
        path.dirname(fileURLToPath(importMetaUrl)),
        "../..",
    );
}

/**
 * Extract file paths from Write/Edit/MultiEdit-style tool payloads.
 */
export function extractTouchedPaths(payload) {
    const input = payload?.tool_input ?? {};
    const values = [];

    for (const key of [
        "file_path",
        "path",
        "filename",
    ]) {
        if (
            typeof input[key] === "string" &&
            input[key].trim()
        ) {
            values.push(input[key]);
        }
    }

    for (const key of [
        "files",
        "paths",
        "filenames",
    ]) {
        if (!Array.isArray(input[key])) {
            continue;
        }

        for (const value of input[key]) {
            if (
                typeof value === "string" &&
                value.trim()
            ) {
                values.push(value);
                continue;
            }

            if (
                !value ||
                typeof value !== "object"
            ) {
                continue;
            }

            for (const nestedKey of [
                "file_path",
                "path",
                "filename",
            ]) {
                if (
                    typeof value[nestedKey] === "string" &&
                    value[nestedKey].trim()
                ) {
                    values.push(value[nestedKey]);
                }
            }
        }
    }

    return [...new Set(values)];
}

export function resolveToolPath(cwd, value) {
    return path.resolve(
        cwd,
        String(value),
    );
}

/**
 * Return true when candidate is root itself or is contained by root.
 */
export function isPathWithin(root, candidate) {
    const resolvedRoot =
        path.resolve(root);

    const resolvedCandidate =
        path.resolve(candidate);

    const relative =
        path.relative(
            resolvedRoot,
            resolvedCandidate,
        );

    return (
        relative === "" ||
        (
            !relative.startsWith("..") &&
            !path.isAbsolute(relative)
        )
    );
}

export function isJavaPath(filePath) {
    return String(filePath)
        .toLowerCase()
        .endsWith(".java");
}

export function isPomPath(filePath) {
    return (
        path
            .basename(String(filePath))
            .toLowerCase() === "pom.xml"
    );
}

export function isProtoPath(filePath) {
    return String(filePath)
        .toLowerCase()
        .endsWith(".proto");
}

/**
 * Pandora output is generated and must not be edited manually.
 */
export function isPandoraGeneratedPath(filePath) {
    const normalized = path
        .resolve(String(filePath))
        .replace(/\\/g, "/")
        .toLowerCase();

    return /(^|\/)target\/pandora(\/|$)/
        .test(normalized);
}

export function pathExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch {
        return false;
    }
}

export function isFile(filePath) {
    try {
        return fs
            .statSync(filePath)
            .isFile();
    } catch {
        return false;
    }
}

/**
 * Find the nearest pom.xml containing a changed file, without escaping the
 * supplied workspace boundary.
 */
export function findNearestPom(
    startPath,
    stopPath,
) {
    const resolvedStart =
        path.resolve(startPath);

    const stop = path.resolve(
        stopPath ??
        path.parse(resolvedStart).root,
    );

    let dir = resolvedStart;

    try {
        if (
            fs.statSync(dir).isFile()
        ) {
            dir = path.dirname(dir);
        }
    } catch {
        dir = path.dirname(dir);
    }

    for (;;) {
        if (
            !isPathWithin(stop, dir)
        ) {
            return null;
        }

        if (
            fs.existsSync(
                path.join(dir, "pom.xml"),
            )
        ) {
            return dir;
        }

        if (dir === stop) {
            return null;
        }

        const parent =
            path.dirname(dir);

        if (parent === dir) {
            return null;
        }

        dir = parent;
    }
}

/**
 * Find a Maven root while respecting an optional upper boundary.
 */
export function findMavenRoot(
    cwd,
    stopPath,
) {
    const start =
        path.resolve(cwd);

    const stop = path.resolve(
        stopPath ??
        path.parse(start).root,
    );

    let dir = start;

    for (;;) {
        if (
            !isPathWithin(stop, dir)
        ) {
            return null;
        }

        if (
            fs.existsSync(
                path.join(dir, "pom.xml"),
            )
        ) {
            return dir;
        }

        if (dir === stop) {
            return null;
        }

        const parent =
            path.dirname(dir);

        if (parent === dir) {
            return null;
        }

        dir = parent;
    }
}

/**
 * Prefer a repository Maven Wrapper.
 *
 * On Windows prefer mvnw.cmd.
 * Otherwise prefer mvnw.
 * Fall back to globally installed mvn.
 */
export function findMavenCommand(
    startDir,
    stopPath,
) {
    let dir =
        path.resolve(startDir);

    const stop = path.resolve(
        stopPath ??
        path.parse(dir).root,
    );

    for (;;) {
        if (
            !isPathWithin(stop, dir)
        ) {
            break;
        }

        const windowsWrapper =
            path.join(
                dir,
                "mvnw.cmd",
            );

        if (
            process.platform === "win32" &&
            fs.existsSync(windowsWrapper)
        ) {
            return windowsWrapper;
        }

        const wrapper =
            path.join(
                dir,
                "mvnw",
            );

        if (
            fs.existsSync(wrapper)
        ) {
            return wrapper;
        }

        if (dir === stop) {
            break;
        }

        const parent =
            path.dirname(dir);

        if (parent === dir) {
            break;
        }

        dir = parent;
    }

    return "mvn";
}

/**
 * Execute a deterministic child process and capture its result.
 *
 * Windows .cmd/.bat wrappers require shell execution.
 */
export function runCommand(
    command,
    args,
    options = {},
) {
    const commandText = String(command);

    const useShell =
        options.shell ??
        (
            process.platform === "win32" &&
            (
                /\.(cmd|bat)$/i.test(commandText) ||
                path.basename(commandText).toLowerCase() === "mvn"
            )
        );

    const result =
        spawnSync(
            command,
            args,
            {
                cwd: options.cwd,
                encoding: "utf8",
                maxBuffer:
                    options.maxBuffer ??
                    10 * 1024 * 1024,
                timeout:
                options.timeoutMs,
                windowsHide: true,
                shell: useShell,
                env:
                    options.env ??
                    process.env,
            },
        );

    return {
        command,
        args,
        cwd: options.cwd,
        status:
            typeof result.status === "number"
                ? result.status
                : 1,
        stdout:
            result.stdout ?? "",
        stderr:
            result.stderr ?? "",
        error:
        result.error,
        signal:
            result.signal ?? null,
        timedOut:
            result.error?.code ===
            "ETIMEDOUT",
    };
}

export function commandLine(result) {
    return [
        result.command,
        ...(result.args ?? []),
    ].join(" ");
}

export function combinedOutput(result) {
    return [
        result.stderr,
        result.stdout,
    ]
        .filter(Boolean)
        .join("\n");
}

/**
 * Keep hook failures useful without dumping enormous Maven output into context.
 */
export function trimText(
    text,
    maxLines = 120,
    maxChars = 12000,
) {
    const normalized =
        String(text || "")
            .replace(/\r\n/g, "\n")
            .trim();

    if (!normalized) {
        return "";
    }

    const lines =
        normalized.split("\n");

    const tail =
        lines.length > maxLines
            ? lines.slice(-maxLines)
            : lines;

    let value =
        tail.join("\n").trim();

    if (
        value.length > maxChars
    ) {
        value = value
            .slice(
                value.length - maxChars,
            )
            .trim();
    }

    return value;
}

/**
 * Prefer Maven output referring directly to changed files.
 */
export function relevantOutput(
    text,
    files,
    cwd,
) {
    const lines =
        String(text || "")
            .replace(/\r\n/g, "\n")
            .split("\n");

    const patterns =
        new Set();

    for (const file of files) {
        const absolute =
            path.resolve(file);

        const relative =
            path.relative(
                cwd,
                absolute,
            );

        patterns.add(
            path.basename(absolute),
        );

        patterns.add(relative);

        patterns.add(
            relative.replace(
                /\\/g,
                "/",
            ),
        );
    }

    const matches =
        lines.filter((line) => {
            const normalized =
                line.replace(
                    /\\/g,
                    "/",
                );

            return [...patterns].some(
                (pattern) =>
                    pattern &&
                    normalized.includes(
                        pattern.replace(
                            /\\/g,
                            "/",
                        ),
                    ),
            );
        });

    return trimText(
        matches.join("\n"),
    );
}

/**
 * Exit code 2 blocks the current Claude Code hook action.
 */
export function block(message) {
    console.error(
        trimText(message) ||
        "ROA hook failed without output.",
    );

    process.exit(2);
}

function sleep(ms) {
    Atomics.wait(
        new Int32Array(
            new SharedArrayBuffer(4),
        ),
        0,
        0,
        ms,
    );
}

function stateRoot() {
    const dir =
        path.join(
            os.tmpdir(),
            STATE_DIR_NAME,
        );

    fs.mkdirSync(
        dir,
        {
            recursive: true,
        },
    );

    return dir;
}

/**
 * Stable per-workspace key used for locks and temporary validation state.
 */
export function workspaceKey(cwd) {
    return crypto
        .createHash("sha1")
        .update(
            path.resolve(cwd),
        )
        .digest("hex")
        .slice(0, 16);
}

export function workspaceStatePath(
    cwd,
    name,
) {
    const safeName =
        String(name).replace(
            /[^a-zA-Z0-9._-]+/g,
            "-",
        );

    return path.join(
        stateRoot(),
        `${workspaceKey(cwd)}-${safeName}.json`,
    );
}

export function readWorkspaceState(
    cwd,
    name,
    fallback = {},
) {
    const filePath =
        workspaceStatePath(
            cwd,
            name,
        );

    try {
        const text =
            fs.readFileSync(
                filePath,
                "utf8",
            );

        const parsed =
            JSON.parse(text);

        return (
            parsed &&
            typeof parsed === "object" &&
            !Array.isArray(parsed)
                ? parsed
                : fallback
        );
    } catch {
        return fallback;
    }
}

export function writeWorkspaceState(
    cwd,
    name,
    value,
) {
    const filePath =
        workspaceStatePath(
            cwd,
            name,
        );

    fs.writeFileSync(
        filePath,
        JSON.stringify(
            value,
            null,
            2,
        ) + "\n",
        "utf8",
    );

    return filePath;
}

export function removeWorkspaceState(
    cwd,
    name,
) {
    const filePath =
        workspaceStatePath(
            cwd,
            name,
        );

    try {
        fs.unlinkSync(filePath);
    } catch (error) {
        if (
            error?.code !== "ENOENT"
        ) {
            throw error;
        }
    }
}

/**
 * Prevent concurrent Maven validation hooks from operating on the same
 * workspace.
 */
export function withWorkspaceLock(
    cwd,
    name,
    options = {},
    callback,
) {
    const lockDir =
        path.join(
            stateRoot(),
            "locks",
        );

    fs.mkdirSync(
        lockDir,
        {
            recursive: true,
        },
    );

    const lockPath =
        path.join(
            lockDir,
            `${workspaceKey(cwd)}-${name}.lock`,
        );

    const started =
        Date.now();

    const waitMs =
        options.waitMs ??
        15000;

    const staleMs =
        options.staleMs ??
        10 * 60 * 1000;

    for (;;) {
        try {
            const fd =
                fs.openSync(
                    lockPath,
                    "wx",
                );

            fs.writeFileSync(
                fd,
                JSON.stringify({
                    pid: process.pid,
                    createdAt:
                        Date.now(),
                }),
            );

            fs.closeSync(fd);
            break;
        } catch (error) {
            if (
                error?.code !==
                "EEXIST"
            ) {
                throw error;
            }

            try {
                const stat =
                    fs.statSync(lockPath);

                if (
                    Date.now() -
                    stat.mtimeMs >
                    staleMs
                ) {
                    fs.unlinkSync(
                        lockPath,
                    );

                    continue;
                }
            } catch {
                continue;
            }

            if (
                Date.now() -
                started >
                waitMs
            ) {
                block(
                    `Another ROA Maven validation is still running for this workspace after ${waitMs}ms.`,
                );
            }

            sleep(100);
        }
    }

    try {
        return callback();
    } finally {
        try {
            fs.unlinkSync(lockPath);
        } catch {
            // Best-effort cleanup.
            // Stale locks are removed on a later run.
        }
    }
}

/**
 * Associate changed files with their nearest Maven module.
 */
export function groupByModule(
    files,
    workspaceRoot,
) {
    const groups =
        new Map();

    const root =
        path.resolve(
            workspaceRoot,
        );

    for (const file of files) {
        const absolute =
            path.resolve(file);

        if (
            !isPathWithin(
                root,
                absolute,
            )
        ) {
            continue;
        }

        const moduleDir =
            findNearestPom(
                absolute,
                root,
            ) ??
            findMavenRoot(
                root,
                root,
            );

        if (!moduleDir) {
            continue;
        }

        if (
            !groups.has(moduleDir)
        ) {
            groups.set(
                moduleDir,
                [],
            );
        }

        groups
            .get(moduleDir)
            .push(absolute);
    }

    return groups;
}

/**
 * Produce a concise useful message from a failed Maven/tool execution.
 */
export function formatCommandFailure(
    result,
    label,
    files = [],
) {
    if (result.timedOut) {
        return (
            `${label} timed out while running ` +
            `${commandLine(result)}.`
        );
    }

    if (result.error) {
        return (
            `${label} could not run ` +
            `${commandLine(result)}: ` +
            `${result.error.message}`
        );
    }

    const output =
        relevantOutput(
            combinedOutput(result),
            files,
            result.cwd,
        ) ||
        trimText(
            combinedOutput(result),
        );

    return (
        `${label} failed while running ` +
        `${commandLine(result)}:\n` +
        output
    );
}