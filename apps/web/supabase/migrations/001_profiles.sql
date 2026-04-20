-- 001_profiles.sql
-- Schema: enum user_role + profiles table + RLS policies + triggers/functions

-- 1) Criar type enum user_role
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('cao_chupando_manga');
  end if;
end $$;

-- 2) Criar tabela public.profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.user_role not null default 'cao_chupando_manga',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Habilitar RLS
alter table public.profiles enable row level security;

-- 4) Policy: usuário autenticado pode ler apenas o próprio perfil
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- 5) Policy: usuário com role 'cao_chupando_manga' pode fazer tudo em qualquer perfil
-- Observação: a policy precisa consultar a própria tabela; para isso usamos uma
-- função SECURITY DEFINER que checa o role do usuário atual.
create or replace function public.is_cao_chupando_manga()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'cao_chupando_manga'::public.user_role
  );
$$;

revoke all on function public.is_cao_chupando_manga() from public;
grant execute on function public.is_cao_chupando_manga() to authenticated;

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
on public.profiles
for all
to authenticated
using (public.is_cao_chupando_manga())
with check (public.is_cao_chupando_manga());

-- 6) Function + trigger para atualizar updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- 7) Function + trigger para inserir profile automaticamente quando um novo user é criado
create or replace function public.handle_new_user_create_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user_create_profile() from public;
grant execute on function public.handle_new_user_create_profile() to postgres, supabase_admin;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row
execute function public.handle_new_user_create_profile();
