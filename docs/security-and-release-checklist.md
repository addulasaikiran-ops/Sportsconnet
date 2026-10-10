# Security and production-readiness verification

This checklist is for release validation. Passing lint, typecheck, and build does **not** prove database authorization, browser behavior, alert delivery, or backup recovery.

## Two-account authorization test

Use two disposable accounts (A and B) in a non-production environment. Keep credentials out of logs and screenshots. Run each case through the application/API using normal session cookies, not a service-role key.

| Area | Account A setup/action | Account B assertion |
|---|---|---|
| Profile | Create a profile and update its own fields | Cannot update A's profile by changing the user ID |
| Posts and media | Create a post and upload media | Cannot edit/delete A's post or read private media for a post B cannot read |
| Follows/reactions/comments | Follow or react to a post | Cannot impersonate A or mutate records as A |
| Opportunities | Create an opportunity and apply as B | B cannot edit/delete A's opportunity; application visibility follows intended owner/participant policy |
| Conversations | Start a direct conversation with B and send a message | A non-member account cannot list, read, or send messages to that conversation |
| Notifications | Generate a notification for B | A cannot read or mark B's notifications as read |

For every denied action, verify the HTTP response and then query with the relevant user's normal session to ensure no unauthorized row was changed or exposed. Test both API handlers and direct Supabase requests under the same user session, since RLS is the final access-control layer. Record the route, expected status, actual status, and result without recording tokens or personal data.

## Production readiness

- [ ] Confirm the deployment has the correct SportsConnect Supabase URL and publishable key.
- [ ] Configure server-only `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; never prefix these with `NEXT_PUBLIC_`.
- [ ] Request `/api/health` from the deployed environment and confirm HTTP 200 with `ok: true`. In production, missing/unreachable Redis should leave readiness failing (503).
- [ ] Run the monitoring workflow manually and confirm it can reach the app, Supabase REST API, and Redis.
- [ ] In a controlled test, cause and then resolve a monitored failure; confirm the configured alert and recovery notification arrive. Do not simulate an outage against production without approval.
- [ ] Verify the hosting provider's database backup schedule and perform a restore drill into a non-production project. A configured backup is not proven recoverable until restored.
- [ ] Confirm migrations are applied to the intended SportsConnect project and inspect the migration list before release.
- [ ] Run `npm run lint`, `npm run typecheck`, and `npm run build`.

## Status

This document is a repeatable test plan, not evidence that the checks have passed. Live two-account RLS tests, deployed monitoring/alert verification, and backup restoration require environment access and must be marked complete only after observing their results.