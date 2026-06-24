# ScholarGenie AI

**Your AI Study Abroad Copilot** — free for international students.

**Live:** [scholargenie-ai.vercel.app](https://scholargenie-ai.vercel.app)

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
- Hosted on Vercel

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

## Production

Supabase auth URLs (configured for production):

- **Site URL:** `https://scholargenie-ai.vercel.app`
- **Redirect:** `https://scholargenie-ai.vercel.app/auth/callback`

Sync env vars to Vercel:

```bash
npm run vercel:env https://scholargenie-ai.vercel.app
```

Optional Vercel env vars: `OPENAI_API_KEY`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run db:migrate` | Apply SQL migrations |
| `npm run db:seed` | Seed scholarships + universities + professors |
| `npm run db:seed-more` | Add extra dataset rows |
| `npm run vercel:env` | Push `.env.local` keys to Vercel |

## License

Private — student project.
