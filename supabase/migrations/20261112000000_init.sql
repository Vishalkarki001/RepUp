-- =====================================================================
-- RepUp — initial schema
-- Every data row belongs to one user (user_id) and Row Level Security
-- makes sure a signed-in user can only ever read / write their own rows.
-- Deletes are "soft" (deleted = true) so other devices learn about them
-- when they sync.
-- =====================================================================

-- ---------- profiles (one per account, created automatically) ----------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  full_name    text,
  avatar_url   text,
  role         text not null default 'user' check (role in ('user', 'admin')),
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz
);

-- ---------- settings (one row per user) ----------
create table public.user_settings (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  rest_seconds int  not null default 90 check (rest_seconds between 0 and 3600),
  default_reps int  not null default 10 check (default_reps between 1 and 999),
  unit         text not null default 'kg' check (unit in ('kg', 'lb')),
  onboarded    boolean not null default false,
  updated_at   timestamptz not null default now()
);

-- ---------- exercises: the user's own exercises + notes on built-in ones ----------
create table public.exercises (
  user_id    uuid not null references auth.users (id) on delete cascade,
  id         text not null,
  name       text not null,
  muscle     text not null,
  equipment  text not null,
  custom     boolean not null default true,
  note       text,
  deleted    boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------- weekly plan: one row per weekday (0 = Sunday … 6 = Saturday) ----------
create table public.plans (
  user_id    uuid not null references auth.users (id) on delete cascade,
  day        smallint not null check (day between 0 and 6),
  name       text not null default '',
  items      jsonb not null default '[]'::jsonb,  -- [{ exerciseId, sets, reps, weight }]
  deleted    boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- ---------- finished workouts ----------
create table public.workouts (
  user_id     uuid not null references auth.users (id) on delete cascade,
  id          text not null,
  name        text not null,
  day         smallint check (day between 0 and 6),
  started_at  timestamptz not null,
  finished_at timestamptz,
  exercises   jsonb not null default '[]'::jsonb, -- [{ exerciseId, repMin, repMax, sets: [...] }]
  note        text,
  deleted     boolean not null default false,
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);
create index workouts_user_started_idx on public.workouts (user_id, started_at desc);

-- ---------- body weight log ----------
create table public.body_weights (
  user_id    uuid not null references auth.users (id) on delete cascade,
  id         text not null,
  date       date not null,
  kg         numeric(6, 2) not null check (kg > 0),
  deleted    boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ---------- updated_at is always set by the server ----------
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger set_updated_at before insert or update on public.user_settings for each row execute function public.set_updated_at();
create trigger set_updated_at before insert or update on public.exercises     for each row execute function public.set_updated_at();
create trigger set_updated_at before insert or update on public.plans         for each row execute function public.set_updated_at();
create trigger set_updated_at before insert or update on public.workouts      for each row execute function public.set_updated_at();
create trigger set_updated_at before insert or update on public.body_weights  for each row execute function public.set_updated_at();

-- ---------- new sign-up → profile + settings rows ----------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- helpers ----------
-- Is the signed-in user an admin? (security definer so it can read profiles under RLS)
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

-- Admin panel: every account with a few stats. Raises for non-admins.
create function public.admin_users()
returns table (
  id uuid,
  email text,
  full_name text,
  provider text,
  role text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  last_seen_at timestamptz,
  email_confirmed boolean,
  workouts bigint,
  last_workout_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
    select
      u.id,
      u.email::text,
      p.full_name,
      coalesce(u.raw_app_meta_data ->> 'provider', 'email'),
      coalesce(p.role, 'user'),
      u.created_at,
      u.last_sign_in_at,
      p.last_seen_at,
      u.email_confirmed_at is not null,
      count(w.id) filter (where not w.deleted),
      max(w.started_at) filter (where not w.deleted)
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.workouts w on w.user_id = u.id
    group by u.id, p.full_name, p.role, p.last_seen_at
    order by u.created_at desc;
end $$;

-- "Delete my account" from inside the app (removes all their rows via cascade).
create function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  delete from auth.users where id = (select auth.uid());
end $$;

-- ---------- Row Level Security ----------
alter table public.profiles      enable row level security;
alter table public.user_settings enable row level security;
alter table public.exercises     enable row level security;
alter table public.plans         enable row level security;
alter table public.workouts      enable row level security;
alter table public.body_weights  enable row level security;

create policy "own profile (admins: all)" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own settings" on public.user_settings
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own exercises" on public.exercises
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own plans" on public.plans
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own workouts" on public.workouts
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own body weights" on public.body_weights
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ---------- privileges (nothing for anonymous visitors) ----------
-- Start from zero (the project may auto-grant everything on new tables), then
-- give back only what the app needs.
revoke all on public.profiles, public.user_settings, public.exercises, public.plans, public.workouts, public.body_weights from anon, authenticated;
grant select, insert, update, delete on public.user_settings, public.exercises, public.plans, public.workouts, public.body_weights to authenticated;
grant select on public.profiles to authenticated;
-- users may edit their name / photo / last-seen, but never their role
grant update (full_name, avatar_url, last_seen_at) on public.profiles to authenticated;

revoke execute on function public.is_admin(), public.admin_users(), public.delete_my_account(), public.handle_new_user(), public.set_updated_at() from public, anon;
grant execute on function public.is_admin(), public.admin_users(), public.delete_my_account() to authenticated;
