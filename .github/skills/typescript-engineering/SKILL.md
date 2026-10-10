---
name: typescript-engineering
description: Use for TypeScript, React, Next.js App Router, API route, and Supabase changes in SportsConnect.
---

# TypeScript and Next.js engineering

- Follow the repository's existing Next.js 15 App Router and React 19 patterns. Check nearby code before introducing a new pattern.
- Keep types precise. Avoid `any`, unsafe casts, non-null assertions, and duplicated domain types unless justified; validate untrusted input at runtime with the existing validation approach (Zod where already used).
- Keep server-only credentials and privileged Supabase clients in server-only modules. Never expose service-role keys or secrets through `NEXT_PUBLIC_*`, client components, logs, or error messages.
- Treat every API request as untrusted. Validate body, query, path parameters, authentication, authorization, and rate limits at the server boundary.
- Enforce access on the server and in Supabase RLS; hiding a button or route in the UI is not authorization.
- In React, keep components focused, use stable keys, handle asynchronous state and errors, and avoid effects when derived state or server rendering is more appropriate.
- Preserve accessibility: semantic HTML, labels, keyboard access, visible focus, and clear validation messages.
- Avoid unnecessary dependencies and broad rewrites. Keep API contracts and migrations backward-compatible where possible.
- For database changes, add a migration rather than relying on manual dashboard-only edits. Review rollback implications and RLS policy behavior.
- Run lint/build and relevant tests. Report any checks that could not run.
