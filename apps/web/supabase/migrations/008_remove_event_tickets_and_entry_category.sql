-- 008_remove_event_tickets_and_entry_category.sql
-- Remove campos de "Ingressos e acesso" da tabela public.events

alter table if exists public.events
drop column if exists tickets_url;

alter table if exists public.events
drop column if exists entry_category_id;
