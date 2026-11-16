-- =====================================================================
-- RepUp — reminders (web push notifications, also on the installed PWA)
--  - push_subscriptions: where to send (one row per browser / phone)
--  - reminder_prefs:     what to remind each person about, and when
--  - reminder_log:       what was sent today (each reminder at most once a day)
--  - a cron job (pg_cron + pg_net) calls /api/push/run every 5 minutes.
--    Its password is read from Supabase Vault (secret "repup_cron_secret"),
--    never stored here: see the note at the end.
-- =====================================================================

create table public.push_subscriptions (
  endpoint   text primary key check (endpoint like 'https://%' and char_length(endpoint) <= 1000),
  user_id    uuid not null references auth.users (id) on delete cascade,
  p256dh     text not null check (char_length(p256dh) <= 200),
  auth       text not null check (char_length(auth) <= 100),
  created_at timestamptz not null default now(),
  last_ok_at timestamptz
);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
create policy "own subscriptions" on public.push_subscriptions for select to authenticated using (user_id = (select auth.uid()));
create policy "remove own subscriptions" on public.push_subscriptions for delete to authenticated using (user_id = (select auth.uid()));
revoke all on public.push_subscriptions from anon, authenticated;
grant select, delete on public.push_subscriptions to authenticated;
grant all on public.push_subscriptions to service_role;

-- Save this browser for the signed-in person. A browser that belonged to someone
-- else on this device (they signed out without removing it) moves to the new person.
create function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := (select auth.uid());
begin
  if me is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  if (select count(*) from public.push_subscriptions where user_id = me) >= 10 then
    delete from public.push_subscriptions
     where endpoint = (select endpoint from public.push_subscriptions where user_id = me order by created_at limit 1);
  end if;
  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth)
  values (p_endpoint, me, p_p256dh, p_auth)
  on conflict (endpoint) do update set user_id = me, p256dh = excluded.p256dh, auth = excluded.auth, created_at = now();
end $$;
revoke execute on function public.save_push_subscription(text, text, text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text) to authenticated;

create table public.reminder_prefs (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  tz         text not null default 'Asia/Kolkata' check (char_length(tz) between 1 and 64),
  prefs      jsonb not null default '{}'::jsonb check (jsonb_typeof(prefs) = 'object' and length(prefs::text) <= 2000),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before insert or update on public.reminder_prefs
  for each row execute function public.set_updated_at();
alter table public.reminder_prefs enable row level security;
create policy "own reminder prefs" on public.reminder_prefs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.reminder_prefs from anon, authenticated;
grant select, insert, update, delete on public.reminder_prefs to authenticated;
grant all on public.reminder_prefs to service_role;

create table public.reminder_log (
  user_id uuid not null references auth.users (id) on delete cascade,
  kind    text not null check (char_length(kind) <= 20),
  day     date not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, kind, day)
);
alter table public.reminder_log enable row level security;
revoke all on public.reminder_log from anon, authenticated;
grant all on public.reminder_log to service_role;
-- (old rows are cleaned up by the cron job below)

-- ---------- every 5 minutes: ask the app to send what's due ----------
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron')
     and exists (select 1 from pg_available_extensions where name = 'pg_net') then
    create extension if not exists pg_cron with schema pg_catalog;
    create extension if not exists pg_net with schema extensions;
    perform cron.unschedule(jobid) from cron.job where jobname in ('repup-reminders', 'repup-reminder-log-cleanup');
    perform cron.schedule(
      'repup-reminders',
      '*/5 * * * *',
      $job$
        select net.http_post(
          url := 'https://getrepup.vercel.app/api/push/run',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'repup_cron_secret'), '')
          ),
          body := '{}'::jsonb,
          timeout_milliseconds := 20000
        )
        where exists (select 1 from vault.decrypted_secrets where name = 'repup_cron_secret');
      $job$
    );
    perform cron.schedule('repup-reminder-log-cleanup', '17 3 * * *', $job$ delete from public.reminder_log where day < current_date - 7 $job$);
  else
    raise notice 'pg_cron / pg_net not available here: reminders cron not scheduled';
  end if;
end $$;

-- To switch reminders on (once, in Supabase → SQL Editor), with the same value as CRON_SECRET in Vercel:
--   select vault.create_secret('<CRON_SECRET>', 'repup_cron_secret');
-- Until then the job runs and does nothing.

notify pgrst, 'reload schema';
