-- Phase 8: per-application document checklist

alter table public.applications
  add column if not exists checklist jsonb not null default '[]'::jsonb;
