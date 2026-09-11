#!/usr/bin/env node
// ROA PreToolUse guard for high-confidence destructive shell commands.

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

function word(value) {
    return { type: "word", value };
}

function op(value) {
    return { type: "op", value };
}

function lexShell(command) {
    const tokens = [];
    let current = "";
    let quote = "";
    let escaped = false;

    function pushWord() {
        if (current.length > 0) {
            tokens.push(word(current));
            current = "";
        }
    }

    for (let index = 0; index < command.length; index += 1) {
        const char = command[index];
        const next = command[index + 1] ?? "";

        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }

        if (quote === "'") {
            if (char === "'") {
                quote = "";
            } else {
                current += char;
            }
            continue;
        }

        if (quote === '"') {
            if (char === '"') {
                quote = "";
            } else if (char === "\\") {
                escaped = true;
            } else {
                current += char;
            }
            continue;
        }

        if (char === "\\" || char === "`") {
            escaped = true;
            continue;
        }

        if (char === "'" || char === '"') {
            quote = char;
            continue;
        }

        if (char === "#" && current.length === 0) {
            while (index < command.length && command[index] !== "\n") {
                index += 1;
            }
            pushWord();
            tokens.push(op(";"));
            continue;
        }

        if (/\s/.test(char)) {
            pushWord();
            if (char === "\n" || char === "\r") {
                tokens.push(op(";"));
            }
            continue;
        }

        if (
            (char === "&" && next === "&") ||
            (char === "|" && next === "|")
        ) {
            pushWord();
            tokens.push(op(char + next));
            index += 1;
            continue;
        }

        if (
            char === "|" ||
            char === "&" ||
            char === ";" ||
            char === "(" ||
            char === ")"
        ) {
            pushWord();
            tokens.push(op(char));
            continue;
        }

        current += char;
    }

    pushWord();
    return tokens;
}

function shellSegments(command) {
    const segments = [];
    let words = [];
    let separatorBefore = "";

    function pushSegment() {
        if (words.length > 0) {
            segments.push({ separatorBefore, words });
            words = [];
        }
    }

    for (const token of lexShell(command)) {
        if (token.type === "word") {
            words.push(token.value);
            continue;
        }

        pushSegment();
        separatorBefore = token.value;
    }

    pushSegment();
    return segments;
}

function commandName(token) {
    const normalized = String(token ?? "")
        .replace(/^['"]|['"]$/g, "")
        .split(/[\\/]/)
        .pop()
        .toLowerCase();

    return normalized.replace(/\.(exe|cmd|bat|ps1)$/i, "");
}

function isAssignment(token) {
    return /^[A-Za-z_][A-Za-z0-9_]*=.*/.test(token);
}

function stripCommandPrefixes(words) {
    let index = 0;

    while (index < words.length && isAssignment(words[index])) {
        index += 1;
    }

    for (;;) {
        const name = commandName(words[index]);

        if (name === "sudo") {
            index += 1;

            while (
                index < words.length &&
                words[index].startsWith("-")
                ) {
                const option = words[index];
                index += 1;

                if (
                    [
                        "-u",
                        "--user",
                        "-g",
                        "--group",
                        "-h",
                        "--host",
                        "-p",
                        "--prompt",
                    ].includes(option)
                ) {
                    index += 1;
                }
            }

            continue;
        }

        if (name === "env") {
            index += 1;

            while (
                index < words.length &&
                (
                    words[index].startsWith("-") ||
                    isAssignment(words[index])
                )
                ) {
                index += 1;
            }

            continue;
        }

        if (
            name === "command" ||
            name === "builtin" ||
            name === "exec"
        ) {
            index += 1;
            continue;
        }

        return words.slice(index);
    }
}

function normalizeTarget(target) {
    return String(target ?? "")
        .trim()
        .replace(/^['"]|['"]$/g, "")
        .replace(/\\/g, "/")
        .replace(/\/+$/g, "/")
        .toLowerCase();
}

function isBroadTarget(target) {
    const value = normalizeTarget(target);

    if (!value) {
        return false;
    }

    return (
        [
            "/",
            "/*",
            ".",
            "./",
            "./*",
            "..",
            "../",
            "../*",
            "*",
            "~",
            "~/",
            "~/*",
            "$home",
            "$home/*",
            "${home}",
            "${home}/*",
            "$pwd",
            "$pwd/*",
            "${pwd}",
            "${pwd}/*",
            "$env:home",
            "$env:home/*",
            "$env:userprofile",
            "$env:userprofile/*",
            "%userprofile%",
            "%userprofile%/*",
            ".git",
            "./.git",
            ".git/",
        ].includes(value) ||
        /^[a-z]:\/(\*)?$/i.test(value) ||
        /^\/\*+$/.test(value)
    );
}

function hasShortFlag(args, flag) {
    return args.some(
        (arg) =>
            /^-[A-Za-z]+$/.test(arg) &&
            arg.includes(flag),
    );
}

function hasLongFlag(args, flag) {
    return args.some(
        (arg) =>
            arg === flag ||
            arg.startsWith(`${flag}=`),
    );
}

function positionalArgs(args) {
    const values = [];
    let afterDoubleDash = false;

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];

        if (afterDoubleDash) {
            values.push(arg);
            continue;
        }

        if (arg === "--") {
            afterDoubleDash = true;
            continue;
        }

        if (arg.startsWith("-")) {
            continue;
        }

        values.push(arg);
    }

    return values;
}

function checkRm(words) {
    const args = words.slice(1);

    const recursive =
        hasShortFlag(args, "r") ||
        hasShortFlag(args, "R") ||
        hasLongFlag(args, "--recursive") ||
        args.some(
            (arg) =>
                /^-r(ec(urse)?)?$/i.test(arg),
        );

    const force =
        hasShortFlag(args, "f") ||
        hasLongFlag(args, "--force") ||
        args.some(
            (arg) =>
                /^-f(orce)?$/i.test(arg),
        );

    const targets = positionalArgs(args);

    if (
        (recursive || force) &&
        targets.some(isBroadTarget)
    ) {
        return "blocked broad rm target; use a narrower path or remove files interactively";
    }

    if (
        args.some(
            (arg) =>
                arg === "--no-preserve-root",
        )
    ) {
        return "blocked rm --no-preserve-root";
    }

    return null;
}

function checkWindowsDelete(words) {
    const name = commandName(words[0]);
    const args = words.slice(1);

    if (name === "remove-item") {
        const recursive = args.some(
            (arg) =>
                /^-r(ec(urse)?)?$/i.test(arg),
        );

        const force = args.some(
            (arg) =>
                /^-f(orce)?$/i.test(arg),
        );

        const targets = [];

        for (
            let index = 0;
            index < args.length;
            index += 1
        ) {
            const arg = args[index];

            if (
                /^-literalpath$/i.test(arg) ||
                /^-path$/i.test(arg)
            ) {
                if (args[index + 1]) {
                    targets.push(args[index + 1]);
                    index += 1;
                }

                continue;
            }

            if (!arg.startsWith("-")) {
                targets.push(arg);
            }
        }

        if (
            (recursive || force) &&
            targets.some(isBroadTarget)
        ) {
            return "blocked broad Remove-Item target";
        }
    }

    if (
        ["del", "erase", "rd", "rmdir"].includes(name)
    ) {
        const recursive = args.some(
            (arg) =>
                /^\/s$/i.test(arg) ||
                /^-r(ec(urse)?)?$/i.test(arg),
        );

        const targets = args.filter(
            (arg) =>
                !arg.startsWith("/") &&
                !arg.startsWith("-"),
        );

        if (
            recursive &&
            targets.some(isBroadTarget)
        ) {
            return `blocked broad ${name} target`;
        }
    }

    return null;
}

function gitSubcommand(words) {
    let index = 1;

    while (index < words.length) {
        const arg = words[index];

        if (
            [
                "-C",
                "-c",
                "--git-dir",
                "--work-tree",
                "--namespace",
            ].includes(arg)
        ) {
            index += 2;
            continue;
        }

        if (
            arg.startsWith("--git-dir=") ||
            arg.startsWith("--work-tree=") ||
            arg.startsWith("--namespace=")
        ) {
            index += 1;
            continue;
        }

        if (arg.startsWith("-")) {
            index += 1;
            continue;
        }

        return {
            name: commandName(arg),
            args: words.slice(index + 1),
        };
    }

    return {
        name: "",
        args: [],
    };
}

function checkGit(words) {
    const subcommand = gitSubcommand(words);

    if (
        subcommand.name === "reset" &&
        subcommand.args.some(
            (arg) =>
                arg === "--hard",
        )
    ) {
        return "blocked git reset --hard because it discards local work";
    }

    if (subcommand.name === "clean") {
        const dryRun = subcommand.args.some(
            (arg) =>
                arg === "-n" ||
                arg === "--dry-run",
        );

        const force =
            hasShortFlag(
                subcommand.args,
                "f",
            ) ||
            hasLongFlag(
                subcommand.args,
                "--force",
            );

        if (
            force &&
            !dryRun
        ) {
            return "blocked git clean --force because it deletes untracked files";
        }
    }

    if (subcommand.name === "checkout") {
        const force =
            hasShortFlag(
                subcommand.args,
                "f",
            ) ||
            hasLongFlag(
                subcommand.args,
                "--force",
            );

        const separator =
            subcommand.args.indexOf("--");

        const targets =
            separator >= 0
                ? subcommand.args.slice(
                    separator + 1,
                )
                : [];

        if (
            force ||
            targets.some(isBroadTarget)
        ) {
            return "blocked destructive git checkout";
        }
    }

    if (subcommand.name === "restore") {
        const targets =
            positionalArgs(
                subcommand.args,
            );

        if (
            targets.some(isBroadTarget)
        ) {
            return "blocked broad git restore target";
        }
    }

    return null;
}

function checkFind(words) {
    const args = words.slice(1);

    const hasDelete =
        args.includes("-delete");

    const execIndex =
        args.indexOf("-exec");

    const roots = [];

    for (const arg of args) {
        if (
            arg.startsWith("-") ||
            arg === "!" ||
            arg === "(" ||
            arg === ")"
        ) {
            break;
        }

        roots.push(arg);
    }

    const searchRoots =
        roots.length > 0
            ? roots
            : ["."];

    if (
        hasDelete &&
        searchRoots.some(isBroadTarget)
    ) {
        return "blocked broad find -delete";
    }

    if (execIndex >= 0) {
        const execWords =
            stripCommandPrefixes(
                args
                    .slice(execIndex + 1)
                    .filter(
                        (arg) =>
                            arg !== "{}" &&
                            arg !== "\\;",
                    ),
            );

        if (
            commandName(execWords[0]) === "rm" &&
            checkRm(execWords)
        ) {
            return "blocked find -exec rm with destructive options";
        }
    }

    return null;
}

function checkFormatting(words) {
    const name = commandName(words[0]);

    if (
        /^mkfs($|\.)/.test(name) ||
        [
            "fdisk",
            "diskpart",
            "newfs",
        ].includes(name)
    ) {
        return `blocked direct filesystem operation: ${name}`;
    }

    if (name === "format") {
        return "blocked direct filesystem format command";
    }

    if (
        name === "dd" &&
        words
            .slice(1)
            .some(
                (arg) =>
                    /^of=(\/dev\/|\\\\\.\\physicaldrive)/i.test(
                        arg,
                    ),
            )
    ) {
        return "blocked dd writing directly to a device";
    }

    return null;
}

function checkSystemPower(words) {
    const name = commandName(words[0]);

    if (
        [
            "shutdown",
            "reboot",
            "halt",
            "poweroff",
        ].includes(name)
    ) {
        return `blocked system power command: ${name}`;
    }

    return null;
}

function isRemoteFetcher(words) {
    return [
        "curl",
        "wget",
        "wget2",
        "fetch",
        "iwr",
        "irm",
        "invoke-webrequest",
        "invoke-restmethod",
    ].includes(
        commandName(words[0]),
    );
}

function isShellExecutor(words) {
    return [
        "sh",
        "bash",
        "dash",
        "zsh",
        "ksh",
        "fish",
        "pwsh",
        "powershell",
        "iex",
        "invoke-expression",
    ].includes(
        commandName(words[0]),
    );
}

function checkNestedShell(words) {
    const name = commandName(words[0]);

    if (
        ![
            "sh",
            "bash",
            "dash",
            "zsh",
            "ksh",
            "fish",
            "pwsh",
            "powershell",
            "cmd",
        ].includes(name)
    ) {
        return null;
    }

    if (
        [
            "pwsh",
            "powershell",
        ].includes(name) &&
        words.some(
            (arg) =>
                /^-(e|enc|encodedcommand)$/i.test(
                    arg,
                ),
        )
    ) {
        return "blocked encoded PowerShell command";
    }

    const optionIndex =
        words.findIndex(
            (arg) => {
                const lower =
                    arg.toLowerCase();

                if (name === "cmd") {
                    return lower === "/c";
                }

                if (
                    [
                        "pwsh",
                        "powershell",
                    ].includes(name)
                ) {
                    return (
                        lower === "-c" ||
                        lower === "-command"
                    );
                }

                return lower === "-c";
            },
        );

    if (
        optionIndex < 0 ||
        !words[optionIndex + 1]
    ) {
        return null;
    }

    const nested =
        analyzeCommand(
            words
                .slice(optionIndex + 1)
                .join(" "),
        );

    return nested
        ? `blocked nested shell command: ${nested.reason}`
        : null;
}

function checkSegment(words) {
    const normalizedWords =
        stripCommandPrefixes(words);

    const name =
        commandName(
            normalizedWords[0],
        );

    if (!name) {
        return null;
    }

    if (name === "rm") {
        return checkRm(
            normalizedWords,
        );
    }

    if (
        [
            "remove-item",
            "del",
            "erase",
            "rd",
            "rmdir",
        ].includes(name)
    ) {
        return checkWindowsDelete(
            normalizedWords,
        );
    }

    if (name === "git") {
        return checkGit(
            normalizedWords,
        );
    }

    if (name === "find") {
        return checkFind(
            normalizedWords,
        );
    }

    return (
        checkFormatting(
            normalizedWords,
        ) ||
        checkSystemPower(
            normalizedWords,
        ) ||
        checkNestedShell(
            normalizedWords,
        )
    );
}

function analyzeCommand(command) {
    const segments =
        shellSegments(command);

    let previousWords = null;

    for (const segment of segments) {
        const words =
            stripCommandPrefixes(
                segment.words,
            );

        if (
            segment.separatorBefore === "|" &&
            previousWords &&
            isRemoteFetcher(
                stripCommandPrefixes(
                    previousWords,
                ),
            ) &&
            isShellExecutor(words)
        ) {
            return {
                reason:
                    "blocked remote download piped into a shell",
            };
        }

        const reason =
            checkSegment(
                segment.words,
            );

        if (reason) {
            return { reason };
        }

        previousWords =
            segment.words;
    }

    return null;
}

function deny(reason) {
    console.log(
        JSON.stringify({
            hookSpecificOutput: {
                hookEventName:
                    "PreToolUse",
                permissionDecision:
                    "deny",
                permissionDecisionReason:
                    `ROA safety policy: ${reason}.`,
            },
        }),
    );
}

const payload =
    parseInput(
        readInput(),
    );

const command =
    String(
        payload.tool_input
            ?.command ?? "",
    );

const toolName =
    String(
        payload.tool_name ?? "",
    );

if (
    ![
        "Bash",
        "PowerShell",
    ].includes(toolName) ||
    command.trim() === ""
) {
    process.exit(0);
}

const result =
    analyzeCommand(command);

if (result) {
    deny(result.reason);
}