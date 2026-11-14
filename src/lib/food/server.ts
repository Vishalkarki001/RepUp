import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServer } from '../supabase/server';
import { isSupabaseConfigured, SUPABASE_URL } from '../supabase/env';
import { believable, cleanMicro, normalizeText, r1, type Food, type Serving } from './core';
import { barcodeVariants, fetchOffProduct, foodFromOff, type BarcodeResult } from './off';
import type { FoodSource, Micro, NutrientKey } from '../types';

/**
 * Server side of food search (Route Handlers only, keys never reach the browser):
 *  - the shared food list in the database (food_catalog);
 *  - USDA FoodData Central for anything not there yet (USDA_API_KEY);
 *  - Open Food Facts for barcodes (pack labels).
 * Foods found at USDA / Open Food Facts are saved to the shared list (needs
 * SUPABASE_SECRET_KEY), so the next search is instant for everyone.
 * Only believable rows are kept (kcal must match protein, carbs and fat).
 */

const USDA_KEY = process.env.USDA_API_KEY;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const UA = 'RepUp/1.0 (+https://getrepup.vercel.app)';
/** A search looked up at USDA isn't looked up again for this long. */
const REFRESH_DAYS = 30;

let admin: SupabaseClient | null = null;
/** Database client that may write to the shared list (server only). Null when the secret key isn't set. */
function adminDb(): SupabaseClient | null {
  if (!SECRET_KEY || !SUPABASE_URL) return null;
  return (admin ??= createClient(SUPABASE_URL, SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } }));
}

/** The signed-in user's id, or null (search is for signed-in users only). */
export async function signedInUser(): Promise<string | null> {
  if (!isSupabaseConfigured) return 'local-dev'; // no accounts at all (local development)
  const db = await createSupabaseServer();
  const { data } = await db.auth.getClaims();
  return (data?.claims?.sub as string | undefined) ?? null;
}

/* ------------------------------------------------------------------ */
/* shared list (food_catalog)                                            */
/* ------------------------------------------------------------------ */

interface CatalogRow {
  id: string;
  source: 'usda' | 'off' | 'user';
  name: string;
  brand: string | null;
  barcode: string | null;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: Serving[] | null;
  liquid: boolean;
  micro?: Micro | null;
}

const COLS = 'id,source,name,brand,barcode,kcal,protein,carbs,fat,servings,liquid,micro';

export function foodFromRow(r: CatalogRow): Food {
  return {
    id: r.id,
    name: r.name,
    brand: r.brand ?? undefined,
    kind: r.source as FoodSource,
    per100: { kcal: Math.round(Number(r.kcal)), protein: Number(r.protein), carbs: Number(r.carbs), fat: Number(r.fat) },
    servings: Array.isArray(r.servings) ? r.servings.filter((s) => s && s.label && s.grams > 0).slice(0, 5) : [],
    liquid: r.liquid,
    micro: cleanMicro(r.micro),
  };
}

function rowFromFood(f: Food, barcode?: string): CatalogRow {
  return {
    id: f.id,
    source: f.kind as CatalogRow['source'],
    name: f.name.slice(0, 120),
    brand: f.brand?.slice(0, 80) ?? null,
    barcode: barcode ?? null,
    kcal: r1(f.per100.kcal),
    protein: r1(f.per100.protein),
    carbs: r1(f.per100.carbs),
    fat: r1(f.per100.fat),
    servings: f.servings,
    liquid: !!f.liquid,
    micro: f.micro ?? null,
  };
}

async function readDb(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  return adminDb() ?? (await createSupabaseServer());
}

/** Save foods to the shared list (best effort: search still works if this fails). */
async function saveFoods(foods: Food[], barcode?: string) {
  const db = adminDb();
  if (!db || !foods.length) return;
  const { error } = await db.from('food_catalog').upsert(
    foods.map((f) => rowFromFood(f, barcode)),
    { onConflict: 'id' },
  );
  if (error) console.error('food_catalog save failed:', error.message);
}

/* ------------------------------------------------------------------ */
/* USDA FoodData Central                                                */
/* ------------------------------------------------------------------ */

interface UsdaFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  foodNutrients?: { nutrientId: number; value: number; unitName: string }[];
  foodMeasures?: { disseminationText: string; gramWeight: number }[];
}

/** "CHICKEN CURRY" / "Bananas, raw" → "Chicken curry" / "Bananas, raw". */
function tidyName(s: string): string {
  const t = s.trim().replace(/\s+/g, ' ');
  return t === t.toUpperCase() ? t.charAt(0) + t.slice(1).toLowerCase() : t;
}

function fromUsda(f: UsdaFood): Food | null {
  const n = (id: number, unit = 'G') => f.foodNutrients?.find((x) => x.nutrientId === id && x.unitName?.toUpperCase() === unit)?.value;
  const protein = n(1003) ?? 0;
  const fat = n(1004) ?? 0;
  const carbs = n(1005) ?? 0;
  const kcal = n(1008, 'KCAL') ?? n(2047, 'KCAL') ?? n(2048, 'KCAL') ?? 4 * protein + 4 * carbs + 9 * fat;
  const per100 = { kcal: Math.round(kcal), protein: r1(protein), carbs: r1(carbs), fat: r1(fat) };
  if (!believable(per100)) return null;
  const micro: Partial<Record<NutrientKey, number | undefined>> = {};
  for (const [key, id, unit] of USDA_MICRO) micro[key] = n(id, unit);
  const servings = (f.foodMeasures ?? [])
    .filter((m) => m.gramWeight > 0 && m.gramWeight <= 2000 && !/quantity not specified/i.test(m.disseminationText))
    .slice(0, 3)
    .map((m) => ({ label: m.disseminationText.replace(/^1\s+/, '').slice(0, 40), grams: r1(m.gramWeight) }));
  return { id: `usda:${f.fdcId}`, name: tidyName(f.description), kind: 'usda', per100, servings, micro: cleanMicro(micro) };
}

/** USDA nutrient numbers for the other nutrients, with the unit we store. */
const USDA_MICRO: [NutrientKey, number, string][] = [
  ['fiber', 1079, 'G'],
  ['sugar', 2000, 'G'],
  ['satFat', 1258, 'G'],
  ['cholesterol', 1253, 'MG'],
  ['sodium', 1093, 'MG'],
  ['potassium', 1092, 'MG'],
  ['calcium', 1087, 'MG'],
  ['iron', 1089, 'MG'],
  ['magnesium', 1090, 'MG'],
  ['zinc', 1095, 'MG'],
  ['vitaminA', 1106, 'UG'],
  ['vitaminC', 1162, 'MG'],
  ['folate', 1177, 'UG'],
];

async function searchUsda(q: string): Promise<Food[]> {
  if (!USDA_KEY) return [];
  const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(USDA_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q, dataType: ['Foundation', 'SR Legacy', 'Survey (FNDDS)'], pageSize: 25 }),
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`USDA ${res.status}`);
  const data = (await res.json()) as { foods?: UsdaFood[] };
  const seen = new Set<string>();
  const out: Food[] = [];
  for (const f of data.foods ?? []) {
    const food = fromUsda(f);
    if (!food || seen.has(food.name.toLowerCase())) continue;
    seen.add(food.name.toLowerCase());
    out.push(food);
    if (out.length >= 15) break;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* search                                                               */
/* ------------------------------------------------------------------ */

/** Small in-memory cache per server instance (repeat searches while typing). */
const memo = new Map<string, { at: number; foods: Food[] }>();
const MEMO_MS = 10 * 60_000;

/** Shared list + USDA. New USDA foods are saved to the shared list. */
export async function searchServer(query: string): Promise<{ foods: Food[]; usda: 'ok' | 'off' | 'error' }> {
  const q = normalizeText(query).slice(0, 60);
  const words = q.split(' ').filter((w) => w.length >= 2).slice(0, 5);
  if (!words.length) return { foods: [], usda: 'ok' };
  const hit = memo.get(q);
  if (hit && Date.now() - hit.at < MEMO_MS) return { foods: hit.foods, usda: 'ok' };

  const db = await readDb();
  let query$ = db?.from('food_catalog').select(COLS).limit(25);
  for (const w of words) query$ = query$?.ilike('search', `%${w.replace(/[%_\\]/g, '')}%`);
  const writer = adminDb();
  const [{ data: rows }, known] = await Promise.all([
    query$ ?? Promise.resolve({ data: [] }),
    writer
      ? writer.from('food_queries').select('ids,fetched_at').eq('q', q).maybeSingle<{ ids: string[]; fetched_at: string }>()
      : Promise.resolve({ data: null }),
  ]);
  const byId = new Map<string, Food>();
  for (const r of (rows ?? []) as CatalogRow[]) byId.set(r.id, foodFromRow(r));

  let usda: 'ok' | 'off' | 'error' = USDA_KEY ? 'ok' : 'off';
  const fresh = known.data && Date.now() - Date.parse(known.data.fetched_at) < REFRESH_DAYS * 86_400_000;
  if (fresh && known.data?.ids.length && writer) {
    // Looked up before: USDA's answers are already in the shared list.
    const missing = known.data.ids.filter((id: string) => !byId.has(id));
    if (missing.length) {
      const { data } = await writer.from('food_catalog').select(COLS).in('id', missing);
      for (const r of (data ?? []) as CatalogRow[]) byId.set(r.id, foodFromRow(r));
    }
  } else if (!fresh && USDA_KEY) {
    try {
      const found = await searchUsda(q);
      for (const f of found) if (!byId.has(f.id)) byId.set(f.id, f);
      await saveFoods(found);
      if (writer) {
        await writer.from('food_queries').upsert({ q, ids: found.map((f) => f.id), fetched_at: new Date().toISOString() });
      }
    } catch (e) {
      usda = 'error';
      console.error('USDA search failed:', (e as Error).message);
    }
  }

  const foods = [...byId.values()];
  if (usda !== 'error') {
    memo.set(q, { at: Date.now(), foods });
    if (memo.size > 500) memo.delete(memo.keys().next().value!);
  }
  return { foods, usda };
}

/* ------------------------------------------------------------------ */
/* barcode                                                              */
/* ------------------------------------------------------------------ */


export async function lookupBarcode(code: string): Promise<BarcodeResult> {
  const codes = barcodeVariants(code);
  const db = await readDb();
  if (db) {
    const { data: known } = await db.from('food_catalog').select(COLS).in('barcode', codes).limit(1).maybeSingle();
    if (known) return { found: true, food: foodFromRow(known as CatalogRow) };
  }
  for (const c of codes) {
    const product = await fetchOffProduct(c, { 'User-Agent': UA });
    if (!product) continue;
    const result = foodFromOff(c, product);
    if (result.found) await saveFoods([result.food], c);
    return result;
  }
  return { found: false };
}
