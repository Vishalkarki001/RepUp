import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_EXERCISES } from './data/defaults';
import { addDays } from './food/core';
import { localDayStartUtc, localNow } from './reminders';
import type { CoachData } from './coach';
import type { FoodLog, RunEntry, Workout } from './types';

/** The person's time zone (from their reminder settings), India by default. */
export async function userTz(db: SupabaseClient, userId: string): Promise<string> {
  const { data } = await db.from('reminder_prefs').select('tz').eq('user_id', userId).maybeSingle<{ tz: string }>();
  return data?.tz || 'Asia/Kolkata';
}

/** When the person's "today" began (their midnight), for the daily question limit. */
export const dayStartIso = (tz: string, now = new Date()) => localDayStartUtc(now, tz).toISOString();

/**
 * The person's last 4 weeks for the coach, read with the server key (the
 * caller has already checked who is signed in). Their name isn't sent: the
 * coach doesn't need it.
 */
export async function loadCoachData(db: SupabaseClient, userId: string, tz: string): Promise<{ data: CoachData; today: string; dateOf: (ms: number) => string }> {
  const now = new Date();
  const today = localNow(now, tz).date;
  const dateOf = (ms: number) => localNow(new Date(ms), tz).date;
  const since = new Date(now.getTime() - 30 * 86_400_000).toISOString();

  const [w, r, f, g, bw, s, ex] = await Promise.all([
    db.from('workouts').select('id,name,started_at,finished_at,exercises').eq('user_id', userId).eq('deleted', false).gte('started_at', since).limit(100),
    db.from('runs').select('id,kind,started_at,finished_at,duration_s,distance_m').eq('user_id', userId).eq('deleted', false).gte('started_at', since).limit(100),
    db.from('food_logs').select('date,kcal,protein').eq('user_id', userId).eq('deleted', false).gte('date', addDays(today, -7)).limit(500),
    db.from('food_goals').select('plan,kcal,protein,carbs,fat').eq('user_id', userId).eq('deleted', false).maybeSingle(),
    db.from('body_weights').select('date,kg').eq('user_id', userId).eq('deleted', false).gte('date', addDays(today, -60)).order('date', { ascending: false }).limit(20),
    db.from('user_settings').select('mode,unit').eq('user_id', userId).maybeSingle(),
    db.from('exercises').select('id,name').eq('user_id', userId).eq('deleted', false).limit(500),
  ]);

  const names = new Map<string, string>(DEFAULT_EXERCISES.map((e) => [e.id, e.name]));
  for (const e of ex.data ?? []) names.set(e.id as string, e.name as string);

  const data: CoachData = {
    mode: (s.data?.mode as string | null) ?? null,
    unit: s.data?.unit === 'lb' ? 'lb' : 'kg',
    workouts: (w.data ?? []).map((x) => ({
      id: x.id, name: x.name, exercises: Array.isArray(x.exercises) ? x.exercises : [],
      startedAt: Date.parse(x.started_at), finishedAt: x.finished_at ? Date.parse(x.finished_at) : undefined,
    })) as Workout[],
    runs: (r.data ?? []).map((x) => ({
      id: x.id, kind: x.kind, startedAt: Date.parse(x.started_at), finishedAt: Date.parse(x.finished_at),
      durationS: Number(x.duration_s), distanceM: Number(x.distance_m), steps: null, calories: 0, source: 'gps',
    })) as RunEntry[],
    foodLogs: (f.data ?? []).map((x) => ({ date: String(x.date).slice(0, 10), kcal: Number(x.kcal), protein: Number(x.protein) })) as FoodLog[],
    foodGoal: g.data ? { plan: g.data.plan, kcal: Number(g.data.kcal), protein: Number(g.data.protein), carbs: Number(g.data.carbs), fat: Number(g.data.fat) } : null,
    bodyWeights: (bw.data ?? []).map((x, i) => ({ id: String(i), date: String(x.date).slice(0, 10), kg: Number(x.kg) })),
    exerciseName: (id) => names.get(id) ?? 'Exercise',
  };
  return { data, today, dateOf };
}
