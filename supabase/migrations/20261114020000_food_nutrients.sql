-- =====================================================================
-- RepUp — other nutrients in food mode (fibre, sugar, sodium, minerals, vitamins)
--  - food_logs.micro:    totals for that entry, e.g. {"fiber": 3.2, "magnesium": 41}
--  - food_catalog.micro: per 100 g, from USDA / Open Food Facts / the pack label
--  - add_food():         + optional p_micro (fibre, sugar, saturated fat, sodium from a label)
-- Keys and units: see NUTRIENTS in src/lib/food/core.ts (g, mg or µg).
-- =====================================================================

alter table public.food_logs add column if not exists micro jsonb;
alter table public.food_catalog add column if not exists micro jsonb;

alter table public.food_logs
  add constraint food_logs_micro_object check (micro is null or (jsonb_typeof(micro) = 'object' and length(micro::text) <= 1000));
alter table public.food_catalog
  add constraint food_catalog_micro_object check (micro is null or (jsonb_typeof(micro) = 'object' and length(micro::text) <= 1000));

-- add_food() gets one more (optional) argument, so it's replaced.
drop function if exists public.add_food(text, text, text, numeric, numeric, numeric, numeric, jsonb, boolean);
create function public.add_food(
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
begin
  if me is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;
  if nullif(trim(p_barcode), '') is not null then
    select * into found_row from public.food_catalog where barcode = trim(p_barcode);
    if found then
      return found_row;
    end if;
  end if;
  if (select count(*) from public.food_catalog where created_by = me and created_at > now() - interval '1 day') >= 30 then
    raise exception 'too many new foods today' using errcode = '54000';
  end if;
  if jsonb_typeof(coalesce(p_servings, '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_servings, '[]'::jsonb)) > 5 then
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
    coalesce(p_servings, '[]'::jsonb),
    coalesce(p_liquid, false),
    me,
    clean_micro
  )
  returning * into found_row;
  return found_row;
end $$;
revoke execute on function public.add_food(text, text, text, numeric, numeric, numeric, numeric, jsonb, boolean, jsonb) from public, anon;
grant execute on function public.add_food(text, text, text, numeric, numeric, numeric, numeric, jsonb, boolean, jsonb) to authenticated;

notify pgrst, 'reload schema';
