-- =====================================================================
-- RepUp — food in the admin panel (like workouts and runs)
--  - admin_food_days(): each person's food diary, one row per person per day
--  - admin_users():     + days with food logged, last food day
--  - admin_stats():     + food numbers, people logging food per day
--  - admin_activity():  + "logged 5 foods · 1,540 kcal"
-- All still check is_admin() inside the database.
-- =====================================================================

-- ---------- food diaries: one row per person per day (newest days first) ----------
-- Pages by day: up to p_days dates before p_before, every person on those dates.
-- A search on a food name shows that whole day, not just the matching food.
create function public.admin_food_days(
  p_user uuid default null,
  p_search text default null,
  p_before date default null,
  p_days int default 14
)
returns table (
  user_id uuid,
  user_email text,
  user_name text,
  date date,
  items bigint,
  kcal bigint,
  protein numeric,
  carbs numeric,
  fat numeric,
  water smallint,
  goal_kcal integer,
  foods jsonb
)
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
declare
  q text := nullif(trim(coalesce(p_search, '')), '');
begin
  perform public._admin_guard();
  return query
    with matched as (
      select distinct l.user_id, l.date
      from public.food_logs l
      join auth.users u on u.id = l.user_id
      left join public.profiles p on p.id = l.user_id
      where not l.deleted
        and (p_user is null or l.user_id = p_user)
        and (p_before is null or l.date < p_before)
        and (q is null or u.email ilike '%' || q || '%' or p.full_name ilike '%' || q || '%' or l.name ilike '%' || q || '%')
    ),
    days as (
      select distinct m.date from matched m order by m.date desc
      limit least(greatest(coalesce(p_days, 14), 1), 60)
    )
    select
      l.user_id,
      u.email::text,
      p.full_name,
      l.date,
      count(*),
      sum(l.kcal)::bigint,
      round(sum(l.protein), 1),
      round(sum(l.carbs), 1),
      round(sum(l.fat), 1),
      (select w.glasses from public.water_days w where w.user_id = l.user_id and w.date = l.date and not w.deleted),
      (select g.kcal from public.food_goals g where g.user_id = l.user_id and not g.deleted),
      jsonb_agg(
        jsonb_build_object(
          'meal', l.meal, 'name', l.name, 'amount', l.amount, 'unit', l.unit, 'grams', l.grams,
          'kcal', l.kcal, 'protein', l.protein, 'carbs', l.carbs, 'fat', l.fat, 'source', l.source
        )
        order by l.logged_at
      )
    from public.food_logs l
    join matched m on m.user_id = l.user_id and m.date = l.date
    join days d on d.date = l.date
    join auth.users u on u.id = l.user_id
    left join public.profiles p on p.id = l.user_id
    where not l.deleted
    group by l.user_id, u.email, p.full_name, l.date
    order by l.date desc, u.email
    limit 1000;
end $$;

-- ---------- users list: + food (return type changes, so drop + recreate) ----------
drop function if exists public.admin_users();
create function public.admin_users()
returns table (
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  provider text,
  role text,
  blocked boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  last_seen_at timestamptz,
  email_confirmed boolean,
  workouts bigint,
  last_workout_at timestamptz,
  runs bigint,
  last_run_at timestamptz,
  food_days bigint,
  last_food_date date
)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._admin_guard();
  return query
    select
      u.id,
      u.email::text,
      p.full_name,
      p.avatar_url,
      coalesce(u.raw_app_meta_data ->> 'provider', 'email'),
      coalesce(p.role, 'user'),
      coalesce(u.banned_until > now(), false),
      u.created_at,
      u.last_sign_in_at,
      p.last_seen_at,
      u.email_confirmed_at is not null,
      (select count(*) from public.workouts w where w.user_id = u.id and not w.deleted),
      (select max(w.started_at) from public.workouts w where w.user_id = u.id and not w.deleted),
      (select count(*) from public.runs r where r.user_id = u.id and not r.deleted),
      (select max(r.started_at) from public.runs r where r.user_id = u.id and not r.deleted),
      (select count(distinct f.date) from public.food_logs f where f.user_id = u.id and not f.deleted),
      (select max(f.date) from public.food_logs f where f.user_id = u.id and not f.deleted)
    from auth.users u
    left join public.profiles p on p.id = u.id
    order by u.created_at desc;
end $$;

-- ---------- dashboard numbers: + food ----------
create or replace function public.admin_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  result jsonb;
  today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  perform public._admin_guard();
  with days as (
    select generate_series(today - 29, today, interval '1 day')::date as day
  ),
  signups as (
    select (created_at at time zone 'Asia/Kolkata')::date as day, count(*) as n
    from auth.users group by 1
  ),
  logged as (
    select (started_at at time zone 'Asia/Kolkata')::date as day, count(*) as n
    from public.workouts where not deleted group by 1
  ),
  ran as (
    select (started_at at time zone 'Asia/Kolkata')::date as day, count(*) as n
    from public.runs where not deleted group by 1
  ),
  ate as (
    -- people who logged food that day (a diary's date is the person's own calendar day)
    select date as day, count(distinct user_id) as n
    from public.food_logs where not deleted group by 1
  )
  select jsonb_build_object(
    'users',          (select count(*) from auth.users),
    'new_7d',         (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'active_7d',      (select count(*) from public.profiles where last_seen_at > now() - interval '7 days'),
    'admins',         (select count(*) from public.profiles where role = 'admin'),
    'blocked',        (select count(*) from auth.users where banned_until > now()),
    'workouts',       (select count(*) from public.workouts where not deleted),
    'workouts_7d',    (select count(*) from public.workouts where not deleted and started_at > now() - interval '7 days'),
    'runs',           (select count(*) from public.runs where not deleted),
    'runs_7d',        (select count(*) from public.runs where not deleted and started_at > now() - interval '7 days'),
    'run_km_7d',      (select coalesce(round(sum(distance_m) / 1000.0, 1), 0) from public.runs where not deleted and started_at > now() - interval '7 days'),
    'run_km',         (select coalesce(round(sum(distance_m) / 1000.0, 1), 0) from public.runs where not deleted),
    'food_logs',      (select count(*) from public.food_logs where not deleted),
    'food_7d',        (select count(*) from public.food_logs where not deleted and date > today - 7),
    'food_users_7d',  (select count(distinct user_id) from public.food_logs where not deleted and date > today - 7),
    'daily', (
      select jsonb_agg(jsonb_build_object(
        'day', d.day,
        'signups', coalesce(s.n, 0),
        'workouts', coalesce(l.n, 0),
        'runs', coalesce(r.n, 0),
        'food', coalesce(a.n, 0)
      ) order by d.day)
      from days d
      left join signups s on s.day = d.day
      left join logged l on l.day = d.day
      left join ran r on r.day = d.day
      left join ate a on a.day = d.day
    )
  ) into result;
  return result;
end $$;

-- ---------- recent activity: + food (one line per person per day) ----------
create or replace function public.admin_activity(p_limit int default 30)
returns table (at timestamptz, kind text, user_id uuid, user_email text, user_name text, detail text)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._admin_guard();
  return query
    select * from (
      select u.created_at, 'signup'::text, u.id, u.email::text, p.full_name,
             coalesce(u.raw_app_meta_data ->> 'provider', 'email')
      from auth.users u left join public.profiles p on p.id = u.id
      union all
      select coalesce(w.finished_at, w.started_at), 'workout'::text, w.user_id, u.email::text, p.full_name, w.name
      from public.workouts w
      join auth.users u on u.id = w.user_id
      left join public.profiles p on p.id = w.user_id
      where not w.deleted
      union all
      select r.finished_at, 'run'::text, r.user_id, u.email::text, p.full_name,
             to_char(r.distance_m / 1000.0, 'FM9990.00') || ' km ' || r.kind
      from public.runs r
      join auth.users u on u.id = r.user_id
      left join public.profiles p on p.id = r.user_id
      where not r.deleted
      union all
      select max(f.logged_at), 'food'::text, f.user_id, u.email::text, p.full_name,
             count(*) || case when count(*) = 1 then ' food · ' else ' foods · ' end || sum(f.kcal) || ' kcal'
      from public.food_logs f
      join auth.users u on u.id = f.user_id
      left join public.profiles p on p.id = f.user_id
      where not f.deleted
      group by f.user_id, f.date, u.email, p.full_name
      union all
      select a.at, 'admin'::text, a.admin_id, a.admin_email, null::text,
             a.action || coalesce(' · ' || a.target_email, '')
      from public.admin_audit a
    ) x (at, kind, user_id, user_email, user_name, detail)
    order by x.at desc
    limit least(greatest(coalesce(p_limit, 30), 1), 200);
end $$;

-- ---------- who may call what ----------
revoke execute on function public.admin_food_days(uuid, text, date, int), public.admin_users() from public, anon;
grant execute on function public.admin_food_days(uuid, text, date, int), public.admin_users() to authenticated;

notify pgrst, 'reload schema';
