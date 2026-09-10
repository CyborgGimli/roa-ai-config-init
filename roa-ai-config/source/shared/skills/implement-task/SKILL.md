---
name: implement-task
description: Implement an approved ROA change following the repository's existing patterns and the module's architecture. Use after plan-task.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write, Task, Skill
---

Implement the agreed plan.

First load this plugin's task profile — `roa-api-task-profile`,
`roa-ui-task-profile`, or `roa-db-task-profile` — for the stack, the rules that
apply, and the standard task sequence. Everything below is stack-agnostic; the
profile supplies the specifics.

1. Read the neighbouring code first; match its naming and structure.
2. Before generating a new class, load `ai-teacher` and take the closest
   `EXCELLENT` lesson as the reference shape. Never use a `BAD` lesson as a
   template.
3. Work bottom-up - the shared definition first, then the test that uses it.
   UI: element locators, then the component implementation, then the test.
   API: the `Endpoint`, then the DTO and JSONPaths, then the test.
   DB: the `DbQuery` and `DbType`, then the test.
4. Reach capabilities through the ring; end every chain with `.complete()`.
5. Wait on the real condition - never `Thread.sleep`.
6. Create data through a `DataCreator`, remove it through a `DataCleaner`.
7. Compile as you go with `mvn clean compile`. When a ROA call does not compile,
   load `ai-compass` and read the metadata before trying another signature.

Then run the tests through `run-tests`. If they fail, establish the cause with
`debug` before changing anything, and repair with `fix-tests` only when the cause
is an automation defect.

Do not mark the work done from this skill. Run `validate-code` and report its
evidence; use `review-change` as well when the change is large or risk-sensitive.
If the plan proves wrong mid-flight, say so and explain what you did instead
rather than silently redesigning.
