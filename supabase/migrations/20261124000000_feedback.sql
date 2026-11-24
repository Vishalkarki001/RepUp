-- =====================================================================
-- RepUp — feedback from users ("Send feedback" in Settings)
--  - feedback: what someone wrote, its kind, and a little about their phone
--    (mode, screen, browser) so problems can be understood.
--  - send_feedback(): the only way in (signed in, at most 10 a day).
--  - admins read it and mark it done in the admin panel.
-- Nobody but admins can read feedback; people can't read each other's.
-- =====================================================================

create table public.feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete set null,
  email      text check (char_length(email) <= 320),
  kind       text not null check (kind in ('bug', 'idea', 'other')),
  message    text not null check (char_length(message) between 1 and 2000),
  meta       jsonb not null default '{}'::jsonb check (jsonb_typeof(meta) = 'object' and length(meta::text) <= 2000),
  status     text not null default 'new' check (status in ('new', 'done')),
  created_at timestamptz not null default now()
);
create index feedback_created_idx on public.feedback (created_at desc);
create index feedback_user_idx on public.feedback (user_id, created_at desc);
alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;
grant all on public.feedback to service_role;

-- Send feedback as the signed-in person. Returns its id.
create function public.send_feedback(p_kind text, p_message text, p_meta jsonb default '{}'::jsonb)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := (select auth.uid());
  msg text := trim(coalesce(p_message, ''));
  new_id uuid;
begin
  if me is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  if char_length(msg) = 0 or char_length(msg) > 2000 then
    raise exception 'message must be 1 to 2000 characters' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtext('feedback:' || me::text));
  if (select count(*) from public.feedback where user_id = me and created_at > now() - interval '1 day') >= 10 then
    raise exception 'too much feedback today' using errcode = '54000';
  end if;
  insert into public.feedback (user_id, email, kind, message, meta)
  values (
    me,
    (select email from auth.users where id = me),
    case when p_kind in ('bug', 'idea', 'other') then p_kind else 'other' end,
    msg,
    case when jsonb_typeof(p_meta) = 'object' and length(p_meta::text) <= 2000 then p_meta else '{}'::jsonb end
  )
  returning id into new_id;
  return new_id;
end $$;
revoke execute on function public.send_feedback(text, text, jsonb) from public, anon;
grant execute on function public.send_feedback(text, text, jsonb) to authenticated;

-- Admin: the feedback, newest first (optionally only new or only done).
create function public.admin_feedback(p_status text default null, p_limit integer default 200)
returns table (
  id uuid,
  kind text,
  message text,
  meta jsonb,
  status text,
  created_at timestamptz,
  user_id uuid,
  user_email text,
  user_name text
)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._admin_guard();
  return query
    select f.id, f.kind, f.message, f.meta, f.status, f.created_at, f.user_id, f.email, p.full_name
      from public.feedback f
      left join public.profiles p on p.id = f.user_id
     where p_status is null or f.status = p_status
     order by f.created_at desc
     limit least(greatest(coalesce(p_limit, 200), 1), 500);
end $$;
revoke execute on function public.admin_feedback(text, integer) from public, anon;
grant execute on function public.admin_feedback(text, integer) to authenticated;

-- Admin: mark feedback done (or new again).
create function public.admin_set_feedback(p_id uuid, p_status text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  who uuid;
begin
  perform public._admin_guard();
  if p_status not in ('new', 'done') then
    raise exception 'bad status' using errcode = '22023';
  end if;
  update public.feedback set status = p_status where id = p_id returning user_id into who;
  if not found then
    raise exception 'feedback not found' using errcode = 'P0002';
  end if;
  perform public._admin_log('feedback_' || p_status, who, jsonb_build_object('feedback_id', p_id));
end $$;
revoke execute on function public.admin_set_feedback(uuid, text) from public, anon;
grant execute on function public.admin_set_feedback(uuid, text) to authenticated;

notify pgrst, 'reload schema';
