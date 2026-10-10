# SportsConnect frontend

Responsive Next.js + TypeScript UI prototype for a sports professional network connecting athletes, coaches, clubs and associations. The current build uses local mock data; Supabase is intentionally not connected yet.

## Requirements

- Node.js 20.9 or later
- npm
- Git

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Main screens in this prototype

- Home feed with local post composer, reactions, save and comment controls
- Discover athletes with sport filter and search
- Opportunities with type filter and mock application state
- Messages with local mock conversations
- Athlete profile with overview/highlights/achievements/about tabs
- Notifications, saved items, coaches & clubs, leaderboard and help centre placeholder views
- Responsive desktop sidebar and mobile bottom navigation

## Deploy on Railway

1. Push this repository to GitHub.
2. In Railway, create a project and deploy from this GitHub repository.
3. Railway should detect Next.js. Set the start command to `npm run start` if it is not detected automatically.
4. Deploy and open the generated domain.

## Next steps

1. Connect Supabase Auth and profile tables.
2. Replace mock data with database queries protected by Row Level Security.
3. Implement Storage uploads, real messages/realtime, notifications, and opportunity applications.
4. Add automated tests and production moderation/reporting flows.

All visible interactions in this stage are prototypes and do not persist after refresh.