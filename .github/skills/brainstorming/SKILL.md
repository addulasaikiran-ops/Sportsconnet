---
name: brainstorming
description: Use before implementing a feature or UX change when requirements, workflows, or design choices are not already clear.
---

# Brainstorming for SportsConnect

Before implementation, align on the problem and intended user outcome.

1. **Understand the context.** Inspect the relevant pages, components, API routes, schema, and existing design conventions. Identify which roles are affected: athlete/player, coach, club/academy, or association.
2. **Ask one focused question at a time** when a missing decision materially changes the design. Avoid long forms and avoid asking about details that can safely follow existing conventions.
3. **Explore alternatives.** For meaningful choices, compare up to three approaches and explain complexity, usability, security, and maintenance trade-offs.
4. **Recommend a default.** Prefer accessible, responsive, incremental solutions consistent with Next.js, TypeScript, and Supabase. Keep the current product architecture unless there is a concrete reason to change it.
5. **Define acceptance criteria.** Include normal flow, validation, empty/loading/error states, permissions, mobile behavior, and any relevant privacy requirements.
6. **Only then implement.** For a small, unambiguous bug fix, do not create unnecessary ceremony; state the intended fix and proceed.

Do not invent product requirements, claim mock data is persistent, or imply that a UI-only change is backed by production data.
