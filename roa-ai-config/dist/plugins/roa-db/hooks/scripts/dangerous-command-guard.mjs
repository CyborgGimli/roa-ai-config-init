#!/usr/bin/env node
// PreToolUse guard for Bash and PowerShell: block destructive commands before
// they run.
//
// Reads the hook payload on stdin and returns a PreToolUse permission decision.
// Node.js built-ins only.
//
// The guard lexes the command rather than pattern-matching the raw string, so
// `rm  -rf  /`, `rm --recursive --force /`, and `rm -r -f /` are all caught,
// and a match inside a quoted argument is not mistaken for a real flag.
//
// This is a safety net for obvious footguns, not a sandbox. It deliberately
// errs toward allowing: a narrow, well-scoped destructive command is permitted,
// because blocking ordinary work trains people to disable the guard.

import fs from "node:fs";
import process from "node:process";

const GUARDED_TOOLS = new Set(["Bash", "PowerShell"]);
const MAX_NESTING_DEPTH = 4;

const BROAD_TARGETS = new Set([
  "/", "/*", ".", "./", "./*", "..", "../", "../*", "*",
  "~", "~/", "~/*",
  "$HOME", "${HOME}", "$home", "${home}",
  "$PWD", "${PWD}", "$pwd", "${pwd}",
  "$env:home", "$env:userprofile", "%userprofile%", "%homepath%",
  "/home", "/Users", "C:\\", "C:/",
  // Deleting .git destroys history that is often not pushed anywhere yet.
  ".git", "./.git", ".git/",
]);

const REMOTE_FETCHERS = new Set(["curl", "wget", "iwr", "irm", "invoke-webrequest"]);
const SHELL_EXECUTORS = new Set(["sh", "bash", "zsh", "dash", "ksh", "fish", "powershell", "pwsh", "cmd"]);

function isBroadTarget(value) {
  const trimmed = String(value).trim().replace(/^["']|["']$/g, "");
  if (BROAD_TARGETS.has(trimmed)) return true;
  // A bare drive root (C:/, D:\\) or a run of slashes is always too broad.
  return /^[a-z]:[\\\/]+$/i.test(trimmed) || /^[\\\/]+$/.test(trimmed);
}

function commandName(word) {
  if (!word) return "";
  const base = String(word).split(/[\\/]/).pop() ?? "";
  return base.replace(/\.(exe|cmd|bat|ps1)$/i, "").toLowerCase();
}

function word(value) {
  return { type: "word", value };
}

function op(value) {
  return { type: "op", value };
}

// Split a command line into words and operators, honouring quotes and escapes.
//
// PowerShell escapes with a backtick and treats a backslash as an ordinary path
// character, so lexing `C:\Users` with POSIX rules would silently yield
// `C:Users` and defeat every path comparison below.
function lexShell(command, dialect) {
  const escapeChar = dialect === "powershell" ? "`" : "\\";
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
      if (char === escapeChar && (next === '"' || next === escapeChar)) {
        escaped = true;
        continue;
      }
      if (char === '"') {
        quote = "";
      } else {
        current += char;
      }
      continue;
    }

    if (char === escapeChar) {
      escaped = true;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if (/\s/.test(char)) {
      pushWord();
      continue;
    }
    if (char === "|" && next === "|") {
      pushWord();
      tokens.push(op("||"));
      index += 1;
      continue;
    }
    if (char === "&" && next === "&") {
      pushWord();
      tokens.push(op("&&"));
      index += 1;
      continue;
    }
    if (char === "|" || char === ";" || char === "&" || char === "\n") {
      pushWord();
      tokens.push(op(char));
      continue;
    }
    current += char;
  }

  pushWord();
  return tokens;
}

// Group the token stream into individual commands, remembering the operator
// that preceded each so `curl ... | sh` can be recognised as one pipeline.
function shellSegments(command, dialect) {
  const segments = [];
  let words = [];
  let separatorBefore = null;

  for (const token of lexShell(command, dialect)) {
    if (token.type === "op") {
      segments.push({ words, separatorBefore });
      separatorBefore = token.value;
      words = [];
      continue;
    }
    words.push(token.value);
  }
  segments.push({ words, separatorBefore });
  return segments.filter((segment) => segment.words.length > 0);
}

// Strip env assignments and wrappers so the real command is at index 0.
function stripCommandPrefixes(words) {
  const result = [...words];
  while (result.length > 0) {
    const name = commandName(result[0]);
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(result[0])) {
      result.shift();
      continue;
    }
    if (name === "sudo" || name === "doas" || name === "env" || name === "nohup" || name === "time") {
      result.shift();
      continue;
    }
    break;
  }
  return result;
}

function hasShortFlag(args, letter) {
  return args.some((arg) => /^-[A-Za-z]+$/.test(arg) && arg.slice(1).includes(letter));
}

function hasLongFlag(args, name) {
  return args.includes(name);
}

function positionalArgs(args) {
  return args.filter((arg) => !arg.startsWith("-"));
}

function checkRm(words) {
  const args = words.slice(1);
  const recursive = hasShortFlag(args, "r") || hasShortFlag(args, "R") || hasLongFlag(args, "--recursive");
  const force = hasShortFlag(args, "f") || hasLongFlag(args, "--force");
  const targets = positionalArgs(args);

  if ((recursive || force) && targets.some(isBroadTarget)) {
    return "blocked broad rm target; use a narrower path or remove files interactively";
  }

  if (args.some((arg) => arg === "--no-preserve-root")) {
    return "blocked rm --no-preserve-root";
  }

  return null;
}

function checkWindowsDelete(words) {
  const name = commandName(words[0]);
  const args = words.slice(1);

  if (name === "remove-item") {
    const recursive = args.some((arg) => /^-r(ec(urse)?)?$/i.test(arg));
    const force = args.some((arg) => /^-f(orce)?$/i.test(arg));
    const targets = positionalArgs(args);
    if ((recursive || force) && targets.some(isBroadTarget)) {
      return "blocked broad Remove-Item target";
    }
    return null;
  }

  if (name === "del" || name === "erase" || name === "rd" || name === "rmdir") {
    const targets = positionalArgs(args);
    if (targets.some(isBroadTarget)) {
      return "blocked broad delete target";
    }
  }

  return null;
}

function checkGit(words) {
  const args = words.slice(1).filter((arg) => !arg.startsWith("-"));
  const subcommand = { name: args[0], args: words.slice(1) };

  if (subcommand.name === "clean") {
    const flags = subcommand.args.filter((arg) => arg.startsWith("-"));
    const forced = flags.some((arg) => /^-[a-zA-Z]*f/.test(arg));
    const includesIgnored = flags.some((arg) => /^-[a-zA-Z]*x/.test(arg));
    if (forced && includesIgnored) {
      return "blocked git clean -fx; it deletes ignored files including local config";
    }
  }

  if (subcommand.name === "reset") {
    if (subcommand.args.includes("--hard") && positionalArgs(subcommand.args).length <= 1) {
      return "blocked bare git reset --hard; stash or name an explicit ref instead";
    }
  }

  if (subcommand.name === "push") {
    const forced = subcommand.args.some((arg) => arg === "--force" || /^-[a-zA-Z]*f$/.test(arg));
    if (forced && !subcommand.args.includes("--force-with-lease")) {
      return "blocked git push --force; use --force-with-lease";
    }
  }

  if (subcommand.name === "restore") {
    const targets = positionalArgs(subcommand.args);
    if (targets.some(isBroadTarget)) {
      return "blocked broad git restore target";
    }
  }

  return null;
}

function checkFind(words) {
  const args = words.slice(1);
  const hasDelete = args.includes("-delete");
  const execIndex = args.indexOf("-exec");
  const roots = [];

  for (const arg of args) {
    if (arg.startsWith("-") || arg === "!" || arg === "(" || arg === ")") {
      break;
    }
    roots.push(arg);
  }

  const searchRoots = roots.length > 0 ? roots : ["."];

  if (hasDelete && searchRoots.some(isBroadTarget)) {
    return "blocked broad find -delete";
  }

  if (execIndex >= 0) {
    const execCommand = commandName(args[execIndex + 1]);
    if (execCommand === "rm" && searchRoots.some(isBroadTarget)) {
      return "blocked broad find -exec rm";
    }
  }

  return null;
}

function checkFormatting(words) {
  const name = commandName(words[0]);
  if (name === "mkfs" || name.startsWith("mkfs.")) {
    return "blocked filesystem format command";
  }
  if (name === "fdisk" || name === "parted" || name === "diskpart") {
    return "blocked disk partitioning command";
  }
  if (name === "dd") {
    const of = words.find((arg) => arg.startsWith("of="));
    if (of && /^of=\/dev\//.test(of)) {
      return "blocked dd writing directly to a device";
    }
  }
  return null;
}

function checkSystemPower(words) {
  const name = commandName(words[0]);
  if (["shutdown", "reboot", "halt", "poweroff"].includes(name)) {
    return "blocked system power command";
  }
  if (name === "kill" && words.includes("-9") && words.includes("1")) {
    return "blocked kill -9 1";
  }
  return null;
}

function checkPermissions(words) {
  const name = commandName(words[0]);
  if (name === "chmod" || name === "chown") {
    const args = words.slice(1);
    const recursive = hasShortFlag(args, "R") || hasLongFlag(args, "--recursive");
    if (recursive && positionalArgs(args).some(isBroadTarget)) {
      return `blocked recursive ${name} on a broad target`;
    }
  }
  return null;
}

// A destructive command hidden behind `bash -c`, `pwsh -Command`, or `cmd /c`
// is still destructive, so unwrap it and run the same checks on the payload.
function checkNestedShell(words, depth) {
  const name = commandName(words[0]);
  if (!SHELL_EXECUTORS.has(name)) return null;

  const isPowerShell = name === "powershell" || name === "pwsh";

  if (isPowerShell && words.some((arg) => /^-(e|ec|enc|encodedcommand)$/i.test(arg))) {
    return "blocked base64-encoded PowerShell command; pass the command in clear text";
  }

  const flagIndex = words.findIndex((arg) => {
    const lower = arg.toLowerCase();
    if (name === "cmd") return lower === "/c" || lower === "/k";
    if (isPowerShell) return lower === "-c" || lower === "-command";
    return lower === "-c";
  });

  const payload = words.slice(flagIndex + 1).join(" ");
  if (flagIndex < 0 || !payload.trim()) return null;

  const nested = analyzeCommand(payload, isPowerShell ? "powershell" : "posix", depth + 1);
  return nested ? `blocked nested shell command: ${nested.reason}` : null;
}

function isRemoteFetcher(words) {
  return REMOTE_FETCHERS.has(commandName(words[0]));
}

function isShellExecutor(words) {
  return SHELL_EXECUTORS.has(commandName(words[0]));
}

function checkSegment(words, depth) {
  const normalizedWords = stripCommandPrefixes(words);
  const name = commandName(normalizedWords[0]);
  if (!name) return null;

  if (name === "rm") return checkRm(normalizedWords);
  if (["remove-item", "del", "erase", "rd", "rmdir"].includes(name)) return checkWindowsDelete(normalizedWords);
  if (name === "git") return checkGit(normalizedWords);
  if (name === "find") return checkFind(normalizedWords);

  return (
    checkFormatting(normalizedWords) ||
    checkSystemPower(normalizedWords) ||
    checkPermissions(normalizedWords) ||
    checkNestedShell(normalizedWords, depth)
  );
}

function analyzeCommand(command, dialect, depth = 0) {
  if (depth > MAX_NESTING_DEPTH) return null;

  const segments = shellSegments(command, dialect);
  let previousWords = null;

  for (const segment of segments) {
    const words = stripCommandPrefixes(segment.words);

    if (
      segment.separatorBefore === "|" &&
      previousWords &&
      isRemoteFetcher(stripCommandPrefixes(previousWords)) &&
      isShellExecutor(words)
    ) {
      return { reason: "blocked remote download piped into a shell" };
    }

    const reason = checkSegment(segment.words, depth);
    if (reason) {
      return { reason };
    }

    previousWords = segment.words;
  }

  return null;
}

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function deny(reason) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          `ROA safety policy: ${reason}. If this is genuinely intended, run it ` +
          "yourself or narrow the command.",
      },
    })
  );
}

function main() {
  let payload;
  try {
    payload = JSON.parse(readStdin() || "{}");
  } catch {
    process.exit(0); // Unreadable payload: do not block ordinary work.
  }

  if (!GUARDED_TOOLS.has(String(payload?.tool_name ?? ""))) {
    process.exit(0);
  }

  const command = payload?.tool_input?.command;
  if (typeof command !== "string" || !command.trim()) {
    process.exit(0);
  }

  const dialect = payload.tool_name === "PowerShell" ? "powershell" : "posix";
  const verdict = analyzeCommand(command, dialect);
  if (!verdict) {
    process.exit(0);
  }

  deny(verdict.reason);
  process.exit(0);
}

main();
