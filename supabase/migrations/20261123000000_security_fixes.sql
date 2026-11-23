-- =====================================================================
-- RepUp — security fixes (audit of 23 Nov 2026)
--  1. rate_limits + rate_hit(): quiet daily limits the server checks before
--     paid / shared work (AI barcode search, USDA search, test notifications).
--  2. add_food(): servings checked; one request at a time per person, so the
--     30-a-day limit can't be beaten by sending many at once.
--  3. share_exercise(): same one-at-a-time lock.
--  4. Push notifications only to real push services (no "send to any URL").
--  5. Name and photo URL limits; size limits on workouts, plans, runs and
--     exercise notes.
-- New limits are NOT VALID: rows saved before stay as they are; new and
-- changed rows must follow them.
-- =====================================================================

-- ---------- 1. quiet daily limits (server only) ----------
create table public.rate_limits (
  key   text not null check (char_length(key) <= 100),
  day   date not null default current_date,
  count integer not null default 0,
  primary key (key, day)
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;
grant all on public.rate_limits to service_role;

-- Count one more use of `p_key` today; true while still within `p_limit`.
create function public.rate_hit(p_key text, p_limit integer)
returns boolean
language sql security definer set search_path = '' as $$
  insert into public.rate_limits as r (key, day, count) values (left(p_key, 100), current_date, 1)
  on conflict (key, day) do update set count = r.count + 1
  returning r.count <= p_limit;
$$;
revoke execute on function public.rate_hit(text, integer) from public, anon, authenticated;
grant execute on function public.rate_hit(text, integer) to service_role;

-- ---------- 2. add_food: servings checked, one at a time ----------
create or replace function public.add_food(
  p_name text,
  p_brand text,
  p_barcode text,
  p_kcal numeric,
  p_protein numeric,
  p_carbs numeric,
  p_fat numeric,
  p_servings jsonb default '[]'::jsonb,
  p_liquid boolean default false,
  p_micro jsonb default null
) returns public.food_catalog
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := (select auth.uid());
  found_row public.food_catalog;
  clean_micro jsonb;
  servings jsonb := coalesce(p_servings, '[]'::jsonb);
begin
  if me is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  -- One add at a time per person (else many parallel calls all pass the daily count).
  perform pg_advisory_xact_lock(hashtext('add_food:' || me::text));
  if nullif(trim(p_barcode), '') is not null then
    select * into found_row from public.food_catalog where barcode = trim(p_barcode);
    if found then
      return found_row;
    end if;
  end if;
  if (select count(*) from public.food_catalog where created_by = me and created_at > now() - interval '1 day') >= 30 then
    raise exception 'too many new foods today' using errcode = '54000';
  end if;
  -- Up to 5 servings, each a short label and a sane number of grams.
  if jsonb_typeof(servings) <> 'array' or jsonb_array_length(servings) > 5 or length(servings::text) > 1000
     or exists (
       select 1 from jsonb_array_elements(servings) e
        where jsonb_typeof(e) <> 'object'
           or jsonb_typeof(e -> 'label') is distinct from 'string'
           or char_length(e ->> 'label') not between 1 and 40
           or jsonb_typeof(e -> 'grams') is distinct from 'number'
           or (e ->> 'grams')::numeric not between 0.1 and 5000
     ) then
    raise exception 'bad servings' using errcode = '22023';
  end if;
  -- Only the label nutrients a person can type, as non-negative numbers below sane limits.
  if p_micro is not null and jsonb_typeof(p_micro) = 'object' then
    select jsonb_object_agg(key, round(value::text::numeric, 2))
      into clean_micro
      from jsonb_each(p_micro)
     where key in ('fiber', 'sugar', 'satFat', 'sodium')
       and jsonb_typeof(value) = 'number'
       and value::text::numeric >= 0
       and value::text::numeric <= case key when 'sodium' then 40000 else 100 end;
  end if;
  insert into public.food_catalog (id, source, name, brand, barcode, kcal, protein, carbs, fat, servings, liquid, created_by, micro)
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
    servings,
    coalesce(p_liquid, false),
    me,
    clean_micro
  )
  returning * into found_row;
  return found_row;
end $$;

-- ---------- 3. share_exercise: one at a time ----------
create or replace function public.share_exercise(p_name text, p_muscle text, p_equipment text)
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
  perform pg_advisory_xact_lock(hashtext('share_exercise:' || me::text));
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

-- ---------- 4. push: only real push services ----------
-- Chrome / Edge / Samsung (Google), Firefox (Mozilla), Edge on Windows, Safari (Apple).
create function public.is_push_endpoint(p text) returns boolean
language sql immutable set search_path = '' as $$
  select p ~ '^https://(fcm\.googleapis\.com|([a-z0-9-]+\.)*push\.services\.mozilla\.com|([a-z0-9-]+\.)*notify\.windows\.com|([a-z0-9-]+\.)*push\.apple\.com)/'
$$;
-- Old rows somewhere else can't be reached by the check (NOT VALID) but get no reminders either: remove them.
delete from public.push_subscriptions where not public.is_push_endpoint(endpoint);
alter table public.push_subscriptions
  add constraint push_subscriptions_known_service check (public.is_push_endpoint(endpoint)) not valid;

create or replace function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := (select auth.uid());
begin
  if me is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  if not public.is_push_endpoint(coalesce(p_endpoint, '')) then
    raise exception 'not a push service' using errcode = '22023';
  end if;
  if (select count(*) from public.push_subscriptions where user_id = me) >= 10 then
    delete from public.push_subscriptions
     where endpoint = (select endpoint from public.push_subscriptions where user_id = me order by created_at limit 1);
  end if;
  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth)
  values (p_endpoint, me, p_p256dh, p_auth)
  on conflict (endpoint) do update set user_id = me, p256dh = excluded.p256dh, auth = excluded.auth, created_at = now();
end $$;

-- ---------- 5. size limits ----------
-- Photo: RepUp's own storage or a Google account picture. Name: 80 characters.
create function public.is_avatar_url(p text) returns boolean
language sql immutable set search_path = '' as $$
  select p is null
      or p ~ '^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/avatars/'
      or p ~ '^https://([a-z0-9-]+\.)*googleusercontent\.com/'
$$;
alter table public.profiles
  add constraint profiles_full_name_len check (char_length(full_name) <= 80) not valid,
  add constraint profiles_avatar_url_ok check (public.is_avatar_url(avatar_url)) not valid;

-- New sign-ups: keep only a name of sane length and a photo from a known place.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  photo text := new.raw_user_meta_data ->> 'avatar_url';
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 80),
    case when public.is_avatar_url(photo) then photo end
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end $$;

-- Generous ceilings far above real use (a marathon route is well under 1 MB).
alter table public.workouts
  add constraint workouts_size check (pg_column_size(exercises) <= 500000 and char_length(coalesce(note, '')) <= 10000) not valid;
alter table public.plans
  add constraint plans_size check (pg_column_size(items) <= 200000) not valid;
alter table public.runs
  add constraint runs_size check (pg_column_size(route) <= 2000000 and char_length(coalesce(note, '')) <= 10000) not valid;
alter table public.exercises
  add constraint exercises_note_len check (char_length(coalesce(note, '')) <= 10000) not valid;

notify pgrst, 'reload schema';
