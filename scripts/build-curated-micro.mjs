/**
 * Builds src/lib/food/curated-micro.json: other nutrients (fibre, minerals, vitamins) per 100 g
 * for RepUp's hand-checked food list (src/lib/food/foods.ts), which only has kcal + macros.
 *
 *  - raw / basic foods: USDA FoodData Central SR Legacy (lab data), by exact description
 *    from scripts/curated-usda.json;
 *  - home-cooked dishes: the closest recipe in the Indian Nutrient Databank (src/lib/food/indb.json),
 *    by exact name from scripts/curated-indb.json. Recipes differ in how thick / rich they are
 *    (INDB dal ≈ 50–60 kcal per 100 g, RepUp's ≈ 100–125), so the nutrients are scaled by
 *    our kcal ÷ the recipe's kcal; matches more than 2.5× apart are skipped.
 * Foods with no good match get nothing (the app shows "–" rather than a wrong number).
 *
 * Usage: USDA_API_KEY=… node scripts/build-curated-micro.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const KEY = process.env.USDA_API_KEY;
if (!KEY) throw new Error('Set USDA_API_KEY');
const usdaMap = JSON.parse(readFileSync('scripts/curated-usda.json', 'utf8'));
const indbMap = JSON.parse(readFileSync('scripts/curated-indb.json', 'utf8'));
const indb = JSON.parse(readFileSync('src/lib/food/indb.json', 'utf8'));
// kcal and fat of each of our foods, read from foods.ts rows: ['Name', 'aliases', kcal, protein, carbs, fat, …]
const ours = Object.fromEntries(
  [...readFileSync('src/lib/food/foods.ts', 'utf8').matchAll(/^\s*\['((?:[^'\\]|\\.)+)', '[^']*', ([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+),/gm)].map((m) => [
    m[1],
    { kcal: Number(m[2]), fat: Number(m[5]) },
  ]),
);
const ourKcal = Object.fromEntries(Object.entries(ours).map(([k, v]) => [k, v.kcal]));
/**
 * Saturated fat follows the fat, not the calories (a roti recipe with ghee, US milk at 3.25 %
 * vs Indian full cream at 6 %): scale it by our fat ÷ the source's fat, never above our fat.
 */
function fixSatFat(name, micro, sourceFat) {
  if (micro.satFat === undefined) return micro;
  const fat = ours[name].fat;
  const sat = sourceFat > 0 ? (micro.satFat * fat) / sourceFat : 0;
  return { ...micro, satFat: round(Math.min(sat, fat)) };
}

// Same nutrient numbers / units as src/lib/food/server.ts
const IDS = [
  ['fiber', 1079, 'G'], ['sugar', 2000, 'G'], ['satFat', 1258, 'G'], ['cholesterol', 1253, 'MG'],
  ['sodium', 1093, 'MG'], ['potassium', 1092, 'MG'], ['calcium', 1087, 'MG'], ['iron', 1089, 'MG'],
  ['magnesium', 1090, 'MG'], ['zinc', 1095, 'MG'], ['vitaminA', 1106, 'UG'], ['vitaminC', 1162, 'MG'], ['folate', 1177, 'UG'],
];
const round = (v) => Math.round(v * 100) / 100;

async function usda(description) {
  const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `"${description}"`, dataType: ['SR Legacy'], pageSize: 10 }),
  });
  if (!res.ok) throw new Error(`USDA ${res.status} for ${description}`);
  const foods = (await res.json()).foods ?? [];
  const hit = foods.find((f) => f.description.toLowerCase() === description.toLowerCase());
  if (!hit) return { error: `no exact match (top: ${foods[0]?.description ?? 'none'})` };
  const fat = hit.foodNutrients.find((x) => x.nutrientId === 1004)?.value ?? 0;
  const micro = {};
  for (const [key, id, unit] of IDS) {
    const n = hit.foodNutrients.find((x) => x.nutrientId === id && x.unitName?.toUpperCase() === unit);
    if (n && Number.isFinite(n.value) && n.value >= 0) micro[key] = round(n.value);
  }
  return { src: `usda:${hit.fdcId} ${hit.description}`, micro, fat };
}

const out = {};
const problems = [];
for (const [name, description] of Object.entries(usdaMap)) {
  if (!ourKcal[name]) problems.push(`${name}: not in foods.ts`);
  const r = await usda(description);
  if (r.error) problems.push(`${name}: ${r.error}`);
  else if (ours[name]) out[name] = { src: r.src, micro: fixSatFat(name, r.micro, r.fat) };
}
for (const [name, recipe] of Object.entries(indbMap)) {
  const row = indb.find((r) => r[0] === recipe);
  if (!row) problems.push(`${name}: INDB recipe not found: ${recipe}`);
  else if (!row[7] || !Object.keys(row[7]).length) problems.push(`${name}: INDB recipe has no nutrients: ${recipe}`);
  else if (!ourKcal[name]) problems.push(`${name}: not in foods.ts`);
  else {
    const factor = ourKcal[name] / row[1];
    if (factor < 0.4 || factor > 2.5) problems.push(`${name}: ${ourKcal[name]} vs ${row[1]} kcal, too different: skipped`);
    else {
      const scaled = Object.fromEntries(Object.entries(row[7]).map(([k, v]) => [k, round(v * factor)]));
      out[name] = { src: `indb: ${recipe} ×${factor.toFixed(2)}`, micro: fixSatFat(name, { ...scaled, satFat: row[7].satFat }, row[4]) };
    }
  }
}
writeFileSync('src/lib/food/curated-micro.json', JSON.stringify(out, null, 0));
console.log(`${Object.keys(out).length} foods with nutrients → src/lib/food/curated-micro.json`);
if (problems.length) console.log('PROBLEMS:\n' + problems.join('\n'));
