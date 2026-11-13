-- =====================================================================
-- RepUp — admin panel
-- Everything an admin can do goes through the functions below. Each one
-- checks is_admin() inside the database, so the app's buttons are only a
-- convenience: a normal user calling them directly gets "not allowed".
-- Every admin action is written to admin_audit (who, what, when).
-- =====================================================================

-- ---------- audit log ----------
create table public.admin_audit (
  id           bigint generated always as identity primary key,
  at           timestamptz not null default now(),
  admin_id     uuid references auth.users (id) on delete set null,
  admin_email  text,
  action       text not null,
  target_id    uuid,
  target_email text,
  details      jsonb not null default '{}'::jsonb
);
create index admin_audit_at_idx on public.admin_audit (at desc);
alter table public.admin_audit enable row level security;
-- No direct access at all: read through admin_activity(), written by the functions below.
revoke all on public.admin_audit from anon, authenticated;

-- ---------- internal helpers (not callable from the app) ----------
create function public._admin_guard() returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
end $$;

create function public._admin_log(p_action text, p_target uuid, p_details jsonb default '{}'::jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.admin_audit (admin_id, admin_email, action, target_id, target_email, details)
  values (
    (select auth.uid()),
    (select email from auth.users where id = (select auth.uid())),
    p_action,
    p_target,
    (select email from auth.users where id = p_target),
    coalesce(p_details, '{}'::jsonb)
  );
end $$;

revoke execute on function public._admin_guard(), public._admin_log(text, uuid, jsonb) from public, anon, authenticated;

-- ---------- users list (adds "blocked") ----------
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
  last_workout_at timestamptz
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
      count(w.id) filter (where not w.deleted),
      max(w.started_at) filter (where not w.deleted)
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.workouts w on w.user_id = u.id
    group by u.id, p.full_name, p.avatar_url, p.role, p.last_seen_at
    order by u.created_at desc;
end $$;

-- ---------- dashboard numbers + last 30 days (days in India time) ----------
create function public.admin_stats() returns jsonb
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
  )
  select jsonb_build_object(
    'users',        (select count(*) from auth.users),
    'new_7d',       (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'active_7d',    (select count(*) from public.profiles where last_seen_at > now() - interval '7 days'),
    'admins',       (select count(*) from public.profiles where role = 'admin'),
    'blocked',      (select count(*) from auth.users where banned_until > now()),
    'workouts',     (select count(*) from public.workouts where not deleted),
    'workouts_7d',  (select count(*) from public.workouts where not deleted and started_at > now() - interval '7 days'),
    'daily', (
      select jsonb_agg(jsonb_build_object(
        'day', d.day,
        'signups', coalesce(s.n, 0),
        'workouts', coalesce(l.n, 0)
      ) order by d.day)
      from days d
      left join signups s on s.day = d.day
      left join logged l on l.day = d.day
    )
  ) into result;
  return result;
end $$;

-- ---------- recent activity: sign-ups, workouts, admin actions ----------
create function public.admin_activity(p_limit int default 30)
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
      select a.at, 'admin'::text, a.admin_id, a.admin_email, null::text,
             a.action || coalesce(' · ' || a.target_email, '')
      from public.admin_audit a
    ) x (at, kind, user_id, user_email, user_name, detail)
    order by x.at desc
    limit least(greatest(coalesce(p_limit, 30), 1), 200);
end $$;

-- ---------- all workouts (newest first, with each user's own exercise names) ----------
create function public.admin_workouts(
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
  name text,
  started_at timestamptz,
  finished_at timestamptz,
  exercises jsonb,
  note text,
  exercise_names jsonb,
  unit text
)
language plpgsql stable security definer set search_path = '' as $$
declare
  q text := nullif(trim(coalesce(p_search, '')), '');
begin
  perform public._admin_guard();
  return query
    select
      w.user_id, u.email::text, p.full_name, w.id, w.name, w.started_at, w.finished_at, w.exercises, w.note,
      coalesce((select jsonb_object_agg(e.id, e.name) from public.exercises e where e.user_id = w.user_id), '{}'::jsonb),
      coalesce(st.unit, 'kg')
    from public.workouts w
    join auth.users u on u.id = w.user_id
    left join public.profiles p on p.id = w.user_id
    left join public.user_settings st on st.user_id = w.user_id
    where not w.deleted
      and (p_user is null or w.user_id = p_user)
      and (p_before is null or w.started_at < p_before)
      and (q is null or w.name ilike '%' || q || '%' or u.email ilike '%' || q || '%' or p.full_name ilike '%' || q || '%')
    order by w.started_at desc
    limit least(greatest(coalesce(p_limit, 50), 1), 200);
end $$;

-- ---------- actions ----------

-- Make admin / remove admin. The last admin can't be removed.
create function public.admin_set_role(p_user uuid, p_role text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  current_role_ text;
begin
  perform public._admin_guard();
  if p_role not in ('user', 'admin') then
    raise exception 'unknown role' using errcode = '22023';
  end if;
  select role into current_role_ from public.profiles where id = p_user for update;
  if current_role_ is null then
    raise exception 'user not found' using errcode = 'P0002';
  end if;
  if current_role_ = p_role then
    return;
  end if;
  if p_role = 'admin' and exists (select 1 from auth.users where id = p_user and banned_until > now()) then
    raise exception 'unblock this user first' using errcode = '42501';
  end if;
  if p_role = 'user' and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'you are the last admin' using errcode = '42501';
  end if;
  update public.profiles set role = p_role where id = p_user;
  perform public._admin_log(case when p_role = 'admin' then 'made admin' else 'removed admin' end, p_user);
end $$;

-- Block / unblock. Blocking ends their sessions, so they are signed out too.
create function public.admin_set_blocked(p_user uuid, p_blocked boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public._admin_guard();
  if p_user = (select auth.uid()) then
    raise exception 'you can''t block yourself' using errcode = '42501';
  end if;
  if not exists (select 1 from auth.users where id = p_user) then
    raise exception 'user not found' using errcode = 'P0002';
  end if;
  if p_blocked and exists (select 1 from public.profiles where id = p_user and role = 'admin') then
    raise exception 'remove admin first' using errcode = '42501';
  end if;
  update auth.users
    set banned_until = case when p_blocked then now() + interval '100 years' else null end
    where id = p_user;
  if p_blocked then
    delete from auth.sessions where user_id = p_user;
  end if;
  perform public._admin_log(case when p_blocked then 'blocked' else 'unblocked' end, p_user);
end $$;

-- Change someone's display name.
create function public.admin_set_name(p_user uuid, p_name text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  clean text := nullif(left(trim(coalesce(p_name, '')), 80), '');
begin
  perform public._admin_guard();
  update public.profiles set full_name = clean where id = p_user;
  if not found then
    raise exception 'user not found' using errcode = 'P0002';
  end if;
  perform public._admin_log('renamed', p_user, jsonb_build_object('name', clean));
end $$;

-- Delete an account and all its data. Second confirmation: the admin must type
-- the user's email, and it is checked here too. Admins can't be deleted (remove admin first).
create function public.admin_delete_user(p_user uuid, p_confirm_email text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  target_email text;
begin
  perform public._admin_guard();
  if p_user = (select auth.uid()) then
    raise exception 'you can''t delete yourself here' using errcode = '42501';
  end if;
  select email into target_email from auth.users where id = p_user;
  if target_email is null then
    raise exception 'user not found' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.profiles where id = p_user and role = 'admin') then
    raise exception 'remove admin first' using errcode = '42501';
  end if;
  if lower(trim(coalesce(p_confirm_email, ''))) <> lower(target_email) then
    raise exception 'email does not match' using errcode = '22023';
  end if;
  perform public._admin_log('deleted user', p_user, jsonb_build_object('email', target_email));
  delete from auth.users where id = p_user;
end $$;

-- Note in the log that a password-reset email was sent (the email itself is sent by Supabase Auth).
create function public.admin_log_password_reset(p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public._admin_guard();
  perform public._admin_log('sent password reset', p_user);
end $$;

-- ---------- who may call what ----------
revoke execute on function
  public.admin_users(), public.admin_stats(), public.admin_activity(int),
  public.admin_workouts(uuid, text, timestamptz, int),
  public.admin_set_role(uuid, text), public.admin_set_blocked(uuid, boolean),
  public.admin_set_name(uuid, text), public.admin_delete_user(uuid, text),
  public.admin_log_password_reset(uuid)
from public, anon;
grant execute on function
  public.admin_users(), public.admin_stats(), public.admin_activity(int),
  public.admin_workouts(uuid, text, timestamptz, int),
  public.admin_set_role(uuid, text), public.admin_set_blocked(uuid, boolean),
  public.admin_set_name(uuid, text), public.admin_delete_user(uuid, text),
  public.admin_log_password_reset(uuid)
to authenticated;

-- ---------- profile photos: admins may remove them when deleting an account ----------
create policy "admins read any avatar" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and public.is_admin());
create policy "admins delete any avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and public.is_admin());
