/**
 * Food rows must survive a trip to the database unchanged: what the app builds
 * (rowsFromState) and what it reads back (normalizeRemote, given rows shaped the
 * way Supabase returns them) have to match exactly, or the app would re-send the
 * same rows forever. Also: values outside the database's limits are clamped.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { __syncInternals as S } from '../src/lib/sync';
import { actions, getState } from '../src/lib/store';
import type { FoodLog } from '../src/lib/types';

const UID = '00000000-0000-0000-0000-0000000000a1';
const log = (x: Partial<FoodLog> = {}): FoodLog => ({
  id: 'f1', date: '2026-11-13', meal: 'lunch', foodId: 'local:roti-chapati-plain', name: 'Roti / chapati (plain)',
  amount: 1.5, unit: 'roti', grams: 60, kcal: 158, protein: 5.2, carbs: 30.6, fat: 1.5, source: 'local', loggedAt: Date.UTC(2026, 10, 13, 8, 30, 0, 123), ...x,
});

/** What PostgREST sends back for a row: numbers as JSON numbers, dates as text, timestamps with +00:00. */
function asDatabase(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...row, updated_at: '2026-11-13T08:30:01.5+00:00' };
  if (typeof out.logged_at === 'string') out.logged_at = (out.logged_at as string).replace('Z', '+00:00');
  return out;
}

describe('food sync round trip', () => {
  test('food log, goal and water come back identical', () => {
    actions.resetAll();
    actions.addFoodLog(log());
    actions.addFoodLog(log({ id: 'f2', meal: 'snacks', foodId: 'quick:x', name: 'Quick add', amount: 1, unit: 'serving', grams: 0, kcal: 350, protein: 0, carbs: 0, fat: 0, source: 'quick' }));
    actions.addFoodLog(log({ id: 'f3', foodId: 'off:8901262010016', name: 'Amul Pasteurized Butter · Amul', amount: 10, unit: 'g', grams: 10, kcal: 72, protein: 0.1, carbs: 0, fat: 8, source: 'off' }));
    actions.setFoodGoal({ plan: 'lose', kcal: 1780, protein: 144, carbs: 191, fat: 49, profile: { sex: 'male', age: 28, heightCm: 172, weightKg: 72, activity: 'light' } });
    actions.setWater('2026-11-13', 6);
    const rows = S.rowsFromState(getState(), UID);
    for (const t of ['food_logs', 'food_goals', 'water_days'] as const) {
      assert.ok(rows[t].size > 0, t);
      for (const row of rows[t].values()) {
        // Postgres jsonb reorders keys: shuffle the profile's keys to be sure that doesn't matter.
        const db = asDatabase(row);
        if (db.profile) db.profile = Object.fromEntries(Object.entries(db.profile as object).reverse());
        assert.equal(S.fingerprint(S.normalizeRemote(t, db)), S.fingerprint(row), `${t} changed on the way back`);
      }
    }
  });

  test('pulling them on a new phone rebuilds the same diary', () => {
    const before = getState();
    const rows = S.rowsFromState(before, UID);
    const remote = Object.fromEntries(S.TABLES.map((t) => [t, [...rows[t].values()].map(asDatabase)]));
    const dirty = Object.fromEntries(S.TABLES.map((t) => [t, new Set<string>()]));
    actions.resetAll();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fresh = S.applyRemote(getState(), remote as any, dirty as any, false);
    assert.deepEqual(fresh.foodLogs, before.foodLogs);
    assert.deepEqual(fresh.foodGoal, before.foodGoal);
    assert.deepEqual(fresh.water, before.water);
  });

  test('a deleted goal / water day / log on another phone is removed here', () => {
    actions.resetAll();
    actions.addFoodLog(log());
    actions.setFoodGoal({ plan: 'custom', kcal: 2000, protein: 120, carbs: 230, fat: 60 });
    actions.setWater('2026-11-13', 3);
    const rows = S.rowsFromState(getState(), UID);
    const gone = (t: string) => [...rows[t as 'food_logs'].values()].map((r) => ({ ...asDatabase(r), deleted: true }));
    const remote = Object.fromEntries(S.TABLES.map((t) => [t, ['food_logs', 'food_goals', 'water_days'].includes(t) ? gone(t) : []]));
    const dirty = Object.fromEntries(S.TABLES.map((t) => [t, new Set<string>()]));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next = S.applyRemote(getState(), remote as any, dirty as any, false);
    assert.equal(next.foodLogs.length, 0);
    assert.equal(next.foodGoal, null);
    assert.deepEqual(next.water, {});
  });

  test('values the database would refuse are clamped, so one bad row can’t block syncing', () => {
    actions.resetAll();
    actions.addFoodLog(log({ amount: 0.004, unit: 'x'.repeat(60), name: '  ', kcal: 99999 }));
    actions.setFoodGoal({ plan: 'custom', kcal: 300, protein: 5000, carbs: 10, fat: 10 });
    const rows = S.rowsFromState(getState(), UID);
    const r = rows.food_logs.get('f1')!;
    assert.equal(r.amount, 0.01);
    assert.equal((r.unit as string).length, 40);
    assert.equal(r.name, 'Food');
    assert.equal(r.kcal, 20000);
    const g = rows.food_goals.get(UID)!;
    assert.equal(g.kcal, 500);
    assert.equal(g.protein, 1000);
  });
});
