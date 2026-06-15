-- Phase 2: saved scholarships (watchlist)

create table if not exists public.saved_scholarships (
  user_id uuid not null references auth.users (id) on delete cascade,
  scholarship_id uuid not null references public.scholarships (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, scholarship_id)
);

alter table public.saved_scholarships enable row level security;

create policy "Users can view own saved scholarships"
  on public.saved_scholarships for select
  using (auth.uid() = user_id);

create policy "Users can save scholarships"
  on public.saved_scholarships for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave scholarships"
  on public.saved_scholarships for delete
  using (auth.uid() = user_id);
