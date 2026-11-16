-- =====================================================================
-- RepUp — barcodes found on the internet
--  - New food source 'web': a pack that's in neither the shared list nor
--    Open Food Facts, found online by its barcode (shop / brand pages) and
--    read by AI on the server. Saved to the shared list for everyone.
--  - barcode_misses: barcodes the web search couldn't find, so the same
--    number isn't searched again (and paid for) for a while.
-- =====================================================================

alter table public.food_catalog drop constraint if exists food_catalog_source_check;
alter table public.food_catalog add constraint food_catalog_source_check
  check (source in ('usda', 'off', 'web', 'user'));

alter table public.food_logs drop constraint if exists food_logs_source_check;
alter table public.food_logs add constraint food_logs_source_check
  check (source in ('local', 'usda', 'off', 'web', 'user', 'quick'));

create table public.barcode_misses (
  barcode    text primary key check (barcode ~ '^[0-9]{8,14}$'),
  name       text check (char_length(name) <= 120),
  checked_at timestamptz not null default now()
);
alter table public.barcode_misses enable row level security;
revoke all on public.barcode_misses from anon, authenticated;
grant all on public.barcode_misses to service_role;

-- Admin: food mode in numbers (now with foods found online).
create or replace function public.admin_food_stats() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public._admin_guard();
  return jsonb_build_object(
    'usda', (select count(*) from public.food_catalog where source = 'usda'),
    'off', (select count(*) from public.food_catalog where source = 'off'),
    'web', (select count(*) from public.food_catalog where source = 'web'),
    'user', (select count(*) from public.food_catalog where source = 'user'),
    'logs', (select count(*) from public.food_logs where not deleted),
    'loggers_7d', (select count(distinct user_id) from public.food_logs where not deleted and date >= current_date - 6),
    'with_goal', (select count(*) from public.food_goals where not deleted)
  );
end $$;
revoke execute on function public.admin_food_stats() from public, anon;
grant execute on function public.admin_food_stats() to authenticated;

notify pgrst, 'reload schema';
