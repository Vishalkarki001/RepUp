-- =====================================================================
-- RepUp — running mode
--  - runs: one row per finished run / walk (GPS-tracked or entered by hand)
--  - user_settings.mode: which side of the app the user last used
-- Same rules as every other table: each user can only touch their own rows,
-- deletes are soft so other devices learn about them.
-- =====================================================================

alter table public.user_settings
  add column if not exists mode text not null default 'workout' check (mode in ('workout', 'running'));

create table public.runs (
  user_id      uuid not null references auth.users (id) on delete cascade,
  id           text not null,
  kind         text not null default 'run' check (kind in ('run', 'walk')),
  started_at   timestamptz not null,
  finished_at  timestamptz not null,
  duration_s   integer not null check (duration_s >= 0),
  distance_m   integer not null check (distance_m >= 0),
  steps        integer check (steps >= 0),
  steps_source text check (steps_source in ('sensor', 'estimate')),
  calories     integer not null default 0 check (calories >= 0),
  temp_c       numeric(4, 1),
  weather_code smallint,
  route        jsonb not null default '[]'::jsonb,  -- [[lat, lng], ...] simplified
  splits       jsonb not null default '[]'::jsonb,  -- seconds per full km
  gap_s        integer not null default 0,
  source       text not null default 'gps' check (source in ('gps', 'manual')),
  note         text,
  deleted      boolean not null default false,
  updated_at   timestamptz not null default now(),
  primary key (user_id, id)
);
create index runs_user_started_idx on public.runs (user_id, started_at desc);

create trigger set_updated_at before insert or update on public.runs
  for each row execute function public.set_updated_at();

alter table public.runs enable row level security;
create policy "own runs" on public.runs
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.runs from anon, authenticated;
grant select, insert, update, delete on public.runs to authenticated;

-- Let the API see the new table and column straight away.
notify pgrst, 'reload schema';
