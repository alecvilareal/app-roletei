-- 009_event_music_styles.sql
-- Relaciona eventos a categorias do grupo "Estilo Musical" (N:N)

create table if not exists public.event_music_styles (
  event_id uuid not null references public.events (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,

  created_at timestamptz not null default now(),

  primary key (event_id, category_id)
);

alter table public.event_music_styles enable row level security;

-- leitura pública: permite ler estilos de eventos (para exibição no marketplace, etc)
drop policy if exists "event_music_styles_read" on public.event_music_styles;
create policy "event_music_styles_read"
on public.event_music_styles
for select
to anon, authenticated
using (true);

-- admin: pode inserir/remover/atualizar
drop policy if exists "event_music_styles_admin_all" on public.event_music_styles;
create policy "event_music_styles_admin_all"
on public.event_music_styles
for all
to authenticated
using (public.is_cao_chupando_manga())
with check (public.is_cao_chupando_manga());

-- índice auxiliar para consultas por categoria
create index if not exists event_music_styles_category_id_idx
on public.event_music_styles (category_id);

-- garante que category_id pertence ao grupo "Estilo Musical"
create or replace function public.ensure_music_style_category()
returns trigger
language plpgsql
as $$
declare
  group_name text;
begin
  select cg.name
  into group_name
  from public.categories c
  join public.category_groups cg on cg.id = c.group_id
  where c.id = new.category_id;

  if group_name is null then
    raise exception 'Categoria inválida (não encontrada): %', new.category_id;
  end if;

  if trim(group_name) <> 'Estilo Musical' then
    raise exception 'Categoria não pertence ao grupo Estilo Musical: %', group_name;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_event_music_styles_ensure_group on public.event_music_styles;
create trigger trg_event_music_styles_ensure_group
before insert or update on public.event_music_styles
for each row
execute function public.ensure_music_style_category();
