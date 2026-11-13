/**
 * Food maths shared by the app, the server search route and the tests:
 * food shapes, nutrient scaling, the "is this data believable?" check,
 * local search and the calorie calculator (Mifflin–St Jeor).
 * No React, no browser APIs.
 */
import type { Activity, FoodGoal, FoodLog, FoodPlan, FoodProfile, FoodSource, Macros, Sex } from '../types';

/** Where the numbers come from (shown as a small badge). */
export type FoodKind = FoodSource;

export interface Serving {
  label: string;
  grams: number;
}

/** A food you can add: values per 100 g (or 100 ml for drinks). */
export interface Food {
  id: string;
  name: string;
  brand?: string;
  kind: FoodKind;
  per100: Macros;
  servings: Serving[];
  /** Home-cooked: depends on the recipe (shown as "~ approx"). */
  approx?: boolean;
  /** Oil can be set to less / normal / extra. */
  oil?: boolean;
  /** Drink: amounts in ml. */
  liquid?: boolean;
}

export type OilLevel = 'less' | 'normal' | 'extra';
/** Fat added or removed per 100 g for less / extra oil (≈ ½ tsp per katori). */
export const OIL_FAT_PER_100G: Record<OilLevel, number> = { less: -3, normal: 0, extra: 3 };

export const r1 = (n: number) => Math.round(n * 10) / 10;

/** Nutrients for `grams` of a food (oil level only matters for oily dishes). */
export function nutrientsFor(food: Pick<Food, 'per100' | 'oil'>, grams: number, oil: OilLevel = 'normal'): Macros {
  const f = grams / 100;
  const extraFat = food.oil ? Math.max(-food.per100.fat, OIL_FAT_PER_100G[oil]) : 0;
  return {
    kcal: Math.round((food.per100.kcal + extraFat * 9) * f),
    protein: r1(food.per100.protein * f),
    carbs: r1(food.per100.carbs * f),
    fat: r1((food.per100.fat + extraFat) * f),
  };
}

/**
 * True when kcal roughly matches the macros (4 kcal/g protein and carbs, 9 kcal/g fat).
 * Catches typos and broken database rows. Fibre makes real foods read a little high,
 * so the margin is generous; very low-calorie foods are only checked loosely.
 */
export function believable(m: Macros): boolean {
  const vals = [m.kcal, m.protein, m.carbs, m.fat];
  if (vals.some((v) => !Number.isFinite(v) || v < 0)) return false;
  if (m.kcal > 902 || m.protein + m.carbs + m.fat > 101) return false;
  const fromMacros = 4 * m.protein + 4 * m.carbs + 9 * m.fat;
  if (m.kcal < 20 && fromMacros < 30) return true;
  return Math.abs(fromMacros - m.kcal) <= Math.max(20, m.kcal * 0.2);
}

export const sumMacros = (list: Macros[]): Macros =>
  list.reduce((a, x) => ({ kcal: a.kcal + x.kcal, protein: a.protein + x.protein, carbs: a.carbs + x.carbs, fat: a.fat + x.fat }), {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

/* ------------------------------------------------------------------ */
/* Search                                                               */
/* ------------------------------------------------------------------ */

export const normalizeText = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

/** Edit distance ≤ 1 (one typo: "panner" → "paneer", "chapatti" → "chapati"). */
function oneEditAway(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** How well one query word matches a list of words (0 = not at all). */
function wordScore(q: string, words: string[]): number {
  let best = 0;
  for (const w of words) {
    if (w === q) return 4;
    if (w.startsWith(q)) best = Math.max(best, 3);
    else if (q.length >= 3 && w.includes(q)) best = Math.max(best, 2);
    else if (q.length >= 4 && (oneEditAway(q, w) || (w.length > q.length && oneEditAway(q, w.slice(0, q.length + 1)))))
      best = Math.max(best, 1.5);
  }
  return best;
}

export interface Searchable {
  food: Food;
  /** Words of the name (count most) and of the other names. */
  nameWords: string[];
  aliasWords: string[];
}

export function makeSearchable(food: Food, aliases = ''): Searchable {
  return {
    food,
    nameWords: normalizeText(`${food.name} ${food.brand ?? ''}`).split(' ').filter(Boolean),
    aliasWords: normalizeText(aliases).split(' ').filter(Boolean),
  };
}

/** Foods matching every word of the query, best first. `boost` ranks e.g. recently eaten foods higher. */
export function searchFoods(list: Searchable[], query: string, limit = 30, boost?: (id: string) => number): Food[] {
  const qs = normalizeText(query).split(' ').filter(Boolean);
  if (!qs.length) return [];
  const scored: { food: Food; score: number }[] = [];
  for (const s of list) {
    let score = 0;
    let ok = true;
    for (const q of qs) {
      const inName = wordScore(q, s.nameWords);
      const inAlias = wordScore(q, s.aliasWords) * 0.8;
      const best = Math.max(inName, inAlias);
      if (!best) {
        ok = false;
        break;
      }
      score += best;
    }
    if (!ok) continue;
    // The name starting with the query, and shorter names, read as better matches.
    if (s.nameWords.join(' ').startsWith(qs.join(' '))) score += 2;
    score -= s.nameWords.length * 0.05;
    score += boost?.(s.food.id) ?? 0;
    scored.push({ food: s.food, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.food);
}

/* ------------------------------------------------------------------ */
/* Recent foods (from what you logged)                                  */
/* ------------------------------------------------------------------ */

export interface RecentFood {
  food: Food;
  /** What you had last time, to pre-fill the amount. */
  last: Pick<FoodLog, 'amount' | 'unit' | 'grams'>;
}

/** A logged food as a food you can add again (values worked back from what was logged). */
export function foodFromLog(l: FoodLog): Food {
  const f = l.grams > 0 ? 100 / l.grams : 0;
  const byWeight = l.unit === 'g' || l.unit === 'ml';
  return {
    id: l.foodId,
    name: l.name,
    kind: l.source,
    per100: { kcal: Math.round(l.kcal * f), protein: r1(l.protein * f), carbs: r1(l.carbs * f), fat: r1(l.fat * f) },
    servings: byWeight || l.amount <= 0 ? [] : [{ label: l.unit, grams: r1(l.grams / l.amount) }],
    liquid: l.unit === 'ml',
  };
}

/** Foods you've logged, most recent first, one per food. Values come from the log itself. */
export function recentFoods(logs: FoodLog[], limit = 20): RecentFood[] {
  const seen = new Set<string>();
  const out: RecentFood[] = [];
  const sorted = [...logs].sort((a, b) => b.loggedAt - a.loggedAt);
  for (const l of sorted) {
    if (seen.has(l.foodId) || l.grams <= 0) continue;
    seen.add(l.foodId);
    out.push({ food: foodFromLog(l), last: { amount: l.amount, unit: l.unit, grams: l.grams } });
    if (out.length >= limit) break;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Know your calories (Mifflin–St Jeor)                                 */
/* ------------------------------------------------------------------ */

export const ACTIVITY: { id: Activity; label: string; hint: string; factor: number }[] = [
  { id: 'sitting', label: 'Mostly sitting', hint: 'Desk job, little walking', factor: 1.2 },
  { id: 'light', label: 'Light', hint: 'Walks, or gym 1–3 days a week', factor: 1.375 },
  { id: 'moderate', label: 'Moderate', hint: 'Gym or sport 3–5 days a week', factor: 1.55 },
  { id: 'active', label: 'Active', hint: 'Hard training 6–7 days a week', factor: 1.725 },
  { id: 'very', label: 'Very active', hint: 'Physical job + training', factor: 1.9 },
];

/** Calories your body burns at rest (Mifflin–St Jeor, 1990). */
export function bmr(p: Pick<FoodProfile, 'sex' | 'age' | 'heightCm' | 'weightKg'>): number {
  return 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'male' ? 5 : -161);
}

/** Calories to stay at the same weight. */
export function maintenance(p: FoodProfile): number {
  return bmr(p) * (ACTIVITY.find((a) => a.id === p.activity)?.factor ?? 1.2);
}

const round10 = (n: number) => Math.round(n / 10) * 10;
/** Never suggest less than this (or less than the resting burn). */
const minKcal = (sex: Sex) => (sex === 'male' ? 1500 : 1200);

/**
 * A daily target for a plan. Lose ≈ 0.5 kg a week (−500 kcal, never below the
 * resting burn or 1200/1500), gain ≈ 0.25 kg a week (+300 kcal, lean bulk).
 * Protein 1.6 g/kg (2 g/kg while losing, to keep muscle), fat 25 % of calories,
 * carbs the rest.
 */
export function goalFor(p: FoodProfile, plan: Exclude<FoodPlan, 'custom'>): FoodGoal {
  const keep = maintenance(p);
  const kcal = round10(
    plan === 'lose' ? Math.max(keep - 500, minKcal(p.sex), bmr(p)) : plan === 'gain' ? keep + 300 : keep,
  );
  const protein = Math.round(p.weightKg * (plan === 'lose' ? 2 : 1.6));
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { plan, kcal, protein, carbs, fat, profile: p };
}

/** Macros (g) for a typed-in calorie target, same split as goalFor(). */
export function macrosForKcal(kcal: number, weightKg: number | null): Omit<Macros, 'kcal'> {
  const protein = Math.round(weightKg ? weightKg * 1.6 : (kcal * 0.25) / 4);
  const fat = Math.round((kcal * 0.25) / 9);
  return { protein, fat, carbs: Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4)) };
}

/* ------------------------------------------------------------------ */
/* Days                                                                 */
/* ------------------------------------------------------------------ */

/** "2026-11-13" + 1 → "2026-11-14" (local calendar days). */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(y, m - 1, d + n);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

/** Days in a row with food logged, up to today (or yesterday, if today is still empty). */
export function foodStreak(dates: Set<string>, today: string): number {
  let d = dates.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (dates.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}
