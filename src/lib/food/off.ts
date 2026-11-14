/**
 * Open Food Facts (packaged foods by barcode). Shared by the server route and
 * the app (the app asks Open Food Facts itself if RepUp's server can't).
 * Plain functions, no React, no server-only code.
 */
import { believable, cleanMicro, r1, type Food, type Serving } from './core';
import type { NutrientKey } from '../types';

export interface OffProduct {
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

/** Only product barcodes: EAN-8, UPC-A (12), EAN-13, GTIN-14. */
export const isProductCode = (s: string) => /^\d{8,14}$/.test(s);

/** The same product can be printed as UPC-A (12 digits) or EAN-13 (a leading 0). */
export function barcodeVariants(code: string): string[] {
  const out = [code];
  if (code.length === 12) out.push(`0${code}`);
  if (code.length === 13 && code.startsWith('0')) out.push(code.slice(1));
  return out;
}

const FIELDS = 'product_name,product_name_en,brands,quantity,product_quantity,serving_size,serving_quantity,nutriments';

/** The product, or null when Open Food Facts doesn't know the barcode. Throws on network / server errors. */
export async function fetchOffProduct(code: string, headers?: Record<string, string>): Promise<OffProduct | null> {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${FIELDS}`, {
    headers,
    signal: AbortSignal.timeout(8000),
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Open Food Facts ${res.status}`);
  const data = (await res.json()) as { status?: number; product?: OffProduct };
  return data.status && data.product ? data.product : null;
}

/** Open Food Facts keys for the other nutrients (values there are grams per 100 g) → the app's units. */
const OFF_MICRO: [NutrientKey, string, number][] = [
  ['fiber', 'fiber', 1],
  ['sugar', 'sugars', 1],
  ['satFat', 'saturated-fat', 1],
  ['cholesterol', 'cholesterol', 1000],
  ['sodium', 'sodium', 1000],
  ['potassium', 'potassium', 1000],
  ['calcium', 'calcium', 1000],
  ['iron', 'iron', 1000],
  ['magnesium', 'magnesium', 1000],
  ['zinc', 'zinc', 1000],
  ['vitaminA', 'vitamin-a', 1_000_000],
  ['vitaminC', 'vitamin-c', 1000],
  ['folate', 'folates', 1_000_000],
];

/**
 * A pack's food per 100 g. Labels that only give "per serving" are worked out
 * from the serving size. Missing or impossible numbers (kcal that doesn't match
 * protein, carbs and fat) → not found, with the name so the label form starts filled in.
 */
export function foodFromOff(code: string, p: OffProduct): BarcodeResult {
  const name = (p.product_name_en || p.product_name || '').trim();
  const brand = p.brands?.split(',')[0]?.trim() || undefined;
  const servingG = Number(p.serving_quantity);
  const num = (k: string): number | null => {
    const per100 = p.nutriments?.[`${k}_100g`];
    if (per100 !== undefined && per100 !== '' && Number.isFinite(Number(per100))) return Number(per100);
    const perServing = p.nutriments?.[`${k}_serving`];
    if (perServing !== undefined && perServing !== '' && Number.isFinite(Number(perServing)) && servingG > 0) return (Number(perServing) / servingG) * 100;
    return null;
  };
  const kj = num('energy-kj') ?? num('energy');
  const kcal = num('energy-kcal') ?? (kj !== null ? kj / 4.184 : null);
  const protein = num('proteins');
  const carbs = num('carbohydrates');
  const fat = num('fat');
  if (!name || kcal === null || protein === null || carbs === null || fat === null) return { found: false, name: name || undefined, brand };
  const per100 = { kcal: Math.round(kcal), protein: r1(protein), carbs: r1(carbs), fat: r1(fat) };
  if (!believable(per100)) return { found: false, name, brand };

  const micro: Partial<Record<NutrientKey, number | null>> = {};
  for (const [key, off, factor] of OFF_MICRO) {
    const v = num(off);
    micro[key] = v === null ? null : v * factor;
  }
  if (micro.sodium == null) {
    const salt = num('salt');
    if (salt !== null) micro.sodium = (salt / 2.5) * 1000; // salt = sodium × 2.5
  }

  const liquid = /\b\d+(\.\d+)?\s*(ml|l|litre|liter)\b/i.test(p.quantity ?? '');
  const servings: Serving[] = [];
  // "1 serving · 30 g" (a 100 g "serving" is just the label's per-100 g column: grams covers it).
  if (servingG > 0 && servingG <= 2000 && servingG !== 100) servings.push({ label: 'serving', grams: r1(servingG) });
  const pack = Number(p.product_quantity);
  if (pack > 0 && pack <= 2000 && pack !== servingG) servings.push({ label: 'whole pack', grams: r1(pack) });

  return {
    found: true,
    food: { id: `off:${code}`, name: name.slice(0, 120), brand, kind: 'off', per100, servings, liquid, micro: cleanMicro(micro) },
  };
}
