/**
 * Daily protein: how much, and one way to get there with Indian food.
 * Used by the free calculator on /protein-calculator. Plain functions, no React.
 *
 * Amounts per kg of body weight: for lifting, about 1.6 g/kg helps muscle grow
 * and up to 2.2 g/kg can still add a little (Morton et al. 2018 meta-analysis),
 * a bit more while losing fat keeps muscle; ICMR-NIN's daily need for adults who
 * don't train is about 0.8 g/kg. So: lose fat 1.8–2.2, build muscle 1.6–2.2,
 * active 1.2–1.6, not training 0.8–1.0.
 */

export type ProteinGoal = 'lose' | 'gain' | 'active' | 'none';

export const PROTEIN_GOALS: { id: ProteinGoal; label: string; hint: string; perKg: [number, number] }[] = [
  { id: 'lose', label: 'Lose fat', hint: 'keep muscle while eating less', perKg: [1.8, 2.2] },
  { id: 'gain', label: 'Build muscle', hint: 'gym 3+ days a week', perKg: [1.6, 2.2] },
  { id: 'active', label: 'Stay fit', hint: 'walk, run or play sport', perKg: [1.2, 1.6] },
  { id: 'none', label: 'Not training', hint: 'little exercise', perKg: [0.8, 1.0] },
];

const round5 = (n: number) => Math.round(n / 5) * 5;

/** Grams a day: a range and one number to aim for (the middle). Null for weights outside 30–250 kg. */
export function proteinTarget(weightKg: number, goal: ProteinGoal): { low: number; high: number; target: number; perMeal: number } | null {
  if (!(weightKg >= 30 && weightKg <= 250)) return null;
  const [a, b] = PROTEIN_GOALS.find((g) => g.id === goal)!.perKg;
  const low = round5(weightKg * a);
  const high = round5(weightKg * b);
  const target = round5((low + high) / 2);
  return { low, high, target, perMeal: round5(target / 4) };
}

/** A food portion and its protein (from RepUp's food list). */
export interface ProteinFood {
  slug: string;
  name: string;
  portion: string;
  protein: number;
  veg: boolean;
}

/** A day that's easy to follow: a handful of foods, not ten. */
export const MAX_FOODS = 6;

/**
 * One way to reach `target` grams: walk down the list (best everyday sources
 * first, at most MAX_FOODS of them) taking one portion of each, going round
 * again if needed, until the total gets there. At most 3 portions of any one food.
 */
export function sampleDay(foods: ProteinFood[], target: number, veg: boolean): { items: { food: ProteinFood; count: number }[]; total: number } {
  const list = foods.filter((f) => !veg || f.veg).slice(0, MAX_FOODS);
  const counts = new Map<string, number>();
  let total = 0;
  for (let round = 0; round < 3 && total < target; round++) {
    for (const f of list) {
      if (total >= target) break;
      counts.set(f.slug, (counts.get(f.slug) ?? 0) + 1);
      total += f.protein;
    }
  }
  const items = list.filter((f) => counts.has(f.slug)).map((food) => ({ food, count: counts.get(food.slug)! }));
  return { items, total: Math.round(total) };
}
