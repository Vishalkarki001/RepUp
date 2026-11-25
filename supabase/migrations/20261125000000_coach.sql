-- =====================================================================
-- RepUp — AI Coach chat ("Ask Coach")
--  - coach_messages: each person's own chat with the coach (questions and
--    answers). Only they can read or clear it; only the server writes it
--    (after checking the daily limit).
-- =====================================================================

create table public.coach_messages (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null check (char_length(content) between 1 and 8000),
  created_at timestamptz not null default now()
);
create index coach_messages_user_idx on public.coach_messages (user_id, created_at desc);

alter table public.coach_messages enable row level security;
create policy "read own coach chat" on public.coach_messages for select to authenticated using (user_id = (select auth.uid()));
create policy "clear own coach chat" on public.coach_messages for delete to authenticated using (user_id = (select auth.uid()));
revoke all on public.coach_messages from anon, authenticated;
grant select, delete on public.coach_messages to authenticated;
grant all on public.coach_messages to service_role;

-- Save a question if the person still has questions left today (`p_since` =
-- the start of their day). One person's questions are counted one at a time,
-- so many sent at once can't slip past the limit. No row back = limit reached.
create function public.coach_ask(p_user uuid, p_question text, p_since timestamptz, p_limit int)
returns table (msg_id bigint, asked int)
language plpgsql security definer set search_path = '' as $$
declare
  n int;
  new_id bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended('coach:' || p_user::text, 0));
  select count(*) into n from public.coach_messages m
    where m.user_id = p_user and m.role = 'user' and m.created_at >= p_since;
  if n >= p_limit then
    return;
  end if;
  insert into public.coach_messages (user_id, role, content) values (p_user, 'user', p_question)
    returning id into new_id;
  return query select new_id, n + 1;
end $$;
revoke execute on function public.coach_ask(uuid, text, timestamptz, int) from public, anon, authenticated;
grant execute on function public.coach_ask(uuid, text, timestamptz, int) to service_role;

notify pgrst, 'reload schema';
