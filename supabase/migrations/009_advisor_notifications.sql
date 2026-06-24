-- Phase 6/7: advisor chat history + in-app notifications

create table if not exists public.advisor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists advisor_messages_user_idx
  on public.advisor_messages (user_id, created_at);

alter table public.advisor_messages enable row level security;

create policy "Users can view own advisor messages"
  on public.advisor_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own advisor messages"
  on public.advisor_messages for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own advisor messages"
  on public.advisor_messages for delete
  using (auth.uid() = user_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, read_at, created_at desc);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can insert own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);
