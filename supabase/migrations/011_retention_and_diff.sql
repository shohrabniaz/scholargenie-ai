-- Phase 13: match alert prefs + professor outreach tracker
-- Phase 14: SOP draft history

alter table public.profiles
  add column if not exists match_alerts_enabled boolean not null default true;

alter table public.saved_professors
  add column if not exists outreach_status text not null default 'not_sent'
    check (outreach_status in ('not_sent', 'sent', 'replied', 'interviewing'));

alter table public.saved_professors
  add column if not exists outreach_updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'saved_professors'
      and policyname = 'Users can update own saved professors'
  ) then
    create policy "Users can update own saved professors"
      on public.saved_professors for update
      using (auth.uid() = user_id);
  end if;
end $$;

create table if not exists public.sop_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid references public.applications (id) on delete set null,
  title text not null default 'SOP draft',
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists sop_drafts_user_idx
  on public.sop_drafts (user_id, created_at desc);

alter table public.sop_drafts enable row level security;

create policy "Users can view own sop drafts"
  on public.sop_drafts for select
  using (auth.uid() = user_id);

create policy "Users can insert own sop drafts"
  on public.sop_drafts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own sop drafts"
  on public.sop_drafts for delete
  using (auth.uid() = user_id);

create table if not exists public.university_compare_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  university_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.university_compare_sets enable row level security;

create policy "Users can manage own compare sets"
  on public.university_compare_sets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
