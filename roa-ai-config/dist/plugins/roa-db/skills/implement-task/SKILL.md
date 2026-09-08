---
name: implement-task
description: Implement an approved ROA change following the repository's existing patterns and the module's architecture. Use after plan-task.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write, Task, Skill
---

Implement the agreed plan.

1. Read the neighbouring code first; match its naming and structure.
2. Work bottom-up - the shared definition first, then the test that uses it.
   UI: element locators, then the component implementation, then the test.
   API: the `Endpoint`, then the DTO and JSONPaths, then the test.
   DB: the `DbQuery` and `DbType`, then the test.
3. Reach capabilities through the ring; end every chain with `.complete()`.
4. Wait on the real condition - never `Thread.sleep`.
5. Create data through a `DataCreator`, remove it through a `DataCleaner`.
6. Compile as you go with `mvn clean compile`.

Do not mark the work done from this skill. Run `validate-code` and report its
evidence. If the plan proves wrong mid-flight, say so and explain what you did
instead rather than silently redesigning.
