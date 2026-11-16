/**
 * A packaged food found on the internet by its barcode (shop or brand pages),
 * read by AI on the server (lib/food/web.ts). This file is the plain part:
 * what the AI must report, and turning that into a Food we can trust.
 * No React, no server-only code (shared with the tests).
 */
import { believable, cleanMicro, r1, type Food, type Serving } from './core';
import type { BarcodeResult } from './off';

/** What the AI reports for one barcode (the report_product tool's input). */
export interface WebProduct {
  found: boolean;
  name: string | null;
  brand: string | null;
  /** Which column of the label the numbers are from. */
  basis: '100g' | '100ml' | 'serving' | 'unknown';
  /** Grams (or ml) in one serving, as printed on the label. */
  serving_g: number | null;
  /** Net weight (or volume) of the whole pack. */
  pack_g: number | null;
  liquid: boolean;
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
  sat_fat: number | null;
  sodium_mg: number | null;
  /** The page the numbers were read from. */
  source_url: string | null;
}

const num = { type: ['number', 'null'] };
const str = { type: ['string', 'null'] };

/** JSON schema of WebProduct (strict tool input: every field required, nothing extra). */
export const WEB_PRODUCT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['found', 'name', 'brand', 'basis', 'serving_g', 'pack_g', 'liquid', 'kcal', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sat_fat', 'sodium_mg', 'source_url'],
  properties: {
    found: { type: 'boolean', description: 'true only if a page clearly matches this barcode / exact product AND shows its nutrition facts' },
    name: { ...str, description: 'Product name as on the pack, without the brand, e.g. "Aloo Bhujia" or "Dark Fantasy Choco Fills"' },
    brand: { ...str, description: 'Brand, e.g. "Haldiram\'s"' },
    basis: { type: 'string', enum: ['100g', '100ml', 'serving', 'unknown'], description: 'Which label column the numbers below are from' },
    serving_g: { ...num, description: 'Grams (or ml) in one serving as printed on the label' },
    pack_g: { ...num, description: 'Net weight in grams (or volume in ml) of the whole pack' },
    liquid: { type: 'boolean', description: 'true for drinks (amounts in ml)' },
    kcal: { ...num, description: 'Energy in kcal (if only kJ is given, divide by 4.184)' },
    protein: { ...num, description: 'grams' },
    carbs: { ...num, description: 'Total carbohydrate, grams' },
    fat: { ...num, description: 'Total fat, grams' },
    fiber: { ...num, description: 'Dietary fibre, grams' },
    sugar: { ...num, description: 'Total sugars, grams' },
    sat_fat: { ...num, description: 'Saturated fat, grams' },
    sodium_mg: { ...num, description: 'Sodium in mg (if only salt in g is given: salt × 400)' },
    source_url: { ...str, description: 'URL of the page the nutrition numbers were read from' },
  },
} as const;

const pos = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null);

/**
 * The AI's report → a food per 100 g, or not found. Per-serving numbers are
 * worked out per 100 g from the serving size. Anything missing or impossible
 * (kcal that doesn't match protein, carbs and fat) → not found, keeping the
 * name so the "add from label" form starts filled in.
 */
export function foodFromWeb(code: string, p: WebProduct): BarcodeResult {
  const name = (p.name ?? '').trim().replace(/\s+/g, ' ').slice(0, 120);
  const brand = (p.brand ?? '').trim().replace(/\s+/g, ' ').slice(0, 80) || undefined;
  if (!p.found || !name) return { found: false, name: name || undefined, brand };

  const servingG = pos(p.serving_g);
  let scale: number | null = null;
  if (p.basis === '100g' || p.basis === '100ml') scale = 1;
  else if (p.basis === 'serving' && servingG && servingG > 0 && servingG <= 2000) scale = 100 / servingG;
  const [kcal, protein, carbs, fat] = [p.kcal, p.protein, p.carbs, p.fat].map(pos);
  if (scale === null || kcal === null || protein === null || carbs === null || fat === null) return { found: false, name, brand };

  const per100 = { kcal: Math.round(kcal * scale), protein: r1(protein * scale), carbs: r1(carbs * scale), fat: r1(fat * scale) };
  if (!believable(per100)) return { found: false, name, brand };

  const s = (v: number | null) => (pos(v) === null ? null : pos(v)! * scale!);
  const micro = cleanMicro({ fiber: s(p.fiber), sugar: s(p.sugar), satFat: s(p.sat_fat), sodium: s(p.sodium_mg) });
  // A part can't be more than the whole (a misread label).
  if (micro?.satFat !== undefined && micro.satFat > per100.fat + 0.5) delete micro.satFat;
  if (micro?.sugar !== undefined && micro.sugar > per100.carbs + 0.5) delete micro.sugar;
  if (micro?.fiber !== undefined && micro.fiber > per100.carbs + 0.5) delete micro.fiber;

  const servings: Serving[] = [];
  if (servingG && servingG <= 2000 && servingG !== 100) servings.push({ label: 'serving', grams: r1(servingG) });
  const pack = pos(p.pack_g);
  if (pack && pack <= 2000 && pack !== servingG) servings.push({ label: 'whole pack', grams: r1(pack) });

  return {
    found: true,
    food: {
      id: `web:${code}`,
      name,
      brand,
      kind: 'web',
      per100,
      servings,
      liquid: p.basis === '100ml' || !!p.liquid,
      micro: micro && Object.keys(micro).length ? micro : undefined,
    } satisfies Food,
  };
}
