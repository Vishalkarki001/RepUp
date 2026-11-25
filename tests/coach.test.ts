/**
 * AI Coach: the summary of someone's data that goes with each question, and
 * what a question may be. (The model call itself is tested by hand.)
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { cleanQuestion, COACH_SYSTEM, coachContext, MAX_QUESTION, type CoachData } from '../src/lib/coach';
import type { FoodLog, RunEntry, Workout } from '../src/lib/types';

const day = (iso: string) => new Date(`${iso}T18:00:00Z`).getTime();
const dateOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const w = (date: string, ex: string, kg: number, reps: number): Workout => ({
  id: date + ex, name: 'Push', startedAt: day(date), finishedAt: day(date) + 3600_000,
  exercises: [{ id: 'e', exerciseId: ex, repMin: reps, repMax: reps, sets: [{ id: 's1', weight: kg, reps, done: true }, { id: 's2', weight: kg - 10, reps: reps + 2, done: true }] }],
});
const names: Record<string, string> = { 'bench-press': 'Bench Press', squat: 'Squat' };
const base: CoachData = { workouts: [], runs: [], foodLogs: [], foodGoal: null, bodyWeights: [], exerciseName: (id) => names[id] ?? 'Exercise' };

describe('coachContext', () => {
  test('nothing logged: says so plainly (so the coach doesn’t invent numbers)', () => {
    const c = coachContext(base, '2026-11-25', dateOf);
    assert.match(c, /Today is 2026-11-25/);
    assert.match(c, /Gym: no workouts logged/);
    assert.match(c, /Running: none logged/);
    assert.match(c, /Food: not tracked/);
  });

  test('gym: best set per week per exercise, oldest first; old workouts left out', () => {
    const d: CoachData = {
      ...base,
      mode: 'workout',
      workouts: [w('2026-10-01', 'bench-press', 50, 8), w('2026-11-02', 'bench-press', 60, 8), w('2026-11-09', 'bench-press', 60, 8), w('2026-11-23', 'bench-press', 62.5, 6), w('2026-11-23', 'squat', 80, 5)],
    };
    const c = coachContext(d, '2026-11-25', dateOf);
    assert.doesNotMatch(c, /Name:/); // their name isn't sent to the coach
    assert.match(c, /Gym, last 4 weeks: 4 workouts on 3 days/);
    assert.match(c, /- Bench Press: w1 60×8, w2 60×8, w4 62\.5×6/);
    assert.match(c, /- Squat: w4 80×5/);
    assert.doesNotMatch(c, /50×8/); // October is outside the 4 weeks
  });

  test('runs, food averages against the target, today so far, weight trend', () => {
    const run = (date: string, km: number, min: number): RunEntry => ({ id: date, kind: 'run', startedAt: day(date), finishedAt: day(date), durationS: min * 60, distanceM: km * 1000, steps: null, calories: 0, source: 'gps' });
    const food = (date: string, kcal: number, protein: number) => ({ date, kcal, protein }) as FoodLog;
    const c = coachContext(
      {
        ...base,
        runs: [run('2026-11-20', 5, 30), run('2026-11-22', 7.5, 45)],
        foodLogs: [food('2026-11-24', 2000, 100), food('2026-11-25', 800, 40), food('2026-11-10', 3000, 10)],
        foodGoal: { plan: 'lose', kcal: 2100, protein: 140, carbs: 230, fat: 65 },
        bodyWeights: [{ id: 'a', date: '2026-10-29', kg: 78 }, { id: 'b', date: '2026-11-24', kg: 76.8 }],
      },
      '2026-11-25',
      dateOf,
    );
    assert.match(c, /2 sessions, 12\.5 km total, longest 7\.5 km, best pace 6:00 \/km/);
    assert.match(c, /Daily target: 2100 kcal, protein 140 g \(plan: lose\)/);
    assert.match(c, /logged 2 days, average 1400 kcal and 70 g protein a day\. Today so far: 800 kcal, 40 g protein\./);
    assert.match(c, /Body weight: 76\.8 kg on 2026-11-24 \(78 kg on 2026-10-29\)/);
  });
});

describe('cleanQuestion', () => {
  test('trims, refuses empty and too long', () => {
    assert.deepEqual(cleanQuestion({ message: '  how much protein?  ' }), { question: 'how much protein?' });
    assert.ok('error' in cleanQuestion({ message: '   ' }));
    assert.ok('error' in cleanQuestion({ message: 'a'.repeat(MAX_QUESTION + 1) }));
    assert.ok('error' in cleanQuestion(null));
  });
});

test('the instructions stay fixed (no dates or names), so they can be cached', () => {
  assert.doesNotMatch(COACH_SYSTEM, /\b20\d\d-\d\d-\d\d\b/);
  assert.match(COACH_SYSTEM, /only help with fitness and food/);
  assert.match(COACH_SYSTEM, /see a doctor/);
});
