<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

ScholarGenie AI is a single Next.js 16 app (App Router) backed by Supabase (Postgres + Auth). For local dev the backend is the **Supabase CLI local stack** running in Docker. Standard commands live in `package.json` (`dev`, `build`, `lint`, `db:migrate`, `db:seed`, `db:seed-more`) and the README. Notes below are the non-obvious bits.

**Bring up services (not done by the update script):**
1. Docker Engine and the Supabase CLI are preinstalled in the VM snapshot, but the Docker daemon is not auto-started (no systemd). Start it once: `sudo dockerd > /tmp/dockerd.log 2>&1 &`. If you hit `permission denied ... /var/run/docker.sock`, run `sudo chmod 666 /var/run/docker.sock`.
2. From the repo root: `supabase start` (boots Postgres/Auth/REST/Studio and applies `supabase/migrations/*`). Use `supabase status` for URLs/keys; the local keys are deterministic defaults. Studio: http://127.0.0.1:54323, API: http://127.0.0.1:54321.
3. `npm run dev` serves the app at http://localhost:3000.

**`.env.local` (gitignored — recreate if missing) points at the local stack.** Read the current local keys with `supabase status -o env` (they are deterministic local defaults; `PUBLISHABLE_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SECRET_KEY` → `SUPABASE_SERVICE_ROLE_KEY`):
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<PUBLISHABLE_KEY from `supabase status`>
SUPABASE_SERVICE_ROLE_KEY=<SECRET_KEY from `supabase status`>
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=local-dev-cron-secret
```

**Gotchas:**
- **Grants:** The local stack's default privileges do NOT grant `select/insert/update/delete` on `public` tables to `anon`/`authenticated` (only `truncate/references/trigger`). Without the grants the app throws `permission denied for table profiles` and `Failed to load scholarships`. `supabase/seed.sql` re-grants them (RLS still enforces row access) and loads reference data; it runs automatically on `supabase start` (fresh) and on `supabase db reset`. Prefer `supabase db reset` to (re)seed locally.
- **Seed scripts force SSL:** `npm run db:seed` / `db:seed-more` / `db:migrate` hard-code `ssl` and the local Postgres has SSL off, so they fail with `server does not support SSL connections`. They are meant for a remote (SSL) Supabase pooler. Locally, use `supabase db reset` (runs `supabase/seed.sql`) instead.
- **Auth:** email confirmation is disabled in `supabase/config.toml`, so signup logs you in immediately.
- **Lint/build/test:** `npm run lint` works but reports 2 pre-existing errors unrelated to setup; `npm run build` succeeds. There is no automated test suite.
- OpenAI (advisor chat) and Resend (deadline emails) are optional; the app falls back to a rules engine / disables emails when their keys are absent.
