-- ScholarGenie Phase 3: professors

create table if not exists public.professors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  university_id uuid references public.universities (id) on delete set null,
  department text,
  email text,
  research_areas text[] not null default '{}',
  website text,
  accepts_msc boolean not null default true,
  accepts_phd boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists professors_university_id_idx on public.professors (university_id);

alter table public.professors enable row level security;

create policy "Anyone can view professors"
  on public.professors for select
  using (true);

create table if not exists public.saved_professors (
  user_id uuid not null references auth.users (id) on delete cascade,
  professor_id uuid not null references public.professors (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, professor_id)
);

alter table public.saved_professors enable row level security;

create policy "Users can view own saved professors"
  on public.saved_professors for select
  using (auth.uid() = user_id);

create policy "Users can save professors"
  on public.saved_professors for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave professors"
  on public.saved_professors for delete
  using (auth.uid() = user_id);
