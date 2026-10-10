# SportsConnect instructions for GitHub Copilot

Follow the repository-wide `AGENTS.md` instructions.

- Use TypeScript strictness and existing Next.js App Router conventions.
- Prefer existing Supabase server/client helpers and Zod validation rather than creating parallel abstractions.
- Preserve Row Level Security and verify ownership/membership checks for every user-specific resource.
- Keep authenticated API responses private and non-cacheable unless the endpoint is intentionally public and contains only public fields.
- Paginate feeds/search/messages and avoid unbounded selects or N+1 queries.
- Do not use service-role keys in browser code or `NEXT_PUBLIC_*` variables.
- For UI changes, check responsive behavior, keyboard navigation, accessible labels, focus states, and empty/loading/error states.
- Add or update tests for behavior changes. Run lint and production build where possible.
- Never deploy, merge, or change live Supabase infrastructure without explicit user approval.
