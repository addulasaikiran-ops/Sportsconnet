# SportsConnect

SportsConnect is a responsive sports networking platform for athletes, coaches, clubs/academies and associations.

This repository contains the Next.js + TypeScript frontend, server-side API Route Handlers, Supabase server client, and an initial database/RLS migration. The frontend's feed and social controls still use local mock state in this phase; signup and login now call the auth APIs.

## Requirements

- Node.js 20.9+
- npm
- A Supabase project for the backend features

## Run locally

1. Clone the repository and install packages:

   ```bash
   git clone https://github.com/addulasaikiran-ops/Sportsconnet.git
   cd Sportsconnet
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase Project URL and publishable key (or legacy anon key):

   ```bash
   cp .env.example .env.local
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000.

The health endpoint at `/api/health` reports whether the expected Supabase environment variables are present. It does not reveal any keys or verify that database migrations have been applied.

## Configure the database

The schema migration is stored at:

`supabase/migrations/202610100001_initial_sportsconnect_schema.sql`

Use a Supabase project intended for SportsConnect. After installing/using the Supabase CLI and authenticating, link your chosen project and apply the migration:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Review the migration and confirm the project reference before running `db push`. The migration creates profiles, posts/media, follows, reactions, comments, opportunities/applications, conversations/members/messages and notifications, along with indexes, auth-profile bootstrap logic, notification triggers and Row Level Security policies.

**This repository's migration has not been applied to a remote database by the frontend build process.** Apply it only to the intended SportsConnect Supabase project.

## API reference

All API routes are implemented with Next.js App Router Route Handlers. Authenticated routes use the Supabase auth session stored in cookies, validate inputs, and rely on database RLS as the final access-control layer.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/health` | Service and env readiness | No |
| POST | `/api/auth/signup` | Create account via Supabase Auth | No |
| POST | `/api/auth/login` | Sign in with email/password | No |
| POST | `/api/auth/logout` | Sign out and clear session | Session optional |
| GET, PATCH | `/api/profile` | Read/update current user's profile | Yes |
| GET, POST | `/api/posts` | Paginated feed and create post | POST: Yes |
| POST, DELETE | `/api/posts/:postId/reactions` | Add/change/remove a reaction | Yes |
| GET, POST | `/api/posts/:postId/comments` | List/add comments | POST: Yes |
| GET | `/api/users` | Search public profiles by name, role, sport, location | No |
| GET | `/api/users/:userId` | Read a public profile by UUID or username | No |
| POST, DELETE | `/api/users/:userId/follow` | Follow/unfollow a profile | Yes |
| GET, POST | `/api/opportunities` | Search/list and create opportunities | POST: Yes |
| GET, PATCH, DELETE | `/api/opportunities/:opportunityId` | Read opportunity; edit/delete as owner | PATCH/DELETE: Yes |
| GET, POST | `/api/opportunities/:opportunityId/applications` | List visible applications / apply | Yes |
| GET, POST | `/api/conversations` | List or start a direct conversation | Yes |
| GET, POST | `/api/conversations/:conversationId/messages` | List/send private messages | Yes |
| GET, PATCH | `/api/notifications` | List notifications and mark them read | Yes |

Pagination endpoints accept `limit` and `page` query parameters. The maximum page size is capped server-side. Search and mutation payloads are validated with Zod. The database uses RLS to limit updates to the current user and restrict messages to conversation members.

## Environment variables

`.env.example` documents the supported values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (preferred)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy fallback)

Only use a publishable/anon key in these variables. Never expose the Supabase `service_role` or secret key in client code or any `NEXT_PUBLIC_*` variable.

## File structure

```text
Sportsconnet/
├── app/
│   ├── api/
│   │   ├── auth/{signup,login,logout}/route.ts
│   │   ├── health/route.ts
│   │   ├── profile/route.ts
│   │   ├── posts/route.ts
│   │   ├── posts/[postId]/{comments,reactions}/route.ts
│   │   ├── users/route.ts
│   │   ├── users/[userId]/route.ts
│   │   ├── users/[userId]/follow/route.ts
│   │   ├── opportunities/route.ts
│   │   ├── opportunities/[opportunityId]/route.ts
│   │   ├── opportunities/[opportunityId]/applications/route.ts
│   │   ├── conversations/route.ts
│   │   ├── conversations/[conversationId]/messages/route.ts
│   │   └── notifications/route.ts
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── discover/page.tsx
│   ├── opportunities/page.tsx
│   ├── messages/page.tsx
│   ├── saved/page.tsx
│   ├── notifications/page.tsx
│   ├── profile/page.tsx
│   ├── athletes/page.tsx
│   ├── athletes/[username]/page.tsx
│   ├── coaches-clubs/page.tsx
│   ├── leaderboard/page.tsx
│   ├── help/page.tsx
│   ├── login/page.tsx
│   └── signup/page.tsx
├── components/
│   ├── sportsconnect-shell.tsx
│   └── auth-form.tsx
├── lib/
│   ├── api/{error,http}.ts
│   └── supabase/server.ts
├── supabase/
│   ├── config.toml
│   └── migrations/202610100001_initial_sportsconnect_schema.sql
├── .env.example
├── .github/workflows/ci.yml
├── package.json
└── README.md
```

## Validation commands

```bash
npm run lint
npm run build
npm run start
```

A GitHub Actions workflow also runs lint and a production build on pushes to `main` and pull requests.

## Current scope and follow-up work

- Login and signup call the new Supabase Auth API endpoints. Email confirmation depends on your Supabase Auth settings.
- Feed, discover, messages and opportunities screens still use mock data until the UI is wired to the new endpoints.
- File/media upload and signed URL handling are not included yet.
- Before production, add rate limiting/abuse protection, password recovery, moderation/report flows, storage upload rules, test coverage and monitoring.
