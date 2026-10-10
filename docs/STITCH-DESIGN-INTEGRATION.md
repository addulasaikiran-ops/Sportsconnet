# Stitch design references — Sportsconnet

This integration follows the supplied Stitch exports and the Kinetic Stadium Precision design specification.

## Screens included in the supplied design packs
- Home feed and interactive motion
- Discover athletes
- Opportunities and scholarships, including mobile
- Sign in
- Recruiter messages inbox
- Athlete profile
- Opportunity details and application
- Notifications
- Coaches and clubs
- Saved items
- Leaderboard
- Help centre

## Application integration
- Shared shell and theme tokens are in `components/sportsconnect-shell.tsx` and `app/kinetic-stadium.css`.
- Feed reads and post creation use `GET/POST /api/posts`.
- Reactions and comments use the existing post subroutes.
- Discover uses `GET /api/users`.
- Opportunities uses `GET /api/opportunities`.
- Existing API routes remain responsible for authentication, validation, and database access.
- API failures are surfaced in the interface; example content remains as a graceful fallback if the endpoint returns no rows.

## Safety and validation
- No database migrations or live database writes were run as part of this UI integration.
- No production deployment was initiated.
- Run `npm run typecheck`, `npm run lint`, and `npm run build` before merging.
