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

        // PowerShell escapes with a backtick and treats "\" as a path separator;
        // bash escapes with "\" and, inside double quotes, only before $ ` " \.
        const isPowerShell =
            globalThis.ROA_SHELL === "PowerShell";

        if (quote === '"') {
            if (char === '"') {
                quote = "";
            } else if (
                isPowerShell
                    ? char === "`"
                    : char === "\\" && /[$`"\\\n]/.test(next)
            ) {
                escaped = true;
            } else {
                current += char;
            }
            continue;
        }

        if (isPowerShell ? char === "`" : char === "\\") {
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

    // `rm -rf $(pwd)` lexes to the target "$", and `rm -rf $DIR/*` depends on a
    // variable the guard cannot see; neither can be proven narrow.
    if (
        recursive &&
        force &&
        targets.some((target) => /[$`%]/.test(target))
    ) {
        return "blocked rm -rf on an unexpanded variable or command substitution; use a literal path";
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

// History-rewriting, remote-destroying and hook-bypassing git operations. The
// settings deny rules are prefix matches, so `git -C . push -f` slips past
// them; this check looks at the parsed subcommand instead.
function checkGitRemoteAndHistory(words, subcommand) {
    const args = subcommand.args;

    if (
        words.some(
            (arg) =>
                arg === "--no-verify" ||
                /^core\.hookspath=/i.test(arg),
        )
    ) {
        return "blocked git hook bypass (--no-verify / core.hooksPath)";
    }

    if (subcommand.name === "push") {
        const forced =
            hasShortFlag(args, "f") ||
            ["--force", "--force-with-lease", "--force-if-includes", "--mirror", "--delete", "--prune"].some(
                (flag) => hasLongFlag(args, flag),
            ) ||
            hasShortFlag(args, "d") ||
            positionalArgs(args).some(
                (arg) => arg.startsWith("+") || arg.startsWith(":"),
            );

        if (forced) {
            return "blocked destructive git push (force, delete, mirror or +refspec)";
        }
    }

    if (
        subcommand.name === "branch" &&
        (
            args.includes("-D") ||
            (
                (hasLongFlag(args, "--delete") || hasShortFlag(args, "d")) &&
                (hasLongFlag(args, "--force") || hasShortFlag(args, "f"))
            )
        )
    ) {
        return "blocked forced git branch deletion";
    }

    if (
        subcommand.name === "stash" &&
        ["clear", "drop"].includes(args[0])
    ) {
        return `blocked git stash ${args[0]} because it discards saved work`;
    }

    if (
        ["filter-branch", "filter-repo", "replace"].includes(subcommand.name) ||
        (subcommand.name === "update-ref" && (args.includes("-d") || args.includes("--delete"))) ||
        (subcommand.name === "reflog" && ["expire", "delete"].includes(args[0])) ||
        (subcommand.name === "gc" && args.some((arg) => /^--prune=now$/.test(arg)))
    ) {
        return `blocked git ${subcommand.name} because it rewrites or discards history`;
    }

    if (
        subcommand.name === "checkout" &&
        !args.includes("--") &&
        positionalArgs(args).some(isBroadTarget)
    ) {
        return "blocked git checkout of a broad pathspec because it discards local changes";
    }

    return null;
}

function checkGit(words) {
    const subcommand = gitSubcommand(words);

    const remoteOrHistory =
        checkGitRemoteAndHistory(words, subcommand);

    if (remoteOrHistory) {
        return remoteOrHistory;
    }

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

// ---------------------------------------------------------------------------
// Secrets and outbound data. The settings deny rules only cover the Read tool;
// these checks cover the same material when it is reached through a shell.
// ---------------------------------------------------------------------------

const SENSITIVE_NAME =
    /(TOKEN|SECRET|PASSW(OR)?D|PASSPHRASE|API_?KEY|ACCESS_?KEY|PRIVATE_?KEY|CREDENTIAL)/i;

const SECRET_PATHS = [
    /(^|[\\/])\.env(\.(?!example$|sample$|template$|dist$)[\w.-]+)?$/i,
    /\.(pem|key|p12|pfx|jks|keystore)$/i,
    /(^|[\\/])id_(rsa|ed25519|ecdsa|dsa)$/i,
    /(^|[\\/])\.git-credentials$/i,
    /(^|[\\/])\.npmrc$/i,
    /(^|[\\/])\.ssh[\\/]/i,
    /(^|[\\/])\.aws[\\/]/i,
    /(^|[\\/])\.docker[\\/]config\.json$/i,
    /(^|[\\/])\.config[\\/]gh[\\/]/i,
    /(^|[\\/])\.m2[\\/]settings(-security\d?)?\.xml$/i,
    /(^|[\\/])\.gradle[\\/]gradle\.properties$/i,
];

// Commands that only name a path without revealing or moving its content.
const PATH_ONLY_COMMANDS = new Set([
    "ls", "dir", "get-childitem", "gci", "test-path", "test", "stat", "echo", "write-output",
    // Maven reads ~/.m2/settings.xml itself (e.g. `mvn -s`); it does not print it.
    "mvn", "mvnw",
]);

const PATH_ONLY_GIT = new Set(["status", "check-ignore", "rm", "ls-files"]);

function stripQuotes(value) {
    return String(value ?? "").replace(/^['"(]+|['");]+$/g, "");
}

function isSecretPath(value) {
    const candidate = stripQuotes(value);
    return Boolean(candidate) && SECRET_PATHS.some((pattern) => pattern.test(candidate));
}

function checkSecretFileAccess(words) {
    const name = commandName(words[0]);

    if (PATH_ONLY_COMMANDS.has(name)) {
        return null;
    }

    if (name === "git" && PATH_ONLY_GIT.has(gitSubcommand(words).name)) {
        return null;
    }

    const hit = words.slice(1).find(
        (arg) =>
            isSecretPath(arg) ||
            // -Path/--file=... style: check the value after "=".
            (arg.includes("=") && isSecretPath(arg.slice(arg.indexOf("=") + 1))),
    );

    return hit
        ? `blocked shell access to a credential file (${stripQuotes(hit)}); secrets must not enter the conversation`
        : null;
}

function checkEnvironmentDump(rawWords) {
    const name = commandName(rawWords[0]);
    const rest = rawWords.slice(1);

    if (name === "printenv") {
        return "blocked environment dump (printenv)";
    }

    if (name === "env" && rest.every((arg) => arg.startsWith("-"))) {
        return "blocked environment dump (env)";
    }

    if (name === "set" && rest.length === 0) {
        return "blocked environment dump (set)";
    }

    if (
        (name === "export" && (rest.length === 0 || rest.includes("-p"))) ||
        (name === "declare" && rest.some((arg) => /^-[a-z]*[xp]/.test(arg)))
    ) {
        return `blocked environment dump (${name})`;
    }

    if (
        ["get-childitem", "gci", "dir", "ls", "get-item", "gi"].includes(name) &&
        rest.some((arg) => /^env:/i.test(stripQuotes(arg)))
    ) {
        return "blocked environment dump (env: drive)";
    }

    return null;
}

// Scans the raw command text, because variable references survive in any quoting
// the lexer would otherwise normalise away.
function checkSensitiveVariableReference(command) {
    const references = [
        ...command.matchAll(/\$(?:env:)?\{?([A-Za-z_][A-Za-z0-9_]*)/gi),
        ...command.matchAll(/%([A-Za-z_][A-Za-z0-9_]*)%/g),
        ...command.matchAll(/(?:process\.env|os\.environ|getenv)\W{0,4}([A-Za-z_][A-Za-z0-9_]*)/g),
    ];

    const sensitive = references.find(
        (match) => SENSITIVE_NAME.test(match[1]),
    );

    if (sensitive) {
        return `blocked reference to secret-bearing variable ${sensitive[1]}`;
    }

    if (
        /GetEnvironmentVariables\s*\(/i.test(command) ||
        /process\.env(?!\s*[.[])/.test(command) ||
        /os\.environ(?!\s*[.[])/.test(command)
    ) {
        return "blocked whole-environment access";
    }

    return null;
}

function loadAllowedOrigins() {
    try {
        const cwd = String(globalThis.ROA_PAYLOAD?.cwd || process.cwd());
        const policy = JSON.parse(
            fs.readFileSync(`${cwd}/.claude/roa-security.json`, "utf8"),
        );
        return (Array.isArray(policy.allowedOrigins) ? policy.allowedOrigins : [])
            .map((origin) => {
                try {
                    return new URL(String(origin)).origin.toLowerCase();
                } catch {
                    return null;
                }
            })
            .filter(Boolean);
    } catch {
        return [];
    }
}

function isAllowedDestination(urlText) {
    let url;
    try {
        url = new URL(stripQuotes(urlText));
    } catch {
        return false;
    }

    if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname.toLowerCase())) {
        return true;
    }

    return loadAllowedOrigins().includes(url.origin.toLowerCase());
}

const WRITE_METHODS = /^(post|put|patch|delete)$/i;

function checkOutboundData(words) {
    const name = commandName(words[0]);
    const args = words.slice(1);

    if (["scp", "sftp", "ftp", "nc", "ncat", "netcat", "socat", "telnet"].includes(name)) {
        return `blocked outbound transfer tool ${name}`;
    }

    if (
        name === "rsync" &&
        args.some(
            (arg) =>
                arg.includes("::") ||
                (/^[\w.-]+(@[\w.-]+)?:/.test(arg) && !/^[a-z]:[\\/]/i.test(arg)),
        )
    ) {
        return "blocked rsync to a remote host";
    }

    let sendsData = false;

    if (name === "curl") {
        sendsData =
            hasShortFlag(args, "d") ||
            hasShortFlag(args, "F") ||
            hasShortFlag(args, "T") ||
            args.some((arg) => /^--(data|data-[a-z]+|form|form-string|upload-file|json)(=|$)/.test(arg)) ||
            args.some((arg, index) =>
                (arg === "-X" || arg === "--request") && WRITE_METHODS.test(stripQuotes(args[index + 1])),
            ) ||
            args.some((arg) => /^--request=/.test(arg) && WRITE_METHODS.test(arg.split("=")[1]));
    } else if (["wget", "wget2"].includes(name)) {
        sendsData =
            args.some((arg) => /^--(post-data|post-file|body-data|body-file)(=|$)/.test(arg)) ||
            args.some((arg) => /^--method=/.test(arg) && WRITE_METHODS.test(arg.split("=")[1]));
    } else if (["iwr", "irm", "invoke-webrequest", "invoke-restmethod"].includes(name)) {
        sendsData =
            args.some((arg) => /^-(body|infile|form)$/i.test(arg)) ||
            args.some((arg, index) => /^-method$/i.test(arg) && WRITE_METHODS.test(stripQuotes(args[index + 1])));
    } else {
        return null;
    }

    if (!sendsData) {
        return null;
    }

    const urls = args.filter((arg) => /^['"]?[a-z][a-z0-9+.-]*:\/\//i.test(arg));

    if (urls.length > 0 && urls.every(isAllowedDestination)) {
        return null;
    }

    return `blocked ${name} sending data to a host outside security.allowedOrigins`;
}

function checkSegment(words) {
    const dump =
        checkEnvironmentDump(words);

    if (dump) {
        return dump;
    }

    const normalizedWords =
        stripCommandPrefixes(words);

    const name =
        commandName(
            normalizedWords[0],
        );

    if (!name) {
        return null;
    }

    const leak =
        checkSecretFileAccess(normalizedWords) ||
        checkOutboundData(normalizedWords);

    if (leak) {
        return leak;
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
    const variableReason =
        checkSensitiveVariableReference(command);

    if (variableReason) {
        return {
            reason: variableReason,
        };
    }

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

globalThis.ROA_PAYLOAD =
    payload;

const command =
    String(
        payload.tool_input
            ?.command ?? "",
    );

const toolName =
    String(
        payload.tool_name ?? "",
    );

globalThis.ROA_SHELL =
    toolName;

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