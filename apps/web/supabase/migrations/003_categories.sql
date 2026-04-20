-- 003_categories.sql
-- Schema: category_groups + categories + RLS policies + triggers/functions

-- 1) Grupo de categorias
create table if not exists public.category_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.category_groups enable row level security;

drop policy if exists "category_groups_read" on public.category_groups;
create policy "category_groups_read"
on public.category_groups
for select
to anon, authenticated
using (true);

drop policy if exists "category_groups_admin_all" on public.category_groups;
create policy "category_groups_admin_all"
on public.category_groups
for all
to authenticated
using (public.is_cao_chupando_manga())
with check (public.is_cao_chupando_manga());

drop trigger if exists set_category_groups_updated_at on public.category_groups;
create trigger set_category_groups_updated_at
before update on public.category_groups
for each row
execute function public.set_updated_at();

-- Grupos fixos (não devem ser excluídos/renomeados pela aplicação)
insert into public.category_groups (name)
values ('Tipo Evento'), ('Entrada')
on conflict (name) do nothing;

-- 2) Categorias
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.category_groups (id) on delete restrict,
  name text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (group_id, name)
);

alter table public.categories enable row level security;

drop policy if exists "categories_read" on public.categories;
create policy "categories_read"
on public.categories
for select
to anon, authenticated
using (true);

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all"
on public.categories
for all
to authenticated
using (public.is_cao_chupando_manga())
with check (public.is_cao_chupando_manga());

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();
