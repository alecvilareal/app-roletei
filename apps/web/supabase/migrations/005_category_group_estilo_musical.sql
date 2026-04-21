-- Cria o grupo fixo "Estilo Musical" (idempotente)
insert into public.category_groups (name)
select 'Estilo Musical'
where not exists (
  select 1
  from public.category_groups
  where trim(name) = 'Estilo Musical'
);
