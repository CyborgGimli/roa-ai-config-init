---
name: debug-test-automation
description: Diagnose failing ROA automation by identifying the actual root cause and separating automation defects from application, environment, data, contract, configuration, and framework issues.
allowed-tools: Read, Glob, Grep, Bash, Skill, Agent
---

Diagnose the failing automation for:

```text
$ARGUMENTS
```

You orchestrate the diagnosis; delegate with the `Agent` tool using the exact `subagent_type` given. Subagents cannot delegate further, so collect the evidence they need before launching them.

## Procedure

1. Capture the actual failure: the failing test, compilation error, stack trace, assertion message, or reported behavior. Reproduce it with the `roa-api:run-tests` skill when safe. Use real Maven output, reports, and logs, not assumptions.

2. When the failure could depend on current API behavior — a locator, synchronization condition, rendered text, request or response shape, contract, or data shape — launch `subagent_type: roa-api:api-contract-investigator` to collect current evidence from the Swagger/OpenAPI contract, read through the `swagger` MCP server. Never diagnose such a failure from repository code or memory alone.

3. Launch `subagent_type: roa-api:test-debugger` with the failure evidence and the investigator's findings. It traces the failure path, compares it with passing tests, reads `ai-compass` metadata for the ROA types involved, and classifies the root cause as one of:

    * automation implementation defect;
    * incorrect assertion or expectation;
    * test data or precondition problem;
    * authentication or session problem;
    * environment or configuration failure;
    * API contract or application behavior change;
    * UI locator, timing, or synchronization issue;
    * stale or incorrect ROA framework usage;
    * genuine product defect.

4. Reject a classification that rests on a symptom rather than a traced cause, or on an application fact without evidence. Send it back with what is missing.

5. Do not make tests pass by weakening assertions, deleting coverage, skipping tests, increasing waits blindly, hardcoding unstable values, or masking genuine product failures.

## Return

Provide:

* observed failure and the evidence used (commands, logs, `file_path:line`, MCP observations);
* classified root cause;
* relevant files, symbols, configuration, data, or runtime behavior;
* smallest justified correction when the issue is in automation;
* validation required after correction;
* any external application, environment, contract, data, or framework issue;
* unresolved uncertainty or additional evidence still required.

Do not modify code.
