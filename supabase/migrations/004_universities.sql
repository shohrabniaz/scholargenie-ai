-- ScholarGenie Phase 3: universities

create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  city text,
  website text,
  tuition_usd_min integer,
  tuition_usd_max integer,
  min_gpa numeric(3, 2),
  min_ielts numeric(2, 1),
  degree_levels text[] not null default '{}',
  fields text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists universities_country_idx on public.universities (country);

alter table public.universities enable row level security;

create policy "Anyone can view universities"
  on public.universities for select
  using (true);
