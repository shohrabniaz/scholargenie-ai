-- ScholarGenie Phase 0: user profiles + waitlist
-- Run in Supabase SQL Editor or via Supabase CLI

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  home_country text not null default '',
  degree_level text not null default '',
  field_of_study text not null default '',
  cgpa numeric(4, 2),
  ielts_score numeric(3, 1),
  pte_score integer,
  budget_usd integer,
  preferred_countries text[] not null default '{}',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  home_country text,
  degree_level text,
  field_of_study text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.waitlist enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);

create policy "Waitlist emails are not publicly readable"
  on public.waitlist for select
  using (false);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
