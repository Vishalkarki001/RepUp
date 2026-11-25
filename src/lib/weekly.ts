/**
 * The weekly report ("Your week"): a person's Monday–Sunday in numbers, for
 * gym, running, food and weight. Plain functions shared by the app (the report
 * sheet), the server (Sunday 7 pm notification) and the tests. Only the parts
 * someone actually used show up.
 */
import { addDays } from './food/core';
import type { BodyWeightEntry, FoodGoal, FoodLog, PersonalRecord, RunEntry, Workout } from './types';

// Small copies of helpers from utils.ts: this file also runs on the server
// (the Sunday notification), and utils.ts holds React hooks.
const est1RM = (weight: number, reps: number) => (reps <= 0 || weight <= 0 ? 0 : reps === 1 ? weight : weight * (1 + reps / 30));
const workoutSetCount = (w: Workout) => w.exercises.reduce((n, e) => n + e.sets.filter((x) => x.done).length, 0);
const workoutVolume = (w: Workout) => w.exercises.reduce((n, e) => n + e.sets.reduce((a, x) => a + (x.done ? (x.weight ?? 0) * (x.reps ?? 0) : 0), 0), 0);

/** Local calendar date of a moment, "2026-11-23". */
export function localDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Monday of the week a date is in. */
export function mondayOf(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const wd = new Date(y, m - 1, d).getDay(); // 0 = Sunday
  return addDays(date, wd === 0 ? -6 : 1 - wd);
}

/**
 * Which week to show: from Sunday 6 pm the week that's ending, before that the
 * last full week (so on a Monday you see the week you just finished).
 */
export function reportWeekStart(now: Date): string {
  const today = localDate(now.getTime());
  const sundayEvening = now.getDay() === 0 && now.getHours() >= 18;
  return sundayEvening ? mondayOf(today) : addDays(mondayOf(today), -7);
}

/** "17 – 23 November" / "28 Nov – 4 Dec". */
export function weekLabel(start: string): string {
  const end = addDays(start, 6);
  const [ys, ms, ds] = start.split('-').map(Number);
  const [ye, me, de] = end.split('-').map(Number);
  const month = (y: number, m: number, short: boolean) => new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: short ? 'short' : 'long' });
  return ms === me ? `${ds} – ${de} ${month(ye, me, false)}` : `${ds} ${month(ys, ms, true)} – ${de} ${month(ye, me, true)}`;
}

export interface WeekReport {
  start: string;
  end: string;
  gym: { days: number; workouts: number; sets: number; volume: number; bests: PersonalRecord[]; lastWeekDays: number } | null;
  run: { runs: number; km: number; seconds: number; bestPace: number | null; longestKm: number; lastWeekKm: number } | null;
  food: { daysLogged: number; avgKcal: number; targetKcal: number | null; avgProtein: number; targetProtein: number | null; proteinDays: number } | null;
  weight: { from: number | null; to: number } | null;
  empty: boolean;
}

export interface WeekData {
  workouts: Workout[];
  runs: RunEntry[];
  foodLogs: FoodLog[];
  foodGoal: FoodGoal | null;
  bodyWeights: BodyWeightEntry[];
}

const inWeek = (date: string, start: string, end: string) => date >= start && date <= end;

/** Personal bests set during the week, against everything before it (same rule as the workout summary). */
function weekBests(all: Workout[], week: Workout[], start: string, dateOf: (ms: number) => string): PersonalRecord[] {
  const before = all.filter((w) => dateOf(w.startedAt) < start);
  const best = new Map<string, { e1rm: number; reps: number }>();
  for (const w of before)
    for (const e of w.exercises)
      for (const s of e.sets) {
        if (!s.done || s.warmup) continue;
        const cur = best.get(e.exerciseId) ?? { e1rm: 0, reps: 0 };
        best.set(e.exerciseId, { e1rm: Math.max(cur.e1rm, est1RM(s.weight ?? 0, s.reps ?? 0)), reps: Math.max(cur.reps, s.reps ?? 0) });
      }
  const out = new Map<string, PersonalRecord & { score: number }>();
  for (const w of [...week].sort((a, b) => a.startedAt - b.startedAt))
    for (const e of w.exercises) {
      const prev = best.get(e.exerciseId);
      if (!prev) continue; // first time doing it isn't a "best"
      for (const s of e.sets) {
        if (!s.done || s.warmup || !(s.reps && s.reps > 0)) continue;
        const weight = s.weight ?? 0;
        const score = weight > 0 ? est1RM(weight, s.reps) : s.reps;
        const beats = weight > 0 ? score > prev.e1rm + 0.01 : prev.e1rm === 0 && s.reps > prev.reps;
        if (beats && score > (out.get(e.exerciseId)?.score ?? 0)) out.set(e.exerciseId, { exerciseId: e.exerciseId, weight, reps: s.reps, score });
      }
    }
  return [...out.values()].sort((a, b) => b.score - a.score).map(({ exerciseId, weight, reps }) => ({ exerciseId, weight, reps }));
}

/**
 * `dateOf` turns a moment into the person's calendar date: the phone's own
 * clock by default; the server passes one for the person's time zone.
 */
export function weekReport(d: WeekData, start: string, dateOf: (ms: number) => string = localDate): WeekReport {
  const end = addDays(start, 6);
  const lastStart = addDays(start, -7);
  const lastEnd = addDays(start, -1);
  const done = d.workouts.filter((w) => w.finishedAt);

  const gymWeek = done.filter((w) => inWeek(dateOf(w.startedAt), start, end));
  const gymDays = new Set(gymWeek.map((w) => dateOf(w.startedAt))).size;
  const gym = gymWeek.length
    ? {
        days: gymDays,
        workouts: gymWeek.length,
        sets: gymWeek.reduce((a, w) => a + workoutSetCount(w), 0),
        volume: gymWeek.reduce((a, w) => a + workoutVolume(w), 0),
        bests: weekBests(done, gymWeek, start, dateOf),
        lastWeekDays: new Set(done.filter((w) => inWeek(dateOf(w.startedAt), lastStart, lastEnd)).map((w) => dateOf(w.startedAt))).size,
      }
    : null;

  const runsWeek = d.runs.filter((r) => inWeek(dateOf(r.startedAt), start, end));
  const paces = runsWeek.filter((r) => r.distanceM >= 1000 && r.durationS > 0).map((r) => r.durationS / (r.distanceM / 1000));
  const run = runsWeek.length
    ? {
        runs: runsWeek.length,
        km: runsWeek.reduce((a, r) => a + r.distanceM, 0) / 1000,
        seconds: runsWeek.reduce((a, r) => a + r.durationS, 0),
        bestPace: paces.length ? Math.min(...paces) : null,
        longestKm: Math.max(...runsWeek.map((r) => r.distanceM)) / 1000,
        lastWeekKm: d.runs.filter((r) => inWeek(dateOf(r.startedAt), lastStart, lastEnd)).reduce((a, r) => a + r.distanceM, 0) / 1000,
      }
    : null;

  const foodWeek = d.foodLogs.filter((l) => inWeek(l.date, start, end));
  const byDay = new Map<string, { kcal: number; protein: number }>();
  for (const l of foodWeek) {
    const x = byDay.get(l.date) ?? { kcal: 0, protein: 0 };
    byDay.set(l.date, { kcal: x.kcal + l.kcal, protein: x.protein + l.protein });
  }
  const days = [...byDay.values()];
  const targetProtein = d.foodGoal?.protein ?? null;
  const food = days.length
    ? {
        daysLogged: days.length,
        avgKcal: Math.round(days.reduce((a, x) => a + x.kcal, 0) / days.length),
        targetKcal: d.foodGoal?.kcal ?? null,
        avgProtein: Math.round(days.reduce((a, x) => a + x.protein, 0) / days.length),
        targetProtein,
        proteinDays: targetProtein ? days.filter((x) => x.protein >= targetProtein * 0.9).length : 0,
      }
    : null;

  // Weight: the last weigh-in of the week, against the last one before it.
  const sorted = [...d.bodyWeights].sort((a, b) => a.date.localeCompare(b.date));
  const inside = sorted.filter((w) => inWeek(w.date, start, end));
  const before = sorted.filter((w) => w.date < start);
  const weight = inside.length ? { from: before.length ? before[before.length - 1].kg : inside.length > 1 ? inside[0].kg : null, to: inside[inside.length - 1].kg } : null;

  return { start, end, gym, run, food, weight, empty: !gym && !run && !food && !weight };
}

/** One line for the notification and the banner: "4 gym days · 12.4 km run · food logged 5 of 7 days". */
export function weekSummaryLine(r: WeekReport): string {
  const parts: string[] = [];
  if (r.gym) parts.push(`${r.gym.days} gym ${r.gym.days === 1 ? 'day' : 'days'}`);
  if (r.run) parts.push(`${r.run.km.toFixed(1)} km ${r.run.runs === 1 ? 'run' : 'in ' + r.run.runs + ' runs'}`);
  if (r.food) parts.push(`food logged ${r.food.daysLogged} of 7 days`);
  if (r.weight && r.weight.from !== null) {
    const ch = Math.round((r.weight.to - r.weight.from) * 10) / 10;
    parts.push(ch === 0 ? 'weight steady' : `weight ${ch > 0 ? '+' : '−'}${Math.abs(ch)} kg`);
  }
  if (r.gym?.bests.length) parts.push(`${r.gym.bests.length} new ${r.gym.bests.length === 1 ? 'best' : 'bests'} 🏆`);
  return parts.join(' · ');
}
