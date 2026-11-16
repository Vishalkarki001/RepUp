-- =====================================================================
-- RepUp — exercises shared by everyone, and typo-tolerant search
--  - exercise_catalog: exercises people created (name, muscle, equipment
--    only: personal notes stay private). Anyone signed in can find and add
--    them; nobody writes to it directly (share_exercise() does, with checks).
--  - search_shared_exercises(), search_food_catalog(): find by part of a word
--    or with a typo (pg_trgm), for the shared lists.
--  - admin: list / remove shared exercises.
-- =====================================================================

create table public.exercise_catalog (
  id         text primary key default ('shared-' || gen_random_uuid()),
  name       text not null check (char_length(name) between 2 and 60),
  -- lower case, single spaces: one shared entry per name
  name_key   text not null unique check (char_length(name_key) between 2 and 60),
  muscle     text not null check (muscle in ('Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Core', 'Full Body')),
  equipment  text not null check (equipment in ('Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Other')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index exercise_catalog_name_trgm_idx on public.exercise_catalog using gin (name_key extensions.gin_trgm_ops);
create index exercise_catalog_created_by_idx on public.exercise_catalog (created_by, created_at desc);

alter table public.exercise_catalog enable row level security;
create policy "read shared exercises" on public.exercise_catalog for select to authenticated using (true);
revoke all on public.exercise_catalog from anon, authenticated;
grant select on public.exercise_catalog to authenticated;
grant all on public.exercise_catalog to service_role;

-- Someone created an exercise: share it (or return the one already shared with that name).
-- At most 30 new shared exercises per person per day.
create function public.share_exercise(p_name text, p_muscle text, p_equipment text)
returns public.exercise_catalog
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := (select auth.uid());
  clean text := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');
  key text := lower(clean);
  found_row public.exercise_catalog;
begin
  if me is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  select * into found_row from public.exercise_catalog where name_key = key;
  if found then
    return found_row;
  end if;
  if (select count(*) from public.exercise_catalog where created_by = me and created_at > now() - interval '1 day') >= 30 then
    raise exception 'too many new exercises today' using errcode = '54000';
  end if;
  insert into public.exercise_catalog (name, name_key, muscle, equipment, created_by)
  values (clean, key, p_muscle, p_equipment, me)
  returning * into found_row;
  return found_row;
end $$;
revoke execute on function public.share_exercise(text, text, text) from public, anon;
grant execute on function public.share_exercise(text, text, text) to authenticated;

-- Shared exercises matching a search: part of the name, or close to it (a typo).
create function public.search_shared_exercises(p_q text, p_limit int default 20)
returns setof public.exercise_catalog
language sql stable security invoker set search_path = public, extensions as $$
  with q as (select lower(regexp_replace(trim(coalesce(p_q, '')), '\s+', ' ', 'g')) as v)
  select c.*
  from public.exercise_catalog c, q
  where char_length(q.v) >= 2
    and (
      c.name_key like '%' || replace(replace(q.v, '%', ''), '_', '') || '%'
      or replace(c.name_key, ' ', '') like '%' || replace(q.v, ' ', '') || '%'
      or word_similarity(q.v, c.name_key) >= 0.45
    )
  order by (c.name_key like q.v || '%') desc, word_similarity(q.v, c.name_key) desc, c.name_key
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;
grant execute on function public.search_shared_exercises(text, int) to authenticated;

-- Shared foods matching a search, typos included (the app's server adds these to plain word matches).
create function public.search_food_catalog(p_q text, p_limit int default 25)
returns setof public.food_catalog
language sql stable security invoker set search_path = public, extensions as $$
  with q as (select lower(regexp_replace(trim(coalesce(p_q, '')), '\s+', ' ', 'g')) as v)
  select f.*
  from public.food_catalog f, q
  where char_length(q.v) >= 3
    and (
      replace(f.search, ' ', '') like '%' || replace(replace(replace(q.v, '%', ''), '_', ''), ' ', '') || '%'
      or word_similarity(q.v, f.search) >= 0.45
    )
  order by word_similarity(q.v, f.search) desc, f.name
  limit least(greatest(coalesce(p_limit, 25), 1), 50);
$$;
grant execute on function public.search_food_catalog(text, int) to authenticated, service_role;

-- ---------- admin ----------
create function public.admin_exercises(p_search text default null, p_limit integer default 200)
returns table (id text, name text, muscle text, equipment text, created_at timestamptz, added_by text, users bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._admin_guard();
  return query
    select c.id, c.name, c.muscle, c.equipment, c.created_at, u.email::text,
           (select count(distinct e.user_id) from public.exercises e where e.id = c.id and not e.deleted)
    from public.exercise_catalog c
    left join auth.users u on u.id = c.created_by
    where nullif(trim(p_search), '') is null or c.name_key like '%' || lower(trim(p_search)) || '%'
    order by c.created_at desc
    limit least(greatest(coalesce(p_limit, 200), 1), 500);
end $$;
revoke execute on function public.admin_exercises(text, integer) from public, anon;
grant execute on function public.admin_exercises(text, integer) to authenticated;

-- Removes it from the shared list only: people who already added it keep their copy.
create function public.admin_delete_exercise(p_id text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public._admin_guard();
  delete from public.exercise_catalog where id = p_id;
  perform public._admin_log('delete_shared_exercise', null, jsonb_build_object('exercise_id', p_id));
end $$;
revoke execute on function public.admin_delete_exercise(text) from public, anon;
grant execute on function public.admin_delete_exercise(text) to authenticated;

notify pgrst, 'reload schema';
