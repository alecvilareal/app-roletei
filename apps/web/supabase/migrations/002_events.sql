-- 002_events.sql
-- Schema: events table + RLS policies + triggers/functions

-- 1) Criar tabela public.events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  description text,

  banner_url text,

  location_name text not null,
  location_address text not null,

  tickets_url text,

  -- Categoria "Entrada" (public.categories, group "Entrada")
  entry_category_id uuid references public.categories (id) on delete set null,

  starts_at timestamptz not null,
  ends_at timestamptz not null,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Habilitar RLS
alter table public.events enable row level security;

-- 3) Policy: qualquer usuário autenticado pode ler eventos ativos
drop policy if exists "events_read_active" on public.events;
create policy "events_read_active"
on public.events
for select
to authenticated
using (is_active = true);

-- 4) Policy admin: usuário com role 'cao_chupando_manga' pode fazer tudo
drop policy if exists "events_admin_all" on public.events;
create policy "events_admin_all"
on public.events
for all
to authenticated
using (public.is_cao_chupando_manga())
with check (public.is_cao_chupando_manga());

-- 5) Trigger updated_at (reusa public.set_updated_at() já criada em 001)
drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row
execute function public.set_updated_at();
