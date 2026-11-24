/**
 * Website calculators: 1 rep max (Epley + Brzycki) and daily protein with an
 * Indian-food sample day built from RepUp's own food list.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { foodPage } from '../src/lib/food/pages';
import { proteinTarget, sampleDay, type ProteinFood } from '../src/lib/food/protein';
import { LANDING_PAGES, MARKETING_PATHS } from '../src/lib/site';
import { MAX_REPS, oneRepMax, repTable, roundToPlates, weightForReps, zones } from '../src/lib/strength';

describe('1 rep max', () => {
  test('a single is the max; 60 kg × 8 is about 75 kg', () => {
    assert.equal(oneRepMax(100, 1), 100);
    const m = oneRepMax(60, 8)!;
    assert.ok(m > 74 && m < 76, String(m)); // Epley 76, Brzycki 74.1
    assert.equal(roundToPlates(m), 75);
  });

  test('no estimate for nonsense or too many reps', () => {
    assert.equal(oneRepMax(0, 5), null);
    assert.equal(oneRepMax(60, 0), null);
    assert.equal(oneRepMax(60, MAX_REPS + 1), null);
    assert.equal(oneRepMax(60, 2.5), null);
  });

  test('the way back matches: max from a set, then that set from the max', () => {
    for (const reps of [2, 5, 8, 10, 12]) {
      const m = oneRepMax(80, reps)!;
      assert.ok(Math.abs(weightForReps(m, reps) - 80) < 1.5, `${reps} reps: ${weightForReps(m, reps)}`);
    }
  });

  test('rep table: 12 rows, lighter as reps go up, plate-friendly', () => {
    const t = repTable(100);
    assert.equal(t.length, 12);
    assert.deepEqual(t[0], { reps: 1, weight: 100, percent: 100 });
    for (let i = 1; i < t.length; i++) assert.ok(t[i].weight <= t[i - 1].weight && t[i].percent < t[i - 1].percent);
    for (const r of t) assert.equal(r.weight % 2.5, 0);
    for (const r of repTable(225, 'lb')) assert.equal(r.weight % 5, 0);
  });

  test('zones: strength heavier than muscle heavier than endurance', () => {
    const [s, m, e] = zones(100);
    assert.ok(s.from > m.from && m.from > e.to && s.to === 100);
  });
});

describe('protein', () => {
  test('70 kg building muscle: 110–155 g, aim 135', () => {
    assert.deepEqual(proteinTarget(70, 'gain'), { low: 110, high: 155, target: 135, perMeal: 35 });
  });

  test('ranges per goal, and nothing for impossible weights', () => {
    assert.equal(proteinTarget(70, 'none')!.target, 65);
    assert.ok(proteinTarget(70, 'lose')!.target > proteinTarget(70, 'active')!.target);
    assert.equal(proteinTarget(10, 'gain'), null);
    assert.equal(proteinTarget(400, 'gain'), null);
  });

  const foods: ProteinFood[] = [
    { slug: 'chicken', name: 'Chicken', portion: '1 piece', protein: 37, veg: false },
    { slug: 'paneer', name: 'Paneer', portion: '100 g', protein: 18, veg: true },
    { slug: 'dal', name: 'Dal', portion: '1 katori', protein: 9, veg: true },
  ];

  test('sample day reaches the target without going far over', () => {
    const d = sampleDay(foods, 60, false);
    assert.ok(d.total >= 60 && d.total < 60 + 37, String(d.total));
    assert.deepEqual(d.items.map((x) => x.food.slug), ['chicken', 'paneer', 'dal']);
  });

  test('veg day has no meat; repeats portions when needed, at most 3 of each', () => {
    const d = sampleDay(foods, 60, true);
    assert.ok(d.items.every((x) => x.food.veg));
    assert.ok(d.items.every((x) => x.count <= 3));
    assert.ok(d.total >= 60, String(d.total));
  });

  test('a day uses at most 6 different foods', () => {
    const many: ProteinFood[] = Array.from({ length: 10 }, (_, i) => ({ slug: `f${i}`, name: `F${i}`, portion: '1', protein: 5, veg: true }));
    const d = sampleDay(many, 50, true);
    assert.ok(d.items.length <= 6);
    assert.ok(d.total >= 50, String(d.total));
  });

  test('the foods the page uses exist in the food list', () => {
    for (const slug of ['chicken-breast-cooked', 'egg-boiled', 'paneer', 'dal-plain-cooked', 'soya-chunks-dry', 'greek-yogurt-plain-low-fat', 'milk-toned', 'whey-protein-1-scoop', 'roasted-chana', 'fish-fry', 'peanuts', 'tofu-firm']) {
      assert.ok(foodPage(slug), slug);
    }
  });
});

test('both calculators are public pages in the site registry', () => {
  for (const [path, group] of [
    ['/one-rep-max-calculator', 'gym'],
    ['/protein-calculator', 'food'],
  ]) {
    assert.ok(LANDING_PAGES.some((p) => p.path === path && p.group === group), path);
    assert.ok(MARKETING_PATHS.includes(path), path);
  }
});
