/**
 * Barcodes found on the internet: only real barcodes are searched (check digit),
 * and what the AI reports is turned into a food we can trust, or not found.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { validGtin } from '../src/lib/food/off';
import { foodFromWeb, WEB_PRODUCT_SCHEMA, type WebProduct } from '../src/lib/food/web-product';

describe('validGtin', () => {
  test('real barcodes pass', () => {
    for (const c of ['8901063010246', '8901262010016', '5449000000996', '036000291452', '96385074', '00012345600012']) assert.ok(validGtin(c), c);
  });
  test('one digit off fails', () => {
    assert.equal(validGtin('8901063010247'), false);
    assert.equal(validGtin('036000291453'), false);
  });
  test('wrong lengths and all zeros fail', () => {
    for (const c of ['', '123', '1234567', '12345678901', '123456789012345', '00000000', 'abcdefghijklm']) assert.equal(validGtin(c), false, c);
  });
});

const base: WebProduct = {
  found: true,
  name: 'Aloo Bhujia',
  brand: "Haldiram's",
  basis: '100g',
  serving_g: 30,
  pack_g: 200,
  liquid: false,
  kcal: 590,
  protein: 11,
  carbs: 38,
  fat: 44,
  fiber: 4,
  sugar: 2,
  sat_fat: 18,
  sodium_mg: 900,
  source_url: 'https://example.com/aloo-bhujia',
};

describe('foodFromWeb', () => {
  test('per 100 g label → food, saved under the barcode', () => {
    const r = foodFromWeb('8901063010246', base);
    assert.ok(r.found);
    assert.equal(r.food.id, 'web:8901063010246');
    assert.equal(r.food.kind, 'web');
    assert.deepEqual(r.food.per100, { kcal: 590, protein: 11, carbs: 38, fat: 44 });
    assert.deepEqual(r.food.servings, [
      { label: 'serving', grams: 30 },
      { label: 'whole pack', grams: 200 },
    ]);
    assert.deepEqual(r.food.micro, { fiber: 4, sugar: 2, satFat: 18, sodium: 900 });
  });

  test('per serving label → worked out per 100 g', () => {
    const r = foodFromWeb('8901063010246', { ...base, basis: 'serving', serving_g: 25, kcal: 120, protein: 2, carbs: 16, fat: 5.5, fiber: null, sugar: 8, sat_fat: 2.5, sodium_mg: 50 });
    assert.ok(r.found);
    assert.deepEqual(r.food.per100, { kcal: 480, protein: 8, carbs: 64, fat: 22 });
    assert.deepEqual(r.food.micro, { sugar: 32, satFat: 10, sodium: 200 });
  });

  test('per serving without a serving size → not found, name kept for the label form', () => {
    assert.deepEqual(foodFromWeb('1', { ...base, basis: 'serving', serving_g: null }), { found: false, name: 'Aloo Bhujia', brand: "Haldiram's" });
  });

  test('drinks per 100 ml are liquid', () => {
    const r = foodFromWeb('5449000000996', { ...base, name: 'Coca-Cola', brand: 'Coca-Cola', basis: '100ml', liquid: false, kcal: 44, protein: 0, carbs: 11, fat: 0, fiber: null, sugar: 11, sat_fat: 0, sodium_mg: 10, serving_g: null, pack_g: 750 });
    assert.ok(r.found);
    assert.equal(r.food.liquid, true);
  });

  test('numbers that don’t add up → not found', () => {
    assert.equal(foodFromWeb('1', { ...base, kcal: 100 }).found, false); // 11/38/44 g is ~590 kcal, not 100
    assert.equal(foodFromWeb('1', { ...base, protein: null }).found, false);
    assert.equal(foodFromWeb('1', { ...base, basis: 'unknown' }).found, false);
  });

  test('a part bigger than the whole is dropped', () => {
    const r = foodFromWeb('1', { ...base, sat_fat: 60, sugar: 50 });
    assert.ok(r.found);
    assert.equal(r.food.micro?.satFat, undefined);
    assert.equal(r.food.micro?.sugar, undefined);
    assert.equal(r.food.micro?.fiber, 4);
  });

  test('not found or nameless → not found', () => {
    assert.deepEqual(foodFromWeb('1', { ...base, found: false }), { found: false, name: 'Aloo Bhujia', brand: "Haldiram's" });
    assert.deepEqual(foodFromWeb('1', { ...base, name: '  ' }), { found: false, name: undefined, brand: "Haldiram's" });
  });

  test('strict tool schema: every field required, nothing extra', () => {
    assert.equal(WEB_PRODUCT_SCHEMA.additionalProperties, false);
    assert.deepEqual([...WEB_PRODUCT_SCHEMA.required].sort(), Object.keys(WEB_PRODUCT_SCHEMA.properties).sort());
    assert.deepEqual([...WEB_PRODUCT_SCHEMA.required].sort(), Object.keys(base).sort());
  });
});
