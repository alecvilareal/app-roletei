-- 010_event_pricing.sql
-- Adiciona campos de precificação/valor do evento (gratis/pago/personalizado)

alter table if exists public.events
add column if not exists price_mode text not null default 'free';

-- modo "free"
alter table if exists public.events
add column if not exists free_access_type text,
add column if not exists free_access_link text;

-- modo "paid"
alter table if exists public.events
add column if not exists paid_type text,
add column if not exists is_couvert_optional boolean not null default false,
add column if not exists paid_by_gender boolean not null default false,
add column if not exists paid_value_cents integer,
add column if not exists paid_female_value_cents integer,
add column if not exists paid_male_value_cents integer,
add column if not exists paid_link text;

-- modo "custom"
alter table if exists public.events
add column if not exists custom_mode_type text,
add column if not exists custom_until_time time,
add column if not exists custom_until_kind text,
add column if not exists custom_until_by_gender boolean not null default false,
add column if not exists custom_until_value_cents integer,
add column if not exists custom_until_female_value_cents integer,
add column if not exists custom_until_male_value_cents integer,
add column if not exists custom_after_by_gender boolean not null default false,
add column if not exists custom_after_value_cents integer,
add column if not exists custom_after_female_value_cents integer,
add column if not exists custom_after_male_value_cents integer,
add column if not exists custom_link text;

-- checks básicos (evita valores inválidos)
alter table if exists public.events
drop constraint if exists events_price_mode_check;

alter table if exists public.events
add constraint events_price_mode_check
check (price_mode in ('free', 'paid', 'custom'));

alter table if exists public.events
drop constraint if exists events_paid_type_check;

alter table if exists public.events
add constraint events_paid_type_check
check (paid_type is null or paid_type in ('couvert', 'ticket', 'entry'));

alter table if exists public.events
drop constraint if exists events_free_access_type_check;

alter table if exists public.events
add constraint events_free_access_type_check
check (free_access_type is null or free_access_type in ('none', 'list', 'ticket'));

alter table if exists public.events
drop constraint if exists events_custom_mode_type_check;

alter table if exists public.events
add constraint events_custom_mode_type_check
check (custom_mode_type is null or custom_mode_type in ('entry', 'ticket'));

alter table if exists public.events
drop constraint if exists events_custom_until_kind_check;

alter table if exists public.events
add constraint events_custom_until_kind_check
check (custom_until_kind is null or custom_until_kind in ('free', 'value'));
