# ScholarGenie AI

**Your AI Study Abroad Copilot** — free for international students.

Phase 0 includes: marketing landing page, waitlist, auth, profile onboarding, and dashboard shell.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4**
- **Supabase** (PostgreSQL, Auth)
- **React Hook Form + Zod**

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In **Project Settings → API**, copy the project URL and **publishable** key.
3. Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

### 3. Run the database migration

In Supabase **SQL Editor**, paste and run:

```
supabase/migrations/001_profiles.sql
```

### 4. Configure auth redirects

In Supabase **Authentication → URL Configuration**, set:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** `http://localhost:3000/auth/callback`

For email confirmation, you can disable **Confirm email** under Auth providers during local dev.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## User flow (Phase 0)

1. **Landing** (`/`) — features + waitlist signup
2. **Sign up** (`/signup`) — create account
3. **Onboarding** (`/onboarding`) — 3-step profile wizard
4. **Dashboard** (`/dashboard`) — profile summary + upcoming features

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Landing
│   ├── login/ signup/
│   ├── onboarding/
│   ├── dashboard/
│   └── auth/callback/
├── components/
│   ├── auth/
│   ├── layout/
│   ├── marketing/
│   ├── onboarding/
│   └── ui/
├── lib/
│   ├── supabase/
│   └── validations/
└── types/
supabase/migrations/
```

## Deploy (free)

- **Frontend:** [Vercel](https://vercel.com) — connect repo, add env vars
- **Database + Auth:** Supabase free tier

## Roadmap

| Phase | Features |
|-------|----------|
| **0** (now) | Landing, auth, onboarding, dashboard |
| **1** | Scholarship + university search, AI advisor |
| **2** | Watchlist, match scores, deadline emails |
| **3** | Professor finder |
| **4** | SOP writer, CV analyzer |

## License

Private — student project.
