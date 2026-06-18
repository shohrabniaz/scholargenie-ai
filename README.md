# ScholarGenie AI

**Your AI Study Abroad Copilot** — free for international students.

## Features

- Scholarship search with match scores and watchlist
- University matcher (safe / target / ambitious)
- Professor finder with outreach email drafts
- AI advisor (GPT when `OPENAI_API_KEY` is set, rules fallback otherwise)
- Deadline tracker with optional email reminders (Resend)
- Application tracker (scholarship, university, visa)
- SOP writer and CV analyzer

## Stack

- Next.js 16 · React 19 · Tailwind 4
- Supabase (Auth + PostgreSQL)
- OpenAI · Resend (optional)

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys + DB password
npm run db:migrate
npm run db:seed
npm run db:seed-more
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production deploy

```bash
npm run setup:production
```

1. **Vercel** — import [github.com/shohrabniaz/scholargenie-ai](https://github.com/shohrabniaz/scholargenie-ai), add env vars from `.env.example`
2. **Supabase** — set Site URL and redirect to `https://your-app.vercel.app/auth/callback`
3. **Optional** — `OPENAI_API_KEY`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` for full AI + email cron

CI runs on every push via GitHub Actions (lint + build).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run db:migrate` | Apply SQL migrations |
| `npm run db:seed` | Seed scholarships + universities + professors |
| `npm run db:seed-more` | Add extra dataset rows |
| `npm run setup:production` | CRON_SECRET + deploy checklist |

## License

Private — student project.
