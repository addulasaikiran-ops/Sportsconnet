# SportsConnect interface code guide

Repository: https://github.com/addulasaikiran-ops/Sportsconnet

## Stack
Next.js App Router, React 19, TypeScript, Tailwind CSS v4, lucide-react, Supabase.

## Interface source of truth
- `components/sportsconnect-shell.tsx` — shared shell plus dashboard, discover, opportunities, messages, profile and generic views. This is the main interface implementation.
- `components/auth-form.tsx` — login and signup UI; posts to `/api/auth/login` and `/api/auth/signup`.
- `app/globals.css` — all application styles, responsive layouts, auth styles, mobile navigation.
- `app/layout.tsx` — global stylesheet and metadata.
- `app/page.tsx` — home route wrapper.
- `app/login/page.tsx`, `app/signup/page.tsx` — auth route wrappers.
- `app/discover/page.tsx` — Discover
- `app/opportunities/page.tsx` — Opportunities
- `app/messages/page.tsx` — Messages
- `app/profile/page.tsx` — My profile
- `app/notifications/page.tsx` — Notifications
- `app/saved/page.tsx` — Saved items
- `app/athletes/page.tsx`, `app/athletes/[username]/page.tsx` — athlete discovery/profile
- `app/coaches-clubs/page.tsx` — coaches and clubs
- `app/leaderboard/page.tsx` — leaderboard
- `app/help/page.tsx` — help centre
- `package.json` — commands and dependencies

## Get the exact source code
All of the current interface code is already in the repository; open the source links below:
- [Shared interface / all main screens](https://github.com/addulasaikiran-ops/Sportsconnet/blob/main/components/sportsconnect-shell.tsx)
- [Login & signup UI](https://github.com/addulasaikiran-ops/Sportsconnet/blob/main/components/auth-form.tsx)
- [CSS and responsive styling](https://github.com/addulasaikiran-ops/Sportsconnet/blob/main/app/globals.css)
- [Layout metadata](https://github.com/addulasaikiran-ops/Sportsconnet/blob/main/app/layout.tsx)
- [README & run instructions](https://github.com/addulasaikiran-ops/Sportsconnet/blob/main/README.md)

## Run locally
```bash
git clone https://github.com/addulasaikiran-ops/Sportsconnet.git
cd Sportsconnet
npm install
cp .env.example .env.local
npm run dev
```
Open http://localhost:3000. Configure the Supabase values in `.env.local` as described by README.

## Functionality notes
The main shell contains local mock state for feed content, following, saves, comments, opportunities, discover, messages and simple screens. Login/signup are wired to auth endpoints. The repository also contains APIs for profiles, posts/reactions/comments, users/follows, opportunities/applications, conversations/messages, notifications and media uploads. The UI has not yet been wired to every API; mock UI interactions should not be mistaken for database persistence.
