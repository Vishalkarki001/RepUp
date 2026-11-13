"""
Builds src/lib/food/indb.json from the Indian Nutrient Databank (INDB, 2024):
https://github.com/lindsayjaacks/Indian-Nutrient-Databank-INDB-  (INDB.xlsx)
Paper: Current Developments in Nutrition 2024, doi:10.1016/j.cdnut.2024.103790

Usage:  python3 scripts/build-indb.py path/to/INDB.xlsx

Only believable rows are kept:
  - kcal must match 4*protein + 4*carbs + 9*fat (within 20 %, as in core.ts believable());
  - deep-fried recipes where the book counts all the frying oil (fat > 72 % of kcal,
    e.g. poori 738 kcal/100 g) are dropped: RepUp's own list has realistic values for those;
  - spice mixes / powders / pastes / stocks are dropped (not eaten as a food).
Row: [name, kcal, protein, carbs, fat, serving label, serving grams]
"""
import json, re, sys
import openpyxl

src = sys.argv[1]
out = 'src/lib/food/indb.json'
wb = openpyxl.load_workbook(src, read_only=True, data_only=True)
rows = list(wb.worksheets[0].iter_rows(values_only=True))
h = {k: i for i, k in enumerate(rows[0])}
SKIP = re.compile(r'\b(powder|masala mix|spice blend|paste|stock|essence|phoran|garam masala|dough|batter|syrup for|tempering)\b', re.I)
FATTY_OK = re.compile(r'\b(ghee|butter|oil|nut|nuts|almond|cashew|peanut|walnut|coconut|seed|seeds|chocolate|mayonnaise|cream)\b', re.I)

kept, dropped = [], {'macros': 0, 'fried': 0, 'skip': 0}
for r in rows[1:]:
    name = re.sub(r'\s+', ' ', str(r[h['food_name']] or '')).strip()
    if not name:
        continue
    k, c, p, f = (float(r[h[x]] or 0) for x in ('energy_kcal', 'carb_g', 'protein_g', 'fat_g'))
    # check the values exactly as the app will store them
    k, c, p, f = round(k), round(c, 1), round(p, 1), round(f, 1)
    if SKIP.search(name):
        dropped['skip'] += 1
        continue
    m = 4 * p + 4 * c + 9 * f
    if k <= 0 or k > 902 or p + c + f > 101 or abs(m - k) > max(20, k * 0.2):
        dropped['macros'] += 1
        continue
    if k > 150 and f * 9 / k > 0.72 and not FATTY_OK.search(name):
        dropped['fried'] += 1
        continue
    unit = (r[h['servings_unit']] or '').strip().lower()
    uk = r[h['unit_serving_energy_kcal']]
    grams = round(float(uk) / k * 100) if uk and k else 0
    if not unit or not (5 <= grams <= 1000):
        unit, grams = '', 0
    kept.append([name[0].upper() + name[1:], round(k), round(p, 1), round(c, 1), round(f, 1), unit, grams])

kept.sort(key=lambda x: x[0].lower())
with open(out, 'w') as fh:
    json.dump(kept, fh, ensure_ascii=False, separators=(',', ':'))
print(f'kept {len(kept)}  dropped {dropped}  -> {out}')
