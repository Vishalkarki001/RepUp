-- =====================================================================
-- Profile photos (Supabase Storage)
-- Bucket "avatars": anyone can view a photo by its URL (needed for <img>),
-- but a signed-in user can only upload / replace / delete files inside
-- their own folder: avatars/<their user id>/...
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "avatars: upload own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Listing/reading through the API: only your own folder (public URLs still work for <img>).
create policy "avatars: read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Show photos in the admin list too. (Return columns change, so drop + recreate, then re-grant.)
drop function if exists public.admin_users();
create function public.admin_users()
returns table (
  id uuid,
  email text,
  full_name text,
  avatar_url text,
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
      p.avatar_url,
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
    group by u.id, p.full_name, p.avatar_url, p.role, p.last_seen_at
    order by u.created_at desc;
end $$;

revoke execute on function public.admin_users() from public, anon;
grant execute on function public.admin_users() to authenticated;
