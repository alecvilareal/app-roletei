-- 006_remove_events_description.sql
-- Remove coluna description da tabela public.events

alter table if exists public.events
drop column if exists description;
