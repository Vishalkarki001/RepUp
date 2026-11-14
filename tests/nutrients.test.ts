/**
 * Other nutrients (fibre, minerals, vitamins) and barcode parsing:
 * maths, the data files, Open Food Facts edge cases and the sync round trip.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, test } from 'node:test';
import { buildIndex, type CuratedMicro, type IndbRow } from '../src/lib/food/build-index';
import { cleanMicro, foodFromLog, microFor, NUTRIENTS, sumMicro } from '../src/lib/food/core';
import { FOODS } from '../src/lib/food/foods';
import { barcodeVariants, foodFromOff, isProductCode } from '../src/lib/food/off';
import { actions, getState } from '../src/lib/store';
import { __syncInternals as S } from '../src/lib/sync';
import type { FoodLog } from '../src/lib/types';

const read = (f: string) => JSON.parse(readFileSync(new URL(`../src/lib/food/${f}`, import.meta.url), 'utf8'));
const INDB = read('indb.json') as IndbRow[];
const CURATED = read('curated-micro.json') as CuratedMicro;
const index = buildIndex(FOODS, INDB, CURATED);
const food = (name: string) => index.find((s) => s.food.name === name)!.food;

describe('nutrient maths', () => {
  test('cleanMicro keeps known, believable numbers only', () => {
    assert.deepEqual(cleanMicro({ fiber: 2.345, sodium: -1, iron: 'x', vitaminC: 99999, foo: 1, sugar: null }), { fiber: 2.35 });
    assert.equal(cleanMicro({}), undefined);
    assert.equal(cleanMicro(null), undefined);
  });
  test('microFor scales per 100 g to the amount', () => {
    assert.deepEqual(microFor({ micro: { fiber: 2.6, potassium: 358 } }, 120), { fiber: 3.12, potassium: 429.6 });
    assert.equal(microFor({}, 100), undefined);
  });
  test('sumMicro totals and counts which foods had each nutrient', () => {
    const r = sumMicro([{ micro: { fiber: 2, iron: 1 } }, { micro: { fiber: 3 } }, {}]);
    assert.deepEqual(r.total, { fiber: 5, iron: 1 });
    assert.deepEqual(r.counted, { fiber: 2, iron: 1 });
  });
  test('a logged food can be re-added with the same nutrients per 100 g', () => {
    const l = { micro: { fiber: 3.9, potassium: 537 }, grams: 150, amount: 1, unit: 'katori' } as FoodLog;
    assert.deepEqual(foodFromLog({ ...l, id: 'x', date: '2026-11-14', meal: 'lunch', foodId: 'f', name: 'n', kcal: 1, protein: 0, carbs: 0, fat: 0, source: 'local', loggedAt: 0 }).micro, { fiber: 2.6, potassium: 358 });
  });
  test('every nutrient has a label, unit and a daily value or none (sugar)', () => {
    for (const n of NUTRIENTS) assert.ok(n.label && n.unit && (n.dv === null || n.dv > 0), n.key);
  });
});

describe('nutrient data', () => {
  test('banana (USDA) has its lab values', () => assert.equal(food('Banana').micro?.potassium, 358));
  test('dal (INDB, scaled) has iron and fibre', () => {
    const m = food('Dal tadka / dal fry').micro!;
    assert.ok(m.iron! > 1 && m.fiber! > 2, JSON.stringify(m));
  });
  test('INDB recipes have nutrients, never cholesterol (missing for dairy there)', () => {
    const withMicro = index.filter((s) => s.food.id.startsWith('indb:') && s.food.micro);
    assert.ok(withMicro.length > 700, String(withMicro.length));
    assert.ok(withMicro.every((s) => s.food.micro!.cholesterol === undefined));
  });
  test('curated-micro.json only names foods that exist', () => {
    const names = new Set(FOODS.map((f) => f[0]));
    for (const name of Object.keys(CURATED)) assert.ok(names.has(name), name);
  });
  test('most of our own foods have nutrients', () => {
    const ours = index.filter((s) => s.food.id.startsWith('local:'));
    assert.ok(ours.filter((s) => s.food.micro).length >= 160, `${ours.filter((s) => s.food.micro).length} of ${ours.length}`);
  });
  test('saturated fat is never more than the fat', () => {
    for (const s of index) if (s.food.micro?.satFat !== undefined) assert.ok(s.food.micro.satFat <= s.food.per100.fat + 0.05, `${s.food.name}: ${s.food.micro.satFat} > ${s.food.per100.fat}`);
  });
});

describe('Open Food Facts', () => {
  test('per 100 g values + nutrients in our units', () => {
    const r = foodFromOff('8901262010016', {
      product_name: 'Butter', brands: 'Amul, GCMMF',
      nutriments: { 'energy-kcal_100g': 724, proteins_100g: 1, carbohydrates_100g: 0, fat_100g: 80, 'saturated-fat_100g': 48, salt_100g: 1.5, calcium_100g: 0.02 },
    });
    assert.ok(r.found);
    if (!r.found) return;
    assert.equal(r.food.brand, 'Amul');
    assert.deepEqual(r.food.per100, { kcal: 724, protein: 1, carbs: 0, fat: 80 });
    assert.deepEqual(r.food.micro, { satFat: 48, sodium: 600, calcium: 20 });
  });
  test('label with only "per serving" values → worked out per 100 g', () => {
    const r = foodFromOff('123', {
      product_name: 'Bar', serving_quantity: 40,
      nutriments: { 'energy-kcal_serving': 160, proteins_serving: 4, carbohydrates_serving: 24, fat_serving: 5.2 },
    });
    assert.ok(r.found && r.food.per100.kcal === 400 && r.food.per100.protein === 10 && r.food.servings[0].grams === 40);
  });
  test('impossible label (kcal far from macros) → not found, name kept for the form', () => {
    const r = foodFromOff('8901725181222', { product_name: 'Yippee noodles', nutriments: { 'energy-kcal_100g': 110, proteins_100g: 8.9, carbohydrates_100g: 62.4, fat_100g: 19.7 } });
    assert.deepEqual(r, { found: false, name: 'Yippee noodles', brand: undefined });
  });
  test('no nutrition at all → not found, with the name', () => assert.deepEqual(foodFromOff('1', { product_name: 'maggi', nutriments: {} }), { found: false, name: 'maggi', brand: undefined }));
  test('barcode helpers', () => {
    assert.deepEqual(barcodeVariants('012345678905'), ['012345678905', '0012345678905']);
    assert.deepEqual(barcodeVariants('0012345678905'), ['0012345678905', '012345678905']);
    assert.ok(isProductCode('8901262010016') && !isProductCode('https://x.y') && !isProductCode('1234567'));
  });
});

test('food log nutrients survive the trip to the database', () => {
  actions.resetAll();
  actions.addFoodLog({
    id: 'm1', date: '2026-11-14', meal: 'lunch', foodId: 'local:banana', name: 'Banana', amount: 1, unit: 'medium (peeled)', grams: 100,
    kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3, source: 'local', loggedAt: Date.UTC(2026, 10, 14, 8), micro: { fiber: 2.6, potassium: 358, vitaminC: 8.7 },
  });
  const row = S.rowsFromState(getState(), 'u').food_logs.get('m1')!;
  assert.deepEqual(row.micro, { fiber: 2.6, potassium: 358, vitaminC: 8.7 });
  const back = { ...row, logged_at: String(row.logged_at).replace('Z', '+00:00'), micro: { vitaminC: 8.7, potassium: 358, fiber: 2.6 } };
  assert.equal(S.fingerprint(S.normalizeRemote('food_logs', back)), S.fingerprint(row));
});
