import { makeSearchable, normalizeText, type Food, type Searchable, type Serving } from './core';
import type { FoodRow } from './foods';

/** Row of indb.json: [name, kcal, protein, carbs, fat, serving label, serving grams]. */
export type IndbRow = [string, number, number, number, number, string, number];

const STOP = new Set(['plain', 'cooked', 'with', 'and', 'ki', 'ka', 'ke']);
const slug = (s: string) => normalizeText(s).replace(/ /g, '-').slice(0, 60);

function servingsFrom(spec: string): Serving[] {
  return spec
    .split('|')
    .map((part) => {
      const i = part.lastIndexOf(':');
      return { label: part.slice(0, i).trim(), grams: Number(part.slice(i + 1)) };
    })
    .filter((s) => s.label && s.grams > 0);
}

/** Exported for tests (they pass the JSON in themselves). */
export function buildIndex(foods: FoodRow[], indb: IndbRow[]): Searchable[] {
  const out: Searchable[] = [];
  /** Word sets of our own names: a recipe-book food whose words all appear in one of ours is the same food. */
  const ours: Set<string>[] = [];
  const words = (s: string) => normalizeText(s).split(' ').filter((w) => w.length > 1 && !STOP.has(w));
  for (const [name, aliases, kcal, protein, carbs, fat, servings, flags = ''] of foods) {
    const food: Food = {
      id: `local:${slug(name)}`,
      name,
      kind: 'local',
      per100: { kcal, protein, carbs, fat },
      servings: servingsFrom(servings),
      approx: flags.includes('a'),
      oil: flags.includes('o'),
      liquid: flags.includes('l'),
    };
    ours.push(new Set(words(name)));
    out.push(makeSearchable(food, aliases));
  }
  for (const [name, kcal, protein, carbs, fat, unit, grams] of indb) {
    const w = words(name);
    if (w.length && ours.some((set) => w.every((x) => set.has(x)))) continue; // our own entry wins
    const food: Food = {
      id: `indb:${slug(name)}`,
      name,
      kind: 'local',
      per100: { kcal, protein, carbs, fat },
      servings: unit && grams ? [{ label: unit, grams }] : [],
      approx: true,
    };
    out.push(makeSearchable(food));
  }
  return out;
}

