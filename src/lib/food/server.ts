import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServer } from '../supabase/server';
import { isSupabaseConfigured, SUPABASE_URL } from '../supabase/env';
import { believable, normalizeText, r1, type Food, type Serving } from './core';
import type { FoodSource } from '../types';

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
}

const COLS = 'id,source,name,brand,barcode,kcal,protein,carbs,fat,servings,liquid';

export function foodFromRow(r: CatalogRow): Food {
  return {
    id: r.id,
    name: r.name,
    brand: r.brand ?? undefined,
    kind: r.source as FoodSource,
    per100: { kcal: Math.round(Number(r.kcal)), protein: Number(r.protein), carbs: Number(r.carbs), fat: Number(r.fat) },
    servings: Array.isArray(r.servings) ? r.servings.filter((s) => s && s.label && s.grams > 0).slice(0, 5) : [],
    liquid: r.liquid,
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
  const servings = (f.foodMeasures ?? [])
    .filter((m) => m.gramWeight > 0 && m.gramWeight <= 2000 && !/quantity not specified/i.test(m.disseminationText))
    .slice(0, 3)
    .map((m) => ({ label: m.disseminationText.replace(/^1\s+/, '').slice(0, 40), grams: r1(m.gramWeight) }));
  return { id: `usda:${f.fdcId}`, name: tidyName(f.description), kind: 'usda', per100, servings };
}

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

interface OffProduct {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  quantity?: string;
  product_quantity?: number | string;
  serving_size?: string;
  serving_quantity?: number | string;
  nutriments?: Record<string, number | string | undefined>;
}

export type BarcodeResult =
  | { found: true; food: Food }
  /** Not known anywhere (or the label data looked wrong): the user can add it from the pack. */
  | { found: false; name?: string; brand?: string };

export async function lookupBarcode(code: string): Promise<BarcodeResult> {
  const db = await readDb();
  const { data: known } = db ? await db.from('food_catalog').select(COLS).eq('barcode', code).maybeSingle() : { data: null };
  if (known) return { found: true, food: foodFromRow(known as CatalogRow) };

  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_en,brands,quantity,product_quantity,serving_size,serving_quantity,nutriments`,
    { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000), cache: 'no-store' },
  );
  if (res.status === 404) return { found: false };
  if (!res.ok) throw new Error(`Open Food Facts ${res.status}`);
  const data = (await res.json()) as { status?: number; product?: OffProduct };
  const p = data.product;
  if (!data.status || !p) return { found: false };

  const name = (p.product_name_en || p.product_name || '').trim();
  const brand = p.brands?.split(',')[0]?.trim() || undefined;
  const num = (k: string) => {
    const v = Number(p.nutriments?.[k]);
    return Number.isFinite(v) ? v : null;
  };
  const kj = num('energy-kj_100g') ?? num('energy_100g');
  const kcal = num('energy-kcal_100g') ?? (kj !== null ? kj / 4.184 : null);
  const protein = num('proteins_100g');
  const carbs = num('carbohydrates_100g');
  const fat = num('fat_100g');
  if (!name || kcal === null || protein === null || carbs === null || fat === null) return { found: false, name: name || undefined, brand };
  const per100 = { kcal: Math.round(kcal), protein: r1(protein), carbs: r1(carbs), fat: r1(fat) };
  if (!believable(per100)) return { found: false, name, brand };

  const liquid = /\b\d+(\.\d+)?\s*(ml|l|litre|liter)\b/i.test(p.quantity ?? '');
  const servings: Serving[] = [];
  const serving = Number(p.serving_quantity);
  // "1 serving · 30 g" (a 100 g "serving" is just the label's per-100 g column: grams covers it).
  if (serving > 0 && serving <= 2000 && serving !== 100) servings.push({ label: 'serving', grams: r1(serving) });
  const pack = Number(p.product_quantity);
  if (pack > 0 && pack <= 2000 && pack !== serving) servings.push({ label: 'whole pack', grams: r1(pack) });

  const food: Food = { id: `off:${code}`, name: name.slice(0, 120), brand, kind: 'off', per100, servings, liquid };
  await saveFoods([food], code);
  return { found: true, food };
}
