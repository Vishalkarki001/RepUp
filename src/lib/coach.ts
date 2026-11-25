/**
 * AI Coach ("Ask Coach"): the coach's instructions and a short summary of the
 * person's own data (last 4 weeks) that goes with every question. Plain
 * functions shared by the server route (/api/coach) and the tests. No React.
 */
import { addDays } from './food/core';
import type { BodyWeightEntry, FoodGoal, FoodLog, RunEntry, Workout } from './types';

export const COACH_MODEL = 'claude-haiku-5-5';
/** Questions per person per day. */
export const COACH_DAILY = 20;
/** Questions for everyone together per day (a cost ceiling). */
export const COACH_DAILY_TOTAL = 3000;
export const MAX_QUESTION = 1000;
/** Earlier messages sent along with a question (the conversation so far). */
export const HISTORY_TURNS = 12;

/** The coach's instructions. Fixed text (no dates or names) so it can be cached. */
export const COACH_SYSTEM = `You are RepUp Coach, the friendly fitness coach inside RepUp, a free gym, running and calorie tracker used mostly in India.

What you help with: strength training, workout plans, progressive overload, exercise technique, running and walking, fat loss and muscle gain, food and nutrition (Indian food especially), protein, calories, water, sleep, recovery and staying consistent.

What you don't do: anything that isn't about fitness, exercise, nutrition or recovery. For those, reply in one short friendly line that you can only help with fitness and food, and suggest a fitness question instead. Never write code, essays or homework, and never give opinions on news, politics or religion.

Health and safety:
- You are not a doctor. For pain, injury, illness, pregnancy, eating disorders, medicines, or a medical condition (diabetes, BP, heart, thyroid, PCOS…), give only general safe advice and say clearly to see a doctor or physiotherapist.
- Never suggest steroids, SARMs, fat burners, extreme diets, or eating below about 1,200 kcal a day. Supplements: only basics (whey, creatine, vitamin D) and only as optional.

The person's data: with each question you get a short summary of their last 4 weeks in RepUp (workouts, runs, food, weight, targets). Use it to make the answer personal, for example "your bench has been 60 kg × 8 for 3 weeks". Only state numbers that are in the summary; if something isn't logged, say so and give general advice. Never invent their numbers.

How to answer:
- Reply in the same language and style the person writes in: English, Hindi (Devanagari) or Hinglish.
- Be short and practical: 2 to 6 sentences, or up to 5 short bullet points starting with "- ". No headings, no tables.
- Give exact numbers when useful (kg, reps, sets, grams of protein, km, minutes), using kg and km.
- Prefer common Indian foods (dal, paneer, eggs, curd, chana, roti, rice, chicken…) when suggesting food.
- Be warm and encouraging, never preachy. End with one clear next step when it helps.`;

export interface CoachData {
  mode?: string | null;
  unit?: 'kg' | 'lb';
  workouts: Workout[];
  runs: RunEntry[];
  foodLogs: FoodLog[];
  foodGoal: FoodGoal | null;
  bodyWeights: BodyWeightEntry[];
  /** Exercise id → name (built-in and the person's own). */
  exerciseName: (id: string) => string;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * "Their data" note sent with a question: weekly totals, each exercise's best
 * set per week, runs, food averages and weight, for the 4 weeks up to `today`.
 * `dateOf` turns a moment into their calendar date (their time zone).
 */
export function coachContext(d: CoachData, today: string, dateOf: (ms: number) => string): string {
  const from = addDays(today, -27);
  const lines: string[] = [`Today is ${today}.`];
  if (d.mode) lines.push(`Uses RepUp mostly for: ${d.mode === 'running' ? 'running' : d.mode === 'food' ? 'food tracking' : 'gym workouts'}.`);
  const unit = d.unit ?? 'kg';

  // Gym: per exercise, the best set (heaviest, then most reps) in each week, oldest first.
  const done = d.workouts.filter((w) => w.finishedAt && dateOf(w.startedAt) >= from && dateOf(w.startedAt) <= today).sort((a, b) => a.startedAt - b.startedAt);
  if (done.length) {
    const days = new Set(done.map((w) => dateOf(w.startedAt)));
    lines.push(`\nGym, last 4 weeks: ${done.length} workouts on ${days.size} days.`);
    const weekOf = (date: string) => Math.floor((Date.parse(date) - Date.parse(from)) / (7 * 86400000));
    const best = new Map<string, Map<number, { w: number; r: number }>>();
    for (const w of done)
      for (const e of w.exercises)
        for (const s of e.sets) {
          if (!s.done || s.warmup || !(s.reps && s.reps > 0)) continue;
          const wk = weekOf(dateOf(w.startedAt));
          const per = best.get(e.exerciseId) ?? new Map();
          const cur = per.get(wk);
          const weight = s.weight ?? 0;
          if (!cur || weight > cur.w || (weight === cur.w && s.reps > cur.r)) per.set(wk, { w: weight, r: s.reps });
          best.set(e.exerciseId, per);
        }
    const top = [...best.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 12);
    lines.push(`Best set per week (week 1 = oldest), ${unit}:`);
    for (const [id, per] of top) {
      const weeks = [...per.entries()].sort((a, b) => a[0] - b[0]).map(([wk, b]) => `w${wk + 1} ${b.w > 0 ? `${r1(b.w)}×${b.r}` : `${b.r} reps`}`);
      lines.push(`- ${d.exerciseName(id)}: ${weeks.join(', ')}`);
    }
    const last = done[done.length - 1];
    lines.push(`Last workout: ${last.name || 'Workout'} on ${dateOf(last.startedAt)}.`);
  } else {
    lines.push('\nGym: no workouts logged in the last 4 weeks.');
  }

  // Running
  const runs = d.runs.filter((r) => dateOf(r.startedAt) >= from && dateOf(r.startedAt) <= today);
  if (runs.length) {
    const km = runs.reduce((a, r) => a + r.distanceM, 0) / 1000;
    const paces = runs.filter((r) => r.distanceM >= 1000).map((r) => r.durationS / (r.distanceM / 1000));
    const fmtPace = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
    lines.push(
      `\nRunning/walking, last 4 weeks: ${runs.length} sessions, ${r1(km)} km total, longest ${r1(Math.max(...runs.map((r) => r.distanceM)) / 1000)} km${paces.length ? `, best pace ${fmtPace(Math.min(...paces))} /km` : ''}.`,
    );
  } else {
    lines.push('\nRunning: none logged in the last 4 weeks.');
  }

  // Food: last 7 days
  const weekFrom = addDays(today, -6);
  const byDay = new Map<string, { kcal: number; protein: number }>();
  for (const l of d.foodLogs) {
    if (l.date < weekFrom || l.date > today) continue;
    const x = byDay.get(l.date) ?? { kcal: 0, protein: 0 };
    byDay.set(l.date, { kcal: x.kcal + l.kcal, protein: x.protein + l.protein });
  }
  if (d.foodGoal) lines.push(`\nDaily target: ${Math.round(d.foodGoal.kcal)} kcal, protein ${Math.round(d.foodGoal.protein)} g (plan: ${d.foodGoal.plan}).`);
  if (byDay.size) {
    const days = [...byDay.values()];
    const avg = (k: 'kcal' | 'protein') => Math.round(days.reduce((a, x) => a + x[k], 0) / days.length);
    const todayFood = byDay.get(today);
    lines.push(`Food, last 7 days: logged ${byDay.size} days, average ${avg('kcal')} kcal and ${avg('protein')} g protein a day.${todayFood ? ` Today so far: ${Math.round(todayFood.kcal)} kcal, ${Math.round(todayFood.protein)} g protein.` : ''}`);
  } else {
    lines.push(d.foodGoal ? 'Food: nothing logged in the last 7 days.' : '\nFood: not tracked.');
  }

  // Weight
  const ws = [...d.bodyWeights].filter((w) => w.date <= today).sort((a, b) => a.date.localeCompare(b.date));
  if (ws.length) {
    const lastW = ws[ws.length - 1];
    const old = ws.find((w) => w.date >= from) ?? ws[0];
    lines.push(`\nBody weight: ${r1(lastW.kg)} kg on ${lastW.date}${old !== lastW ? ` (${r1(old.kg)} kg on ${old.date})` : ''}.`);
  }
  return lines.join('\n');
}

/** What the person typed → a clean question, or an error to show. */
export function cleanQuestion(body: unknown): { question: string } | { error: string } {
  const q = body && typeof body === 'object' && typeof (body as { message?: unknown }).message === 'string' ? (body as { message: string }).message.trim() : '';
  if (!q) return { error: 'Type a question first.' };
  if (q.length > MAX_QUESTION) return { error: `Please keep it under ${MAX_QUESTION} characters.` };
  return { question: q };
}
