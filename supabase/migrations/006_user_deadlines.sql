-- ScholarGenie Phase 2+: deadline tracker

create table if not exists public.user_deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  due_date date not null,
  category text not null check (category in ('application', 'visa', 'test', 'other')),
  notes text,
  scholarship_id uuid references public.scholarships (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists user_deadlines_user_due_idx
  on public.user_deadlines (user_id, due_date);

alter table public.user_deadlines enable row level security;

create policy "Users can view own deadlines"
  on public.user_deadlines for select
  using (auth.uid() = user_id);

create policy "Users can create deadlines"
  on public.user_deadlines for insert
  with check (auth.uid() = user_id);

create policy "Users can update own deadlines"
  on public.user_deadlines for update
  using (auth.uid() = user_id);

create policy "Users can delete own deadlines"
  on public.user_deadlines for delete
  using (auth.uid() = user_id);
