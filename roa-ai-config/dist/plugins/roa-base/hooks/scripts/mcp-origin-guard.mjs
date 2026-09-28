#!/usr/bin/env node
// ROA PreToolUse guard for browser MCP tools and WebFetch.
//
// Browser/DevTools MCP servers load untrusted pages, and a page can carry text
// written to steer the model. Keeping navigation to the application under test
// limits both what the model reads and where it can send data. The allowlist
// comes from `security.allowedOrigins` in ai-config.yaml, which setup copies to
// .claude/roa-security.json.
//
//   - file:, data:, javascript: URLs                       -> deny (local files, script)
//   - localhost / 127.0.0.1 / [::1] / about:blank           -> allow
//   - origin in allowedOrigins                              -> allow
//   - browser MCP navigation elsewhere                      -> deny (ask while
//                                                              allowedOrigins is empty)
//   - WebFetch elsewhere                                    -> ask
//   - scripts evaluated in the page that name another origin
//     or use sendBeacon / WebSocket                         -> deny

import fs from "node:fs";
import path from "node:path";
import {
    currentWorkingDirectory,
    readPayload,
} from "./java-hook-utils.mjs";

const URL_KEYS = ["url", "uri", "href", "target_url", "targetUrl", "page_url"];
const SCRIPT_KEYS = ["script", "function", "expression", "code", "js"];

function decide(decision, reason) {
    console.log(
        JSON.stringify({
            hookSpecificOutput: {
                hookEventName: "PreToolUse",
                permissionDecision: decision,
                permissionDecisionReason: `ROA browser policy: ${reason}`,
            },
        }),
    );
    process.exit(0);
}

function allowedOrigins(cwd) {
    try {
        const policy = JSON.parse(
            fs.readFileSync(path.join(cwd, ".claude", "roa-security.json"), "utf8"),
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

// "allow" | "local-file" | "blocked-scheme" | "outside"
function classify(urlText, origins) {
    let url;
    try {
        url = new URL(String(urlText).trim());
    } catch {
        return "allow"; // relative or not a URL: the tool resolves it against the current page
    }

    const scheme = url.protocol.toLowerCase();

    if (scheme === "file:") {
        return "local-file";
    }
    if (["data:", "javascript:", "vbscript:"].includes(scheme)) {
        return "blocked-scheme";
    }
    if (scheme === "about:") {
        return "allow";
    }
    if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname.toLowerCase())) {
        return "allow";
    }
    return origins.includes(url.origin.toLowerCase()) ? "allow" : "outside";
}

const payload = readPayload();
const toolName = String(payload.tool_name ?? "");
const input = payload.tool_input ?? {};
const isWebFetch = toolName === "WebFetch";

if (!isWebFetch && !toolName.startsWith("mcp__")) {
    process.exit(0);
}

// Only browser-driving servers are governed here; github/swagger/etc. are not.
if (!isWebFetch && !/^mcp__(chrome-devtools|browser|selenium|puppeteer|playwright)__/.test(toolName)) {
    process.exit(0);
}

const origins = allowedOrigins(currentWorkingDirectory(payload));
const configured = origins.length > 0 ? `allowed origins: ${origins.join(", ")}` : "security.allowedOrigins is empty";

for (const key of URL_KEYS) {
    if (typeof input[key] !== "string" || !input[key]) {
        continue;
    }

    const verdict = classify(input[key], origins);

    if (verdict === "local-file") {
        decide("deny", `${toolName} must not open local files (${input[key]}).`);
    }
    if (verdict === "blocked-scheme") {
        decide("deny", `${toolName} must not open ${new URL(input[key]).protocol} URLs.`);
    }
    if (verdict === "outside") {
        // Nothing configured yet: let the user decide each navigation instead of
        // silently breaking investigation on a freshly set-up repository.
        if (isWebFetch || origins.length === 0) {
            decide("ask", `${input[key]} is outside the application under test (${configured}).`);
        }
        decide(
            "deny",
            `${input[key]} is outside the application under test (${configured}). ` +
                "Add the application origin to security.allowedOrigins in ai-config.yaml and rerun /roa-base:setup.",
        );
    }
}

for (const key of SCRIPT_KEYS) {
    if (typeof input[key] !== "string" || !input[key]) {
        continue;
    }

    const script = input[key];

    if (/\bsendBeacon\b|\bnew\s+WebSocket\b|\bEventSource\b/.test(script)) {
        decide("deny", "scripts run in the page must not open beacons or sockets.");
    }

    const foreign = [...script.matchAll(/\b(?:https?|wss?):\/\/[^\s'"`)]+/gi)]
        .map((match) => match[0])
        .find((url) => classify(url, origins) !== "allow");

    if (foreign) {
        decide("deny", `scripts run in the page must not reach ${foreign} (${configured}).`);
    }
}
