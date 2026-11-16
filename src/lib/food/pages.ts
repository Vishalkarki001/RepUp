/**
 * Data for the public "Calories in …" pages (/calories and /calories/[food]):
 * RepUp's hand-checked food list with its servings and other nutrients.
 * Build-time only (pages are generated statically); no React.
 */
import { cleanMicro, microFor, nutrientsFor, type Food, type Serving } from './core';
import { servingsFrom, slug, type CuratedMicro } from './build-index';
import CURATED_MICRO from './curated-micro.json';
import { FOODS } from './foods';
import type { Macros, Micro } from '../types';

export interface FoodPage {
  slug: string;
  name: string;
  /** Other names people search for (Hindi / Hinglish). */
  aliases: string[];
  category: string;
  food: Food;
}

/** The first food of each group in foods.ts → the group's name. */
const GROUP_STARTS: [string, string][] = [
  ['Roti / chapati (plain)', 'Roti, rice and breakfast'],
  ['Dal (plain, cooked)', 'Dal and beans'],
  ['Aloo sabzi (dry)', 'Sabzi and curries'],
  ['Egg (boiled)', 'Egg, chicken, fish and meat'],
  ['Milk, full cream', 'Milk, curd and paneer'],
  ['Banana', 'Fruits'],
  ['Potato (boiled)', 'Vegetables'],
  ['Almonds', 'Nuts and seeds'],
  ['Samosa', 'Snacks and street food'],
  ['Gulab jamun', 'Sweets'],
  ['Cooking oil', 'Oil and extras'],
  ['Atta (whole wheat flour)', 'Flour, rice and dal (raw)'],
  ['Cola / soft drink', 'Drinks'],
];
export const CATEGORIES = GROUP_STARTS.map(([, c]) => c);

const micro = CURATED_MICRO as CuratedMicro;

function build(): FoodPage[] {
  const out: FoodPage[] = [];
  let category = GROUP_STARTS[0][1];
  for (const [name, aliases, kcal, protein, carbs, fat, servings, flags = ''] of FOODS) {
    const start = GROUP_STARTS.find(([n]) => n === name);
    if (start) category = start[1];
    out.push({
      slug: slug(name),
      name,
      aliases: aliases
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a && /^[\x20-\x7e]+$/.test(a)), // Latin-script names only (page text is English)
      category,
      food: {
        id: `local:${slug(name)}`,
        name,
        kind: 'local',
        per100: { kcal, protein, carbs, fat },
        servings: servingsFrom(servings),
        approx: flags.includes('a'),
        oil: flags.includes('o'),
        liquid: flags.includes('l'),
        micro: cleanMicro(micro[name]?.micro),
      },
    });
  }
  return out;
}

export const FOOD_PAGES: FoodPage[] = build();
export const foodPage = (s: string) => FOOD_PAGES.find((p) => p.slug === s);

/** "1 roti (40 g)", "1 glass (250 ml)", "1 × 10 almonds (12 g)". */
export function servingLabel(s: Serving, liquid?: boolean): string {
  const unit = liquid ? 'ml' : 'g';
  return /^[\d½]/.test(s.label) ? `${s.label} (${s.grams} ${unit})` : `1 ${s.label} (${s.grams} ${unit})`;
}

/** The serving people usually mean ("1 roti"); 100 g where the list offers it (paneer, chicken: searched per 100 g), else 100 g. */
export function mainServing(p: FoodPage): Serving {
  const hundred = p.food.servings.find((x) => x.grams === 100 && /^100 (g|ml)$/.test(x.label));
  return hundred ?? p.food.servings[0] ?? { label: p.food.liquid ? '100 ml' : '100 g', grams: 100 };
}

export function amountFor(p: FoodPage, grams: number): Macros & { micro?: Micro } {
  return { ...nutrientsFor(p.food, grams), micro: microFor(p.food, grams) };
}

/** Foods from the same group next to it in the list (internal links). */
export function relatedPages(p: FoodPage, n = 6): FoodPage[] {
  const group = FOOD_PAGES.filter((x) => x.category === p.category && x.slug !== p.slug);
  const i = FOOD_PAGES.indexOf(p);
  return group.sort((a, b) => Math.abs(FOOD_PAGES.indexOf(a) - i) - Math.abs(FOOD_PAGES.indexOf(b) - i)).slice(0, n);
}

/** Share of calories from protein / carbs / fat (whole %). */
export function calorieSplit(m: Macros): { protein: number; carbs: number; fat: number } {
  const total = m.protein * 4 + m.carbs * 4 + m.fat * 9;
  if (!total) return { protein: 0, carbs: 0, fat: 0 };
  const protein = Math.round(((m.protein * 4) / total) * 100);
  const fat = Math.round(((m.fat * 9) / total) * 100);
  return { protein, fat, carbs: Math.max(0, 100 - protein - fat) };
}
