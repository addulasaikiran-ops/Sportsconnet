# SportsConnect instructions for GitHub Copilot

Follow `AGENTS.md` for repository-wide constraints and use relevant project-local Agent Skills in `.github/skills/` when their descriptions match the task.

- For unclear or multi-step work, use `brainstorming` and `superpowers-workflow` before implementation.
- For behavior changes, use `tdd` and add focused regression coverage where practical.
- For TypeScript, React, Next.js App Router, or Supabase work, apply `typescript-engineering`.
- For UI work, apply `ui-ux-pro-max`; before shipping, apply `web-quality` to the relevant risks.
- Prefer existing Supabase server/client helpers and Zod validation rather than creating parallel abstractions.
- Preserve Row Level Security and verify ownership/membership checks for every user-specific resource.
- Keep authenticated API responses private and non-cacheable unless the endpoint is intentionally public and contains only public fields.
- Paginate feeds/search/messages and avoid unbounded selects or N+1 queries.
- Do not use service-role keys in browser code or `NEXT_PUBLIC_*` variables.
- For UI changes, check responsive behavior, keyboard navigation, accessible labels, focus states, and empty/loading/error states.
- Add or update tests for behavior changes. Run lint and production build where possible.
- Never deploy, merge, or change live Supabase infrastructure without explicit user approval.
