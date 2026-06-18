-- ScholarGenie: application tracker

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('scholarship', 'university', 'visa', 'other')),
  status text not null default 'researching' check (
    status in (
      'researching',
      'preparing',
      'submitted',
      'interview',
      'accepted',
      'rejected',
      'withdrawn'
    )
  ),
  notes text,
  scholarship_id uuid references public.scholarships (id) on delete set null,
  university_id uuid references public.universities (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_status_idx
  on public.applications (user_id, status);

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

alter table public.applications enable row level security;

create policy "Users can view own applications"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "Users can create applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on public.applications for update
  using (auth.uid() = user_id);

create policy "Users can delete own applications"
  on public.applications for delete
  using (auth.uid() = user_id);
