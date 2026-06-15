-- ScholarGenie: deadline email reminder preferences

alter table public.profiles
  add column if not exists deadline_reminders_enabled boolean not null default false;

alter table public.profiles
  add column if not exists reminder_lead_days integer not null default 7;
