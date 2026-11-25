/**
 * The weekly report: which week, what counts, personal bests against earlier
 * weeks, the one-line summary and the share picture.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { FoodLog, RunEntry, Workout } from '../src/lib/types';
import { mondayOf, reportWeekStart, weekLabel, weekReport, weekSummaryLine, type WeekData } from '../src/lib/weekly';
import { cardForWeek } from '../src/lib/weeklyCard';

const at = (iso: string) => new Date(iso).getTime();
let n = 0;
const set = (weight: number, reps: number, done = true) => ({ id: `s${++n}`, weight, reps, done });
const workout = (iso: string, sets: [string, number, number][]): Workout => ({
  id: `w${++n}`,
  name: 'Push',
  startedAt: at(iso),
  finishedAt: at(iso) + 3600_000,
  exercises: sets.map(([ex, w, r]) => ({ id: `e${++n}`, exerciseId: ex, repMin: r, repMax: r, sets: [set(w, r), set(w, r)] })),
});
const run = (iso: string, km: number, min: number): RunEntry => ({
  id: `r${++n}`, kind: 'run', startedAt: at(iso), finishedAt: at(iso) + min * 60_000, durationS: min * 60, distanceM: km * 1000, steps: null, calories: 0, source: 'gps',
});
const food = (date: string, kcal: number, protein: number): FoodLog =>
  ({ id: `f${++n}`, date, meal: 'lunch', foodId: 'x', name: 'Dal', amount: 1, unit: 'katori', grams: 150, kcal, protein, carbs: 0, fat: 0, source: 'local', loggedAt: 0 }) as FoodLog;

const empty: WeekData = { workouts: [], runs: [], foodLogs: [], foodGoal: null, bodyWeights: [] };
const WEEK = '2026-11-16'; // Monday 16 – Sunday 22 Nov 2026

describe('which week', () => {
  test('Monday of any day', () => {
    assert.equal(mondayOf('2026-11-22'), '2026-11-16'); // Sunday
    assert.equal(mondayOf('2026-11-16'), '2026-11-16');
    assert.equal(mondayOf('2026-11-19'), '2026-11-16');
  });
  test('Sunday evening → this week; before that → last full week', () => {
    assert.equal(reportWeekStart(new Date(2026, 10, 22, 19, 0)), '2026-11-16');
    assert.equal(reportWeekStart(new Date(2026, 10, 22, 10, 0)), '2026-11-09');
    assert.equal(reportWeekStart(new Date(2026, 10, 23, 9, 0)), '2026-11-16'); // Monday morning
  });
  test('labels', () => {
    assert.equal(weekLabel('2026-11-16'), '16 – 22 November');
    assert.equal(weekLabel('2026-11-30'), '30 Nov – 6 Dec');
  });
});

describe('weekReport', () => {
  test('nothing logged → empty, nothing to say', () => {
    const r = weekReport(empty, WEEK);
    assert.equal(r.empty, true);
    assert.equal(weekSummaryLine(r), '');
  });

  test('gym: days (two on one day count once), sets, last week, and bests beat earlier weeks only', () => {
    const d: WeekData = {
      ...empty,
      workouts: [
        workout('2026-11-09T18:00:00', [['bench-press', 60, 8]]), // last week
        workout('2026-11-17T18:00:00', [['bench-press', 62.5, 8], ['squat', 80, 5]]), // squat: first time, not a "best"
        workout('2026-11-17T20:00:00', [['bench-press', 60, 5]]),
        workout('2026-11-20T18:00:00', [['bench-press', 60, 8]]),
        { ...workout('2026-11-21T18:00:00', [['bench-press', 100, 1]]), finishedAt: undefined }, // still going: ignored
      ],
    };
    const r = weekReport(d, WEEK);
    assert.equal(r.gym?.days, 2);
    assert.equal(r.gym?.workouts, 3);
    assert.equal(r.gym?.sets, 8);
    assert.equal(r.gym?.lastWeekDays, 1);
    assert.deepEqual(r.gym?.bests, [{ exerciseId: 'bench-press', weight: 62.5, reps: 8 }]);
    assert.equal(r.run, null);
    assert.equal(weekSummaryLine(r), '2 gym days · 1 new best 🏆');
  });

  test('running, food against the target, and weight change', () => {
    const d: WeekData = {
      ...empty,
      runs: [run('2026-11-10T06:30:00', 4, 25), run('2026-11-17T06:30:00', 5, 30), run('2026-11-19T06:30:00', 7.4, 42), run('2026-11-21T06:30:00', 0.5, 4)],
      foodLogs: [food('2026-11-16', 1800, 130), food('2026-11-17', 2000, 80), food('2026-11-17', 300, 40), food('2026-11-15', 2500, 200)],
      foodGoal: { plan: 'custom', kcal: 2100, protein: 140, carbs: 230, fat: 65 },
      bodyWeights: [
        { id: 'a', date: '2026-11-09', kg: 77 },
        { id: 'b', date: '2026-11-18', kg: 76.8 },
        { id: 'c', date: '2026-11-22', kg: 76.6 },
      ],
    };
    const r = weekReport(d, WEEK);
    assert.equal(r.run?.runs, 3);
    assert.equal(r.run?.km, 12.9);
    assert.equal(r.run?.longestKm, 7.4);
    assert.equal(Math.round(r.run!.bestPace!), 341); // 42 min / 7.4 km (the 0.5 km jog doesn't count for pace)
    assert.equal(r.run?.lastWeekKm, 4);
    assert.deepEqual(r.food, { daysLogged: 2, avgKcal: 2050, targetKcal: 2100, avgProtein: 125, targetProtein: 140, proteinDays: 1 });
    assert.deepEqual(r.weight, { from: 77, to: 76.6 });
    assert.equal(weekSummaryLine(r), '12.9 km in 3 runs · food logged 2 of 7 days · weight −0.4 kg');
  });

  test('the server can pass its own time zone for dates', () => {
    // 23:30 Sunday in India is 18:00 UTC: with India dates it's in the week, with UTC dates too; 01:00 Monday India is still Sunday in UTC.
    const d: WeekData = { ...empty, runs: [run('2026-11-22T19:45:00.000Z', 5, 30)] };
    const india = (ms: number) => new Date(ms + 330 * 60000).toISOString().slice(0, 10);
    assert.equal(weekReport(d, WEEK, india).run, null); // 01:15 Monday 23 Nov in India: next week
    assert.equal(weekReport(d, WEEK, (ms) => new Date(ms).toISOString().slice(0, 10)).run?.runs, 1);
  });
});

describe('share picture', () => {
  test('three numbers from what was used, bests first', () => {
    const d: WeekData = {
      ...empty,
      workouts: [workout('2026-11-09T18:00:00', [['bench-press', 60, 8]]), workout('2026-11-18T18:00:00', [['bench-press', 65, 6]])],
      runs: [run('2026-11-19T06:30:00', 5, 30)],
    };
    const c = cardForWeek(weekReport(d, WEEK), () => 'Bench Press');
    assert.equal(c.title, 'My week');
    assert.equal(c.kicker, '16 – 22 November');
    assert.deepEqual(c.stats.map((x) => x.label), ['gym day', 'km run', 'sets']);
    assert.deepEqual(c.lines?.[0], { name: 'Bench Press', value: '65 kg × 6', best: true });
    assert.equal(c.bestsNote, '1 new personal best');
  });
});
