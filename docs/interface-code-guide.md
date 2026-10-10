# SportsConnect interface code guide

Repository: https://github.com/addulasaikiran-ops/Sportsconnet

## Stack
Next.js App Router, React 19, TypeScript, Tailwind CSS v4, lucide-react, Supabase.

## Main source files
- `components/sportsconnect-shell.tsx`: shared shell and main screens (home feed, Discover, Opportunities, Messages, Profile and reusable simple views).
- `components/auth-form.tsx`: login/signup forms and auth endpoint calls.
- `app/globals.css`: responsive styling for all screens.
- `app/layout.tsx`: root layout and metadata.
- Route wrappers: `app/page.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`, `app/discover/page.tsx`, `app/opportunities/page.tsx`, `app/messages/page.tsx`, `app/profile/page.tsx`, `app/notifications/page.tsx`, `app/saved/page.tsx`, `app/athletes/page.tsx`, `app/athletes/[username]/page.tsx`, `app/coaches-clubs/page.tsx`, `app/leaderboard/page.tsx`, `app/help/page.tsx`.
- `package.json`: dependencies and scripts.

## Exact file links
- [Shared interface / all main screens](https://github.com/addulasaikiran-ops/Sportsconnet/blob/main/components/sportsconnect-shell.tsx)
- [Login and signup UI](https://github.com/addulasaikiran-ops/Sportsconnet/blob/main/components/auth-form.tsx)
- [Responsive CSS](https://github.com/addulasaikiran-ops/Sportsconnet/blob/main/app/globals.css)
- [Root layout](https://github.com/addulasaikiran-ops/Sportsconnet/blob/main/app/layout.tsx)
- [Project README](https://github.com/addulasaikiran-ops/Sportsconnet/blob/main/README.md)

## Run locally
```bash
git clone https://github.com/addulasaikiran-ops/Sportsconnet.git
cd Sportsconnet
npm install
cp .env.example .env.local
npm run dev
```
Open http://localhost:3000 and configure the Supabase variables in `.env.local` according to README.

## Functionality notes
The shell contains local mock state for feed posts, reactions, following, saves, comments, opportunities, discovery and messages. Login and signup call auth APIs. The repo also includes API endpoints for profiles, posts/reactions/comments, user search/follows, opportunities/applications, conversations/messages, notifications and media uploads. The UI is not yet wired to every API, so mock interactions should not be mistaken for database persistence.
