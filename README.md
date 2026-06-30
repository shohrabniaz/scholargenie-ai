# ScholarGenie AI

**Your AI Study Abroad Copilot** — free for international students.

**Live:** [scholargenie-ai.vercel.app](https://scholargenie-ai.vercel.app)

## Features

- Scholarship search with match scores, watchlist, and **track application**
- University matcher (safe / target / ambitious) with **track application**
- Professor finder with smarter outreach email drafts
- AI advisor with **chat memory** (GPT when `OPENAI_API_KEY` is set)
- In-app **notifications** for matches and deadlines
- Deadline tracker with optional email reminders (Resend)
- Application tracker with **document checklists** and **visa templates**
- SOP writer with **AI refine** and CV analyzer
- SEO **country guides** at `/countries`

## Stack

- Next.js 16 · React 19 · Tailwind 4
- Supabase (Auth + PostgreSQL)
- OpenAI · Resend (optional)
- Hosted on Vercel · CI/CD via GitHub Actions

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys + DB password
npm run db:migrate
npm run db:seed
npm run db:seed-more
npm run db:seed-phase5
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

### CI/CD

On every push/PR to `master`, GitHub Actions runs **lint + build**.

To enable **deploy from GitHub Actions** (in addition to Vercel Git deploys):

1. Create a **classic** token at [vercel.com/account/tokens](https://vercel.com/account/tokens) (OAuth CLI login cannot create tokens).
2. Add `VERCEL_TOKEN=...` to `.env.local` (do not commit).
3. Run:

```bash
npm run setup:github-deploy
```

This sets `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`, and enables `VERCEL_DEPLOY_ENABLED`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run db:migrate` | Apply SQL migrations |
| `npm run db:seed` | Seed scholarships + universities + professors |
| `npm run db:seed-more` | Add extra dataset rows |
| `npm run db:seed-phase5` | Add phase-5 expansion rows |
| `npm run vercel:env` | Push `.env.local` keys to Vercel |
| `node scripts/setup-github-deploy.mjs` | Configure GitHub Actions Vercel deploy |

## License

Private — student project.
