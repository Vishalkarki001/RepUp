-- =====================================================================
-- RepUp — runs in the admin panel
--  - admin_runs(): every run / walk (no route: admins don't need where people live)
--  - admin_users(): + runs count and last run
--  - admin_stats(): + run totals and runs per day
--  - admin_activity(): + "logged a run"
-- All still check is_admin() inside the database.
-- =====================================================================

-- ---------- all runs (newest first) ----------
create function public.admin_runs(
  p_user uuid default null,
  p_search text default null,
  p_before timestamptz default null,
  p_limit int default 50
)
returns table (
  user_id uuid,
  user_email text,
  user_name text,
  id text,
  kind text,
  started_at timestamptz,
  finished_at timestamptz,
  duration_s integer,
  distance_m integer,
  steps integer,
  steps_source text,
  calories integer,
  temp_c numeric,
  weather_code smallint,
  splits jsonb,
  gap_s integer,
  source text,
  note text
)
language plpgsql stable security definer set search_path = '' as $$
declare
  q text := nullif(trim(coalesce(p_search, '')), '');
begin
  perform public._admin_guard();
  return query
    select
      r.user_id, u.email::text, p.full_name, r.id, r.kind, r.started_at, r.finished_at, r.duration_s, r.distance_m,
      r.steps, r.steps_source, r.calories, r.temp_c, r.weather_code, r.splits, r.gap_s, r.source, r.note
    from public.runs r
    join auth.users u on u.id = r.user_id
    left join public.profiles p on p.id = r.user_id
    where not r.deleted
      and (p_user is null or r.user_id = p_user)
      and (p_before is null or r.started_at < p_before)
      and (q is null or u.email ilike '%' || q || '%' or p.full_name ilike '%' || q || '%' or coalesce(r.note, '') ilike '%' || q || '%')
    order by r.started_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 200);
end $$;

-- ---------- users list: + runs (return type changes, so drop + recreate) ----------
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
  last_run_at timestamptz
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
      (select max(r.started_at) from public.runs r where r.user_id = u.id and not r.deleted)
    from auth.users u
    left join public.profiles p on p.id = u.id
    order by u.created_at desc;
end $$;

-- ---------- dashboard numbers: + runs ----------
create or replace function public.admin_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  result jsonb;
begin
  perform public._admin_guard();
  with days as (
    select generate_series(
      ((now() at time zone 'Asia/Kolkata')::date - 29),
      (now() at time zone 'Asia/Kolkata')::date,
      interval '1 day'
    )::date as day
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
  )
  select jsonb_build_object(
    'users',        (select count(*) from auth.users),
    'new_7d',       (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'active_7d',    (select count(*) from public.profiles where last_seen_at > now() - interval '7 days'),
    'admins',       (select count(*) from public.profiles where role = 'admin'),
    'blocked',      (select count(*) from auth.users where banned_until > now()),
    'workouts',     (select count(*) from public.workouts where not deleted),
    'workouts_7d',  (select count(*) from public.workouts where not deleted and started_at > now() - interval '7 days'),
    'runs',         (select count(*) from public.runs where not deleted),
    'runs_7d',      (select count(*) from public.runs where not deleted and started_at > now() - interval '7 days'),
    'run_km_7d',    (select coalesce(round(sum(distance_m) / 1000.0, 1), 0) from public.runs where not deleted and started_at > now() - interval '7 days'),
    'run_km',       (select coalesce(round(sum(distance_m) / 1000.0, 1), 0) from public.runs where not deleted),
    'daily', (
      select jsonb_agg(jsonb_build_object(
        'day', d.day,
        'signups', coalesce(s.n, 0),
        'workouts', coalesce(l.n, 0),
        'runs', coalesce(r.n, 0)
      ) order by d.day)
      from days d
      left join signups s on s.day = d.day
      left join logged l on l.day = d.day
      left join ran r on r.day = d.day
    )
  ) into result;
  return result;
end $$;

-- ---------- recent activity: + runs ----------
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
      select a.at, 'admin'::text, a.admin_id, a.admin_email, null::text,
             a.action || coalesce(' · ' || a.target_email, '')
      from public.admin_audit a
    ) x (at, kind, user_id, user_email, user_name, detail)
    order by x.at desc
    limit least(greatest(coalesce(p_limit, 30), 1), 200);
end $$;

-- ---------- who may call what ----------
revoke execute on function public.admin_runs(uuid, text, timestamptz, int), public.admin_users() from public, anon;
grant execute on function public.admin_runs(uuid, text, timestamptz, int), public.admin_users() to authenticated;

notify pgrst, 'reload schema';
