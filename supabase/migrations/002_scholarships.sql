-- ScholarGenie Phase 1: scholarships

create table if not exists public.scholarships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  university text,
  degree_levels text[] not null default '{}',
  fields text[] not null default '{}',
  funding_type text not null check (funding_type in ('fully_funded', 'partial', 'merit', 'need_based')),
  amount_description text,
  deadline date,
  eligibility text,
  source_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists scholarships_country_idx on public.scholarships (country);
create index if not exists scholarships_funding_type_idx on public.scholarships (funding_type);
create index if not exists scholarships_deadline_idx on public.scholarships (deadline);

alter table public.scholarships enable row level security;

create policy "Anyone can view scholarships"
  on public.scholarships for select
  using (true);
