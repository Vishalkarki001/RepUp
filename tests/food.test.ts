/**
 * Food mode tests: every built-in food is believable, search finds Indian
 * foods (typos, Hindi), maths for amounts / oil / targets, and the store.
 */
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { describe, test } from 'node:test';
import { buildIndex, type IndbRow } from '../src/lib/food/build-index';
import { addDays, believable, bmr, foodStreak, gramsFromSplit, SPLIT_PRESETS, splitFromGoal, foodFromLog, goalFor, macrosForKcal, maintenance, nutrientsFor, recentFoods, searchFoods } from '../src/lib/food/core';
import { FOODS } from '../src/lib/food/foods';
import { actions } from '../src/lib/store';
import type { FoodLog } from '../src/lib/types';

const INDB = JSON.parse(readFileSync(new URL('../src/lib/food/indb.json', import.meta.url), 'utf8')) as IndbRow[];
const index = buildIndex(FOODS, INDB);
const top = (q: string) => searchFoods(index, q, 5).map((f) => f.name);

describe('food list', () => {
  test('about 1,000 foods or more', () => assert.ok(index.length >= 1000, `only ${index.length}`));
  test('ids are unique', () => assert.equal(new Set(index.map((s) => s.food.id)).size, index.length));
  test('every food: kcal matches protein, carbs and fat (alcohol excepted)', () => {
    for (const [name, , kcal, protein, carbs, fat, , flags = ''] of FOODS) {
      if (flags.includes('x')) continue;
      assert.ok(believable({ kcal, protein, carbs, fat }), `${name}: ${kcal} kcal vs P${protein} C${carbs} F${fat}`);
    }
    for (const [name, kcal, protein, carbs, fat] of INDB) assert.ok(believable({ kcal, protein, carbs, fat }), name);
  });
  test('every serving has a label and grams', () => {
    for (const s of index) for (const v of s.food.servings) assert.ok(v.label && v.grams > 0 && v.grams <= 1000, `${s.food.name}: ${v.label}`);
  });
  test('believable() rejects impossible numbers', () => {
    assert.equal(believable({ kcal: 100, protein: 50, carbs: 50, fat: 50 }), false);
    assert.equal(believable({ kcal: 50, protein: 10, carbs: 30, fat: 5 }), false); // 205 from macros
    assert.equal(believable({ kcal: 264, protein: 8.7, carbs: 51, fat: 2.5 }), true);
  });
});

describe('search', () => {
  test('roti first for "roti"', () => assert.match(top('roti')[0], /^Roti/));
  test('typo: "panner" finds paneer', () => assert.ok(top('panner').some((n) => /paneer/i.test(n))));
  test('other name: "chapatti" finds roti', () => assert.ok(top('chapatti').some((n) => /chapati/i.test(n))));
  test('Hindi: "दाल" finds dal', () => assert.ok(top('दाल').some((n) => /dal/i.test(n))));
  test('Hinglish: "kela" finds banana', () => assert.equal(top('kela')[0], 'Banana'));
  test('two words: "aloo paratha"', () => assert.equal(top('aloo paratha')[0], 'Aloo paratha'));
  test('INDB recipes are searchable', () => assert.ok(top('dhokla').length >= 2));
  test('nothing for gibberish', () => assert.deepEqual(top('qwxzv'), []));
});

describe('amounts', () => {
  const roti = index.find((s) => s.food.name === 'Roti / chapati (plain)')!.food;
  test('2 roti (80 g)', () => assert.deepEqual(nutrientsFor(roti, 80), { kcal: 211, protein: 7, carbs: 40.8, fat: 2 }));
  const dal = index.find((s) => s.food.name === 'Dal tadka / dal fry')!.food;
  test('extra oil adds fat, less oil removes it', () => {
    const normal = nutrientsFor(dal, 150);
    assert.ok(nutrientsFor(dal, 150, 'extra').kcal > normal.kcal + 30);
    assert.ok(nutrientsFor(dal, 150, 'less').kcal < normal.kcal - 30);
  });
  test('oil level ignored for foods without the oil option', () => assert.deepEqual(nutrientsFor(roti, 80, 'extra'), nutrientsFor(roti, 80)));
});

describe('know your calories', () => {
  const p = { sex: 'male' as const, age: 30, heightCm: 175, weightKg: 75, activity: 'moderate' as const };
  test('Mifflin–St Jeor BMR', () => {
    assert.equal(bmr(p), 1698.75);
    assert.equal(bmr({ ...p, sex: 'female' }), 1532.75);
  });
  test('maintenance = BMR × activity', () => assert.ok(Math.abs(maintenance(p) - 1698.75 * 1.55) < 0.01));
  test('lose = maintenance − 500, macros add up', () => {
    const g = goalFor(p, 'lose');
    assert.equal(g.kcal, 2130);
    assert.equal(g.protein, 150);
    assert.ok(Math.abs(g.protein * 4 + g.carbs * 4 + g.fat * 9 - g.kcal) < 15);
  });
  test('lose never goes below the resting burn', () => {
    const g = goalFor({ ...p, sex: 'female', weightKg: 50, heightCm: 155, activity: 'sitting' }, 'lose');
    assert.ok(g.kcal >= 1200 && g.kcal >= bmr({ ...p, sex: 'female', weightKg: 50, heightCm: 155 }) - 10);
  });
  test('gain = maintenance + 300', () => assert.equal(goalFor(p, 'gain').kcal, Math.round((maintenance(p) + 300) / 10) * 10));
  test('typed target gets macros', () => assert.deepEqual(macrosForKcal(2000, 70), { protein: 112, fat: 56, carbs: 262 }));
});

describe('food log in the store', () => {
  const log = (extra: Partial<FoodLog> = {}): FoodLog => ({
    id: Math.random().toString(36).slice(2),
    date: '2026-11-13',
    meal: 'lunch',
    foodId: 'local:roti-chapati-plain',
    name: 'Roti / chapati (plain)',
    amount: 2,
    unit: 'roti',
    grams: 80,
    kcal: 211,
    protein: 7,
    carbs: 40.8,
    fat: 2,
    source: 'local',
    loggedAt: Date.now(),
    ...extra,
  });
  test('add, edit, delete, goal', () => {
    actions.resetAll();
    const a = log();
    actions.addFoodLog(a);
    actions.updateFoodLog(a.id, { amount: 3, grams: 120, kcal: 317 });
    actions.setFoodGoal({ plan: 'custom', kcal: 2000, protein: 120, carbs: 230, fat: 60 });
    const s = JSON.parse(actions.exportJSON());
    assert.equal(s.foodLogs.length, 1);
    assert.equal(s.foodLogs[0].kcal, 317);
    assert.equal(s.foodGoal.kcal, 2000);
    actions.deleteFoodLog(a.id);
    assert.equal(JSON.parse(actions.exportJSON()).foodLogs.length, 0);
  });
  test('backup without food data still loads; bad rows dropped', () => {
    const s = JSON.parse(actions.exportJSON());
    delete s.foodLogs;
    delete s.foodGoal;
    assert.equal(actions.importJSON(JSON.stringify(s)), true);
    s.foodLogs = [log(), { id: 'bad', meal: 'brunch' }];
    s.settings.mode = 'food';
    assert.equal(actions.importJSON(JSON.stringify(s)), true);
    const back = JSON.parse(actions.exportJSON());
    assert.equal(back.foodLogs.length, 1);
    assert.equal(back.settings.mode, 'food');
  });
  test('recent foods: one per food, newest first, values per 100 g worked back', () => {
    const r = recentFoods([log({ loggedAt: 1 }), log({ loggedAt: 2, amount: 1, grams: 40, kcal: 106 })]);
    assert.equal(r.length, 1);
    assert.equal(r[0].last.amount, 1);
    assert.equal(r[0].food.per100.kcal, 265);
    assert.deepEqual(foodFromLog(log()).servings, [{ label: 'roti', grams: 40 }]);
  });
});

describe('target in % (like MyFitnessPal)', () => {
  test('2300 kcal at 30 / 40 / 30 → grams', () => assert.deepEqual(gramsFromSplit(2300, { protein: 30, carbs: 40, fat: 30 }), { protein: 173, carbs: 230, fat: 77 }));
  test('grams add back up to about the calories', () => {
    const g = gramsFromSplit(2300, { protein: 50, carbs: 20, fat: 30 });
    assert.ok(Math.abs(g.protein * 4 + g.carbs * 4 + g.fat * 9 - 2300) <= 10);
  });
  test('saved grams read back as the same whole %, adding up to 100', () => {
    for (const kcal of [1200, 1780, 2000, 2300, 3100]) {
      for (const { split } of SPLIT_PRESETS) {
        const back = splitFromGoal({ kcal, ...gramsFromSplit(kcal, split) });
        assert.deepEqual(back, split, `${kcal} kcal ${JSON.stringify(split)} → ${JSON.stringify(back)}`);
      }
    }
  });
  test('calculator targets show a % split that adds up to 100', () => {
    const g = goalFor({ sex: 'female', age: 30, heightCm: 165, weightKg: 62, activity: 'light' }, 'lose');
    const s = splitFromGoal(g);
    assert.equal(s.protein + s.carbs + s.fat, 100);
  });
});

describe('days, streak, water', () => {
  test('addDays crosses months and years', () => {
    assert.equal(addDays('2026-12-31', 1), '2027-01-01');
    assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  });
  test('streak counts back from today, or from yesterday when today is empty', () => {
    const d = new Set(['2026-11-11', '2026-11-12', '2026-11-13']);
    assert.equal(foodStreak(d, '2026-11-13'), 3);
    assert.equal(foodStreak(d, '2026-11-14'), 3);
    assert.equal(foodStreak(d, '2026-11-15'), 0);
  });
  test('water: set, clamp, 0 removes the day', () => {
    actions.resetAll();
    actions.setWater('2026-11-13', 5);
    actions.setWater('2026-11-14', 99);
    assert.deepEqual(JSON.parse(actions.exportJSON()).water, { '2026-11-13': 5, '2026-11-14': 40 });
    actions.setWater('2026-11-14', 0);
    assert.deepEqual(JSON.parse(actions.exportJSON()).water, { '2026-11-13': 5 });
  });
});

describe('PDFs', () => {
  test('food day PDF', async () => {
    const { buildFoodPdf } = await import('../src/lib/exportPdf');
    const logs = Array.from({ length: 40 }, (_, i): FoodLog => ({
      id: String(i), date: '2026-11-13', meal: (['breakfast', 'lunch', 'dinner', 'snacks'] as const)[i % 4], foodId: 'x', name: `Food number ${i} with a fairly long name to wrap`,
      amount: 1.5, unit: 'katori', grams: 225, kcal: 200, protein: 10, carbs: 20, fat: 8, source: 'local', loggedAt: i,
    }));
    const { doc, name } = await buildFoodPdf('2026-11-13', logs, { plan: 'lose', kcal: 1800, protein: 140, carbs: 180, fat: 50 }, 6);
    assert.equal(name, 'Food-13-Nov-2026.pdf');
    assert.ok(doc.getNumberOfPages() >= 2, 'long day spills onto a second page');
  });
  test('run PDF with route and splits', async () => {
    const { buildRunPdf } = await import('../src/lib/exportPdf');
    const route = Array.from({ length: 50 }, (_, i): [number, number] => [12.97 + i * 0.0004, 77.59 + Math.sin(i / 5) * 0.001]);
    const { doc, name } = await buildRunPdf({
      id: 'r', kind: 'run', startedAt: new Date(2026, 10, 13, 7).getTime(), finishedAt: 0, durationS: 1800, distanceM: 5020,
      steps: 5200, stepsSource: 'sensor', calories: 360, tempC: 24, weatherCode: 1, route, splits: [360, 352, 349, 355, 341], source: 'gps', note: 'Easy',
    });
    assert.equal(name, 'Run-5.02km-13-Nov-2026.pdf');
    assert.equal(doc.getNumberOfPages(), 1);
  });
});

test('barcode reader .wasm in public/ matches the installed zxing-wasm', () => {
  assert.equal(statSync('public/zxing_reader.wasm').size, statSync('node_modules/zxing-wasm/dist/reader/zxing_reader.wasm').size);
});
