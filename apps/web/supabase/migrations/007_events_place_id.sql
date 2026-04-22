-- 007_events_place_id.sql
-- Adiciona relacionamento de events -> places, para permitir selecionar local existente

alter table if exists public.events
add column if not exists place_id uuid references public.places (id) on delete set null;

create index if not exists events_place_id_idx on public.events (place_id);
