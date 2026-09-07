---
name: implement-task
description: Implement an approved ROA change following the three-layer architecture and the repository's existing patterns. Use after plan-task.
allowed-tools: Read, Glob, Grep, Bash, Edit, Write, Task, Skill
---

Implement the agreed plan.

1. Read the neighbouring code first; match its naming and structure.
2. Work bottom-up - element locators, then components, then the test.
3. Wait through `SmartWebDriver`; never `Thread.sleep`.
4. Create data through a `DataCreator`, remove it through a `DataCleaner`.
5. Compile as you go with `mvn clean compile`.

Do not mark the work done from this skill. Run `validate-code` and report its
evidence. If the plan proves wrong mid-flight, say so and explain what you did
instead rather than silently redesigning.
