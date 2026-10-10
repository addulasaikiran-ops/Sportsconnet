---
name: tdd
description: Use when implementing bug fixes, business logic, API routes, database policies, validation, or other behavior that can be tested.
---

# Test-driven development

Use a red-green-refactor loop where practical.

## Red
- Write or update a focused test that expresses the expected behavior before changing implementation.
- Include a regression case for a reported bug.
- Cover both allowed and denied access for authorization-sensitive behavior.
- For input validation, cover valid, invalid, boundary, and malformed inputs where relevant.

## Green
- Make the smallest implementation change that makes the test pass.
- Preserve existing API response shapes and behavior unless the change intentionally updates the contract.
- Do not solve failing tests by weakening assertions or removing meaningful coverage.

## Refactor
- Improve names and structure without changing behavior; rerun affected tests.
- Add integration tests for database/RLS/storage behavior when infrastructure permits. Clearly distinguish static review from a real two-user integration test.

## Verification checklist
- Run the relevant test command(s), then lint, type checking, and build where available.
- If the repository has no test harness for the behavior, say so and use the strongest practical checks; do not add a large test framework without weighing its cost.
- For Supabase changes, review migrations, grants, RLS policies, storage policies, and both owner/non-owner paths.
- Never run destructive tests against production data. Use a dedicated test project or isolated fixtures.
