-- Places (Locais)
-- Stores venue/location data for admin cadastro de locais

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null,

  cep text not null,
  logradouro text not null,
  numero text not null,
  complemento text,
  bairro text not null,
  cidade text not null,
  uf text not null
);

create index if not exists places_created_at_idx on public.places (created_at desc);

alter table public.places enable row level security;

-- Admin policy: usuário com role 'cao_chupando_manga' pode fazer tudo
drop policy if exists "places_admin_all" on public.places;
create policy "places_admin_all"
on public.places
for all
to authenticated
using (public.is_cao_chupando_manga())
with check (public.is_cao_chupando_manga());
