-- =====================================================================
-- RepUp — food mode
--  - user_settings.mode may now be 'food'
--  - food_logs:   what each user ate (private, like workouts and runs)
--  - food_goals:  each user's daily calorie + macro target (private)
--  - water_days:  glasses of water per day (private)
--  - food_catalog: foods shared by everyone. Filled by the server from USDA
--    and Open Food Facts (barcodes), and by users adding a food from its label.
--    Every row must be believable: kcal has to match 4×protein + 4×carbs + 9×fat.
--  - food_queries: which searches the server already looked up at USDA
-- =====================================================================

alter table public.user_settings drop constraint if exists user_settings_mode_check;
alter table public.user_settings
  add constraint user_settings_mode_check check (mode in ('workout', 'running', 'food'));

-- ---------- food log (private) ----------
create table public.food_logs (
  user_id    uuid not null references auth.users (id) on delete cascade,
  id         text not null,
  date       date not null,
  meal       text not null check (meal in ('breakfast', 'lunch', 'dinner', 'snacks')),
  food_id    text not null,
  name       text not null check (char_length(name) between 1 and 160),
  amount     numeric(8, 2) not null check (amount > 0),
  unit       text not null check (char_length(unit) between 1 and 40),
  grams      numeric(8, 1) not null check (grams >= 0),
  kcal       integer not null check (kcal between 0 and 20000),
  protein    numeric(7, 1) not null check (protein >= 0),
  carbs      numeric(7, 1) not null check (carbs >= 0),
  fat        numeric(7, 1) not null check (fat >= 0),
  source     text not null check (source in ('local', 'usda', 'off', 'user', 'quick')),
  logged_at  timestamptz not null,
  deleted    boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index food_logs_user_date_idx on public.food_logs (user_id, date desc);

-- ---------- daily target (private) ----------
create table public.food_goals (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  plan       text not null default 'custom' check (plan in ('lose', 'maintain', 'gain', 'custom')),
  kcal       integer not null check (kcal between 500 and 10000),
  protein    integer not null check (protein between 0 and 1000),
  carbs      integer not null check (carbs between 0 and 2000),
  fat        integer not null check (fat between 0 and 1000),
  profile    jsonb,
  deleted    boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------- water (private) ----------
create table public.water_days (
  user_id    uuid not null references auth.users (id) on delete cascade,
  date       date not null,
  glasses    smallint not null check (glasses between 0 and 40),
  deleted    boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

do $$
declare t text;
begin
  foreach t in array array['food_logs', 'food_goals', 'water_days'] loop
    execute format('create trigger set_updated_at before insert or update on public.%I for each row execute function public.set_updated_at()', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "own rows" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- ---------- shared food list ----------
create extension if not exists pg_trgm with schema extensions;

create table public.food_catalog (
  id         text primary key,  -- 'usda:2706437' | 'off:8901262010016' | 'user:<uuid>'
  source     text not null check (source in ('usda', 'off', 'user')),
  name       text not null check (char_length(name) between 2 and 120),
  brand      text check (char_length(brand) <= 80),
  barcode    text unique check (barcode ~ '^[0-9]{6,14}$'),
  -- per 100 g (or 100 ml when liquid)
  kcal       numeric(6, 1) not null,
  protein    numeric(5, 1) not null,
  carbs      numeric(5, 1) not null,
  fat        numeric(5, 1) not null,
  servings   jsonb not null default '[]'::jsonb,  -- [{"label": "1 cup", "grams": 240}]
  liquid     boolean not null default false,
  search     text generated always as (lower(name || ' ' || coalesce(brand, ''))) stored,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Same rule as believable() in src/lib/food/core.ts: no impossible or mistyped numbers.
  constraint food_catalog_believable check (
    kcal >= 0 and protein >= 0 and carbs >= 0 and fat >= 0
    and kcal <= 902 and protein + carbs + fat <= 101
    and (
      (kcal < 20 and 4 * protein + 4 * carbs + 9 * fat < 30)
      or abs(4 * protein + 4 * carbs + 9 * fat - kcal) <= greatest(20, kcal * 0.2)
    )
  )
);
create index food_catalog_search_idx on public.food_catalog using gin (search extensions.gin_trgm_ops);
create index food_catalog_created_by_idx on public.food_catalog (created_by, created_at desc);

create trigger set_updated_at before insert or update on public.food_catalog
  for each row execute function public.set_updated_at();

alter table public.food_catalog enable row level security;
-- Everyone signed in can read the shared list. Nobody writes to it directly:
-- the server (secret key) adds USDA / Open Food Facts foods, users go through add_food().
create policy "read shared foods" on public.food_catalog for select to authenticated using (true);
revoke all on public.food_catalog from anon, authenticated;
grant select on public.food_catalog to authenticated;
grant all on public.food_catalog to service_role;

create table public.food_queries (
  q          text primary key check (char_length(q) between 1 and 80),
  ids        text[] not null default '{}',  -- food_catalog ids USDA returned for it
  fetched_at timestamptz not null default now()
);
alter table public.food_queries enable row level security;
revoke all on public.food_queries from anon, authenticated;
grant all on public.food_queries to service_role;

-- A user adds a food from its pack label (optionally with its barcode).
-- Shared with everyone, marked as added by a user. A barcode that's already
-- known keeps its first (checked) values. At most 30 new foods per user per day.
create function public.add_food(
  p_name text,
  p_brand text,
  p_barcode text,
  p_kcal numeric,
  p_protein numeric,
  p_carbs numeric,
  p_fat numeric,
  p_servings jsonb default '[]'::jsonb,
  p_liquid boolean default false
) returns public.food_catalog
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := (select auth.uid());
  found_row public.food_catalog;
begin
  if me is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  if nullif(trim(p_barcode), '') is not null then
    select * into found_row from public.food_catalog where barcode = trim(p_barcode);
    if found then
      return found_row;
    end if;
  end if;
  if (select count(*) from public.food_catalog where created_by = me and created_at > now() - interval '1 day') >= 30 then
    raise exception 'too many new foods today' using errcode = '54000';
  end if;
  if jsonb_typeof(coalesce(p_servings, '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_servings, '[]'::jsonb)) > 5 then
    raise exception 'bad servings' using errcode = '22023';
  end if;
  insert into public.food_catalog (id, source, name, brand, barcode, kcal, protein, carbs, fat, servings, liquid, created_by)
  values (
    'user:' || gen_random_uuid(),
    'user',
    trim(p_name),
    nullif(trim(p_brand), ''),
    nullif(trim(p_barcode), ''),
    round(p_kcal, 1),
    round(p_protein, 1),
    round(p_carbs, 1),
    round(p_fat, 1),
    coalesce(p_servings, '[]'::jsonb),
    coalesce(p_liquid, false),
    me
  )
  returning * into found_row;
  return found_row;
end $$;
revoke execute on function public.add_food(text, text, text, numeric, numeric, numeric, numeric, jsonb, boolean) from public, anon;
grant execute on function public.add_food(text, text, text, numeric, numeric, numeric, numeric, jsonb, boolean) to authenticated;

-- Admin: remove a wrong food from the shared list.
create function public.admin_delete_food(p_id text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public._admin_guard();
  delete from public.food_catalog where id = p_id;
  perform public._admin_log('delete_food', null, jsonb_build_object('food_id', p_id));
end $$;
revoke execute on function public.admin_delete_food(text) from public, anon;
grant execute on function public.admin_delete_food(text) to authenticated;

-- Admin: the shared food list, newest first, with who added it and how often it's been eaten.
create function public.admin_foods(p_search text default null, p_source text default null, p_limit integer default 100)
returns table (
  id text,
  source text,
  name text,
  brand text,
  barcode text,
  kcal numeric,
  protein numeric,
  carbs numeric,
  fat numeric,
  created_at timestamptz,
  added_by text,
  uses bigint
)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._admin_guard();
  return query
    select c.id, c.source, c.name, c.brand, c.barcode, c.kcal, c.protein, c.carbs, c.fat, c.created_at,
           u.email::text,
           (select count(*) from public.food_logs l where l.food_id = c.id and not l.deleted)
    from public.food_catalog c
    left join auth.users u on u.id = c.created_by
    where (nullif(trim(p_search), '') is null
           or c.search like '%' || lower(trim(p_search)) || '%'
           or c.barcode = trim(p_search))
      and (p_source is null or c.source = p_source)
    order by c.created_at desc
    limit least(greatest(coalesce(p_limit, 100), 1), 500);
end $$;
revoke execute on function public.admin_foods(text, text, integer) from public, anon;
grant execute on function public.admin_foods(text, text, integer) to authenticated;

-- Admin: food mode in numbers.
create function public.admin_food_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._admin_guard();
  return jsonb_build_object(
    'usda', (select count(*) from public.food_catalog where source = 'usda'),
    'off', (select count(*) from public.food_catalog where source = 'off'),
    'user', (select count(*) from public.food_catalog where source = 'user'),
    'logs', (select count(*) from public.food_logs where not deleted),
    'loggers_7d', (select count(distinct user_id) from public.food_logs where not deleted and date >= current_date - 6),
    'with_goal', (select count(*) from public.food_goals where not deleted)
  );
end $$;
revoke execute on function public.admin_food_stats() from public, anon;
grant execute on function public.admin_food_stats() to authenticated;

notify pgrst, 'reload schema';
