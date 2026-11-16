/** Public "Calories in …" pages and the site lists: data the pages are built from. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { amountFor, CATEGORIES, FOOD_PAGES, foodPage, mainServing, relatedPages, servingLabel } from '../src/lib/food/pages';
import { FOODS } from '../src/lib/food/foods';
import { LANDING_PAGES, MARKETING_PATHS, MARKETING_PREFIXES, PAGE_GROUPS } from '../src/lib/site';

test('one page per food, unique URLs', () => {
  assert.equal(FOOD_PAGES.length, FOODS.length);
  assert.equal(new Set(FOOD_PAGES.map((p) => p.slug)).size, FOOD_PAGES.length);
  for (const p of FOOD_PAGES) assert.match(p.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, p.slug);
});

test('every food is in a group, and every group has foods', () => {
  for (const c of CATEGORIES) assert.ok(FOOD_PAGES.some((p) => p.category === c), c);
  assert.equal(foodPage('banana')?.category, 'Fruits');
  assert.equal(foodPage('roti-chapati-plain')?.category, 'Roti, rice and breakfast');
  assert.equal(foodPage('cola-soft-drink')?.category, 'Drinks');
});

test('page numbers: 1 roti = 106 kcal, per 100 g = 264 kcal', () => {
  const p = foodPage('roti-chapati-plain')!;
  const s = mainServing(p);
  assert.equal(servingLabel(s), '1 roti (40 g)');
  assert.equal(amountFor(p, s.grams).kcal, 106);
  assert.equal(amountFor(p, 100).kcal, 264);
});

test('labels for drinks and counted servings', () => {
  assert.equal(servingLabel(mainServing(foodPage('milk-toned')!), true), '1 glass (250 ml)');
  assert.equal(servingLabel(mainServing(foodPage('almonds')!)), '10 almonds (12 g)');
});

test('similar foods come from the same group', () => {
  const p = foodPage('paneer')!;
  const r = relatedPages(p);
  assert.ok(r.length > 0 && r.every((x) => x.category === p.category && x.slug !== p.slug));
});

test('aliases on pages are Latin script only (page text is English)', () => {
  for (const p of FOOD_PAGES) for (const a of p.aliases) assert.match(a, /^[\x20-\x7e]+$/, `${p.name}: ${a}`);
});

test('site lists: food pages are public and in the footer', () => {
  assert.ok(PAGE_GROUPS.some((g) => g.id === 'food'));
  for (const path of ['/calorie-counter-app', '/calorie-calculator', '/calories']) {
    assert.ok(LANDING_PAGES.some((p) => p.path === path && p.group === 'food'), path);
    assert.ok(MARKETING_PATHS.includes(path), path);
  }
  assert.ok(MARKETING_PREFIXES.some((x) => '/calories/roti-chapati-plain'.startsWith(x)));
});
