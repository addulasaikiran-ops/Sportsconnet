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

## Supabase project selection

SportsConnect is connected to the dedicated Supabase project named `Sportsconnet` (project ref `bzdtywxwehjpsheirfup`, region `ap-southeast-1`) at `https://bzdtywxwehjpsheirfup.supabase.co`. The separate `Moog-1.0` project belongs to another app and was left unchanged.

The sample env file is prefilled with the SportsConnect project's URL and its **publishable key**. Publishable keys are safe for browser use when Row Level Security policies are enabled; never use a service-role or secret key in `NEXT_PUBLIC_*` variables.

The database has been initialized with the initial SportsConnect schema and a follow-up hardening migration. The 12 application tables have RLS enabled. The conversation-creation RPC is intentionally callable by authenticated users and validates the caller and recipient.

## Configure the database

The schema is versioned in these migrations:

- `supabase/migrations/20261010030035_initial_sportsconnect_schema.sql`
- `supabase/migrations/20261010030207_harden_sportsconnect_schema.sql`
- `supabase/migrations/20261010030703_storage_buckets_and_policies.sql`
- `supabase/migrations/20261010030731_storage_post_media_read_access.sql`

All four migration versions are recorded on the dedicated remote SportsConnect project. To keep local schema changes in sync later, link the project and run:

```bash
npx supabase login
npx supabase link --project-ref bzdtywxwehjpsheirfup
npx supabase db pull
npx supabase migration list
```

The initial schema creates profiles, posts/media, follows, reactions, comments, opportunities/applications, conversations/members/messages and notifications, with indexes, profile creation/notification triggers and RLS policies. The hardening migration restricts helper/trigger function execution, moves the conversation membership helper to a non-exposed `private` schema, and adds supporting indexes. Storage migrations create a public `avatars` bucket and a private `post-media` bucket, enforce per-user upload paths, and limit private media access to users who can read the related post.

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
| POST | `/api/storage/upload` | Upload an avatar or attach image/video media to a post using multipart form data | Yes |

Pagination endpoints accept `limit` and `page` query parameters. The maximum page size is capped server-side. Search and mutation payloads are validated with Zod. The database uses RLS to limit updates to the current user and restrict messages to conversation members.

## Rate limiting

API rate limits use Upstash Redis so counters are shared across Vercel/serverless instances. Create an Upstash Redis database, then set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` as **server-only** environment variables in `.env.local` and later in the hosting environment. Never prefix these variables with `NEXT_PUBLIC_`. Local development skips the limiter if credentials are absent; production returns `503` when the limiter is not configured or its Redis service is unavailable, rather than silently disabling protection. Exceeded limits return `429` and `Retry-After`.

Initial limits:

- Login: 5 requests per 15 minutes per IP
- Signup: 5 requests per hour per IP
- Profile search and feed reads: 60 requests per minute per IP
- Post creation: 10 requests per 10 minutes per authenticated user
- Message sending: 30 requests per minute per authenticated user
- Media uploads: 10 requests per hour per authenticated user

IP identifiers are hashed before being used as Redis keys. Tune these limits after observing legitimate traffic and abuse patterns.

## Caching and CDN

The app is configured to use Next.js image optimization and the hosting platform's CDN defaults:

- Next.js fingerprinted assets under `/_next/static/` receive a one-year immutable cache lifetime.
- API responses default to `private, no-store` so authenticated or user-specific data is not accidentally shared by a CDN.
- The public profile lookup endpoint (`GET /api/users/:userId`) opts into a 60-second shared cache with stale-while-revalidate up to five minutes. Keep this endpoint limited to public profile fields.
- Next.js image optimization prefers AVIF and WebP where supported. The configured image cache TTL is a minimum; actual caching also depends on source headers and platform behavior.
- Feed responses contain short-lived signed URLs for private post media and are deliberately not shared-cacheable. Message, account, and personalized API responses should remain private.

When a profile is edited, a cached public profile may take up to about a minute to refresh under normal conditions. If immediate invalidation becomes necessary, add explicit tag/path revalidation or a purge strategy alongside the profile update endpoint. CDN behavior should be verified after the first deployment; no deployment is performed as part of this change.

## Error tracking and logs

SportsConnect includes optional Sentry instrumentation for browser, Node.js server, Edge runtime, unhandled request errors, and root-level application errors. To enable reporting:

1. Create a Sentry project using its Next.js platform setup at https://sentry.io/.
2. Copy the project DSN into `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`. Reporting stays disabled when no DSN is set.
3. Set `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` only in the build environment if you want source-map uploads. Keep the auth token server-side and never commit it.
4. Optionally set `APP_ENV` and `NEXT_PUBLIC_APP_ENV` to label staging/production events.

Sentry tracing is sampled at 10% by default to limit volume. The integration disables default PII collection and strips request query strings, cookies, request bodies, and sensitive request headers from error events. Review your Sentry project privacy and retention settings before collecting production events.

Use `lib/observability/logger.ts` for structured server logs. It writes JSON records with timestamp, severity, service and event fields; errors can also be sent to Sentry. Pass only safe diagnostic metadata (for example route, status code, and request ID)—never passwords, access tokens, cookies, private messages, or raw request bodies. Platform stdout/stderr logs remain available in the hosting provider's log viewer. Sentry does not automatically collect every informational log line.

No Sentry project or credentials have been created/configured, and no deployment has been performed. Error reporting remains disabled until a DSN is supplied; source-map upload needs the optional Sentry build credentials.

## Monitoring and email alerts

The GitHub Actions workflow at `.github/workflows/monitoring.yml` runs every five minutes (and can be run manually). It requests `/api/health`, alerts when the endpoint is unavailable, returns a non-200 response, or takes longer than two seconds. The health endpoint checks Supabase/PostgREST reachability and reports whether the Upstash rate-limit store is configured/reachable. In production, the endpoint is unhealthy when the rate-limit store is missing or unavailable because API rate limiting fails closed.

### Configure email delivery

In GitHub, open **Settings → Secrets and variables → Actions** for this repository and add these repository secrets:

- `MONITOR_BASE_URL`: the deployed application's origin, e.g. `https://your-domain.example` (no trailing path; monitoring will append `/api/health`).
- `ALERT_SMTP_SERVER`: SMTP server hostname from your email provider.
- `ALERT_SMTP_PORT`: SMTP port, usually `465` for implicit TLS or `587` for STARTTLS as supported by the provider.
- `ALERT_SMTP_USERNAME`: SMTP login.
- `ALERT_SMTP_PASSWORD`: SMTP password or provider-issued app password.
- `ALERT_EMAIL_FROM`: sender address permitted by the SMTP account.
- `ALERT_EMAIL_TO`: destination mailbox for alerts.

Use a dedicated mailbox or transactional email provider and an app password; never use your normal account password if the provider supports app passwords. Do not put credentials in `.env.example`, code, workflow files, or commit messages.

### What this checks and what still needs external setup

- **Application availability and latency:** scheduled health checks, 5-minute cadence, 2-second response threshold.
- **Database:** health endpoint probes Supabase PostgREST without returning table data.
- **Rate-limit store:** probes Upstash Redis when configured; in production, missing/unreachable Redis makes the health endpoint return 503.
- **Application exceptions:** Sentry is already integrated, but Sentry needs a project DSN and alert rules.
- **Security signals:** configure Sentry alerts for new/high-impact errors and Supabase Auth/database security alerts in their respective dashboards. The workflow does not yet calculate a rolling 5xx or 429 rate, and it does not replace database audit-log review.
- **Performance:** this is a basic uptime/latency probe, not full request-level p95 tracking. Use Sentry performance data and hosting analytics for deeper latency and resource signals.

### Important limitations

This workflow sends an email for every failed scheduled check, so a prolonged outage can generate repeated messages. Tune or add a cooldown/deduplication mechanism before relying on it for a high-traffic production service. GitHub-hosted scheduled workflows are best-effort and can be delayed; use a dedicated uptime monitor for stricter SLA needs. No external account, email credentials, GitHub secrets, or hosting URL are created by this PR. Monitoring cannot run against the real app until a reachable deployment URL exists. No deployment is performed.

## Environment variables

`.env.example` documents the supported values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (preferred)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy fallback)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (server-side rate limiting)
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` (optional error reporting)
- `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` (optional source-map upload)

Only use a publishable/anon key in Supabase `NEXT_PUBLIC_*` variables. Never expose the Supabase `service_role` or secret key in client code or any `NEXT_PUBLIC_*` variable.

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
│   ├── global-error.tsx
│   └── ...
├── lib/
│   ├── api/{error,http}.ts
│   ├── observability/logger.ts
│   └── supabase/server.ts
├── sentry.client.config.ts
├── sentry.server.config.ts
├── sentry.edge.config.ts
├── instrumentation.ts
├── instrumentation-client.ts
├── .env.example
├── .github/workflows/ci.yml
└── package.json
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
- Authenticated uploads are available at `POST /api/storage/upload`: send multipart form data with `kind=avatar` and `file`, or `kind=post-media`, `postId`, and `file`. Avatar images are limited to 5 MB; post images/videos are limited to 100 MB. Post-media URLs are signed for one hour by the feed API and should be refreshed when they expire.
- Before production, configure shared rate limiting, password recovery, moderation/report flows, storage upload rules, test coverage and monitoring.
