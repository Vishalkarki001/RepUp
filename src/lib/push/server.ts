import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { DEFAULT_EXERCISES } from '../data/defaults';
import {
  anyOn,
  cleanPrefs,
  dueReminders,
  localDayStartUtc,
  localNow,
  reminderMessage,
  WATER_GOAL,
  type PushMessage,
  type ReminderContext,
  type ReminderKind,
} from '../reminders';
import { CONTACT_EMAIL } from '../site';
import { adminDb } from '../supabase/admin';
import type { FoodLog, RunEntry, Workout } from '../types';
import { mondayOf, weekReport, weekSummaryLine } from '../weekly';
import { addDays } from '../food/core';

/**
 * Sending reminders (Route Handlers only). The keys are server secrets:
 * VAPID_PRIVATE_KEY signs every notification, NEXT_PUBLIC_VAPID_PUBLIC_KEY is
 * the matching public half the browser subscribes with.
 */

let vapidSet = false;
export function pushReady(): boolean {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  if (!vapidSet) {
    webpush.setVapidDetails(`mailto:${CONTACT_EMAIL}`, pub, priv);
    vapidSet = true;
  }
  return true;
}

interface Sub {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/** Send one notification to every browser of a person. Gone browsers are removed. Returns how many got it. */
export async function sendToUser(db: SupabaseClient, userId: string, msg: PushMessage): Promise<number> {
  const { data } = await db.from('push_subscriptions').select('endpoint,p256dh,auth').eq('user_id', userId);
  const subs = (data ?? []) as Sub[];
  const payload = JSON.stringify({ ...msg, icon: '/icon-192.png?v=3', badge: '/badge-96.png', ts: Date.now() });
  let ok = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, {
          TTL: 60 * 60, // an hour old reminder is no use
          timeout: 10_000, // a push service that doesn't answer mustn't hold up everyone else's reminders
          urgency: 'normal',
          topic: msg.tag.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32) || undefined,
        });
        ok++;
        await db.from('push_subscriptions').update({ last_ok_at: new Date().toISOString() }).eq('endpoint', s.endpoint);
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        // 404 / 410: that browser unsubscribed or was reset. Anything else: try again next time.
        if (status === 404 || status === 410) await db.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
        else console.error('push failed', status, (e as Error).message);
      }
    }),
  );
  return ok;
}

const BUILT_IN = new Map(DEFAULT_EXERCISES.map((e) => [e.id, e.name]));

/** Is it already done today? And the numbers for the message. */
async function check(db: SupabaseClient, userId: string, kind: ReminderKind, day: { date: string; weekday: number; startUtc: string; tz: string }): Promise<{ done: boolean; ctx: ReminderContext }> {
  switch (kind) {
    case 'workout': {
      const [{ data: done }, { data: plan }] = await Promise.all([
        db.from('workouts').select('id').eq('user_id', userId).eq('deleted', false).gte('started_at', day.startUtc).limit(1),
        db.from('plans').select('name,items').eq('user_id', userId).eq('day', day.weekday).eq('deleted', false).maybeSingle(),
      ]);
      if (done?.length) return { done: true, ctx: {} };
      const items = (Array.isArray(plan?.items) ? plan.items : []) as { exerciseId?: string }[];
      const ids = items.map((i) => i.exerciseId).filter((x): x is string => typeof x === 'string');
      const custom = ids.filter((id) => !BUILT_IN.has(id));
      const names = new Map(BUILT_IN);
      if (custom.length) {
        const { data: mine } = await db.from('exercises').select('id,name').eq('user_id', userId).in('id', custom);
        for (const e of mine ?? []) names.set(e.id as string, e.name as string);
      }
      return { done: false, ctx: { planName: (plan?.name as string | undefined) || undefined, exercises: ids.map((id) => names.get(id)).filter((n): n is string => !!n) } };
    }
    case 'lunch':
    case 'dinner': {
      const [{ data: logs }, { data: goal }] = await Promise.all([
        db.from('food_logs').select('meal,kcal').eq('user_id', userId).eq('date', day.date).eq('deleted', false),
        db.from('food_goals').select('kcal').eq('user_id', userId).eq('deleted', false).maybeSingle(),
      ]);
      const list = (logs ?? []) as { meal: string; kcal: number }[];
      return {
        done: list.some((l) => l.meal === kind),
        ctx: { kcalEaten: list.reduce((a, l) => a + Number(l.kcal), 0), kcalTarget: goal?.kcal ? Number(goal.kcal) : null },
      };
    }
    case 'water': {
      const { data } = await db.from('water_days').select('glasses').eq('user_id', userId).eq('date', day.date).eq('deleted', false).maybeSingle();
      const glasses = Number(data?.glasses ?? 0);
      return { done: glasses >= WATER_GOAL, ctx: { glasses } };
    }
    case 'weight': {
      const { data } = await db.from('body_weights').select('id').eq('user_id', userId).eq('date', day.date).eq('deleted', false).limit(1);
      return { done: !!data?.length, ctx: {} };
    }
    case 'run': {
      const [{ data: today }, { data: last }] = await Promise.all([
        db.from('runs').select('id').eq('user_id', userId).eq('deleted', false).gte('started_at', day.startUtc).limit(1),
        db.from('runs').select('distance_m,kind').eq('user_id', userId).eq('deleted', false).order('started_at', { ascending: false }).limit(1),
      ]);
      const l = last?.[0] as { distance_m: number; kind: 'run' | 'walk' } | undefined;
      return { done: !!today?.length, ctx: { lastRunKm: l ? Number(l.distance_m) / 1000 : null, runKind: l?.kind } };
    }
    case 'weekly': {
      // This week (Monday 00:00 in their time zone → now). Nothing logged → no notification.
      // (Bests here count against the last 6 months; the app's own report uses all of history.)
      const start = mondayOf(day.date);
      const fromUtc = new Date(Date.parse(day.startUtc) - (day.weekday === 0 ? 6 : day.weekday - 1) * 86_400_000).toISOString();
      const [{ data: w }, { data: r }, { data: f }, { data: g }, { data: bw }] = await Promise.all([
        // The 6 months before too, so the week's new bests can be found.
        db.from('workouts').select('id,name,started_at,finished_at,exercises').eq('user_id', userId).eq('deleted', false).gte('started_at', new Date(Date.parse(fromUtc) - 182 * 86_400_000).toISOString()).order('started_at', { ascending: false }).limit(300),
        db.from('runs').select('id,kind,started_at,finished_at,duration_s,distance_m').eq('user_id', userId).eq('deleted', false).gte('started_at', fromUtc).limit(100),
        db.from('food_logs').select('date,kcal,protein').eq('user_id', userId).eq('deleted', false).gte('date', start).limit(500),
        db.from('food_goals').select('kcal,protein').eq('user_id', userId).eq('deleted', false).maybeSingle(),
        db.from('body_weights').select('date,kg').eq('user_id', userId).eq('deleted', false).gte('date', addDays(start, -60)).order('date', { ascending: false }).limit(30),
      ]);
      const workouts = (w ?? []).map((x) => ({
        id: x.id, name: x.name, exercises: Array.isArray(x.exercises) ? x.exercises : [],
        startedAt: Date.parse(x.started_at), finishedAt: x.finished_at ? Date.parse(x.finished_at) : undefined,
      })) as Workout[];
      const runs = (r ?? []).map((x) => ({
        id: x.id, kind: x.kind, startedAt: Date.parse(x.started_at), finishedAt: Date.parse(x.finished_at),
        durationS: Number(x.duration_s), distanceM: Number(x.distance_m), steps: null, calories: 0, source: 'gps',
      })) as RunEntry[];
      const foodLogs = (f ?? []).map((x) => ({ date: String(x.date).slice(0, 10), kcal: Number(x.kcal), protein: Number(x.protein) })) as FoodLog[];
      const report = weekReport(
        {
          workouts,
          runs,
          foodLogs,
          foodGoal: g ? { plan: 'custom', kcal: Number(g.kcal), protein: Number(g.protein), carbs: 0, fat: 0 } : null,
          bodyWeights: (bw ?? []).map((x, i) => ({ id: String(i), date: String(x.date).slice(0, 10), kg: Number(x.kg) })),
        },
        start,
        (ms) => localNow(new Date(ms), day.tz).date,
      );
      return { done: report.empty, ctx: { weekLine: weekSummaryLine(report) } };
    }
  }
}

/** The database hands out at most 1,000 rows per request: read a long list page by page. */
const PAGE = 1000;
async function allRows<T>(page: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < PAGE) return out;
  }
}

/** How many people are handled at the same time. */
const PARALLEL = 20;
/** Stop starting new people after this long; the next run (5 minutes later) picks up the rest. */
const TIME_BUDGET_MS = 240_000;

/**
 * Every 5 minutes: send what's due, once a day each, skipping what's already
 * done. Each reminder is claimed in reminder_log before it's sent, so two runs
 * at the same time can never send it twice.
 */
export async function runReminders(now = new Date()): Promise<{ users: number; sent: number; skipped: number; failed: number }> {
  const db = adminDb();
  if (!db || !pushReady()) throw new Error('push not configured (SUPABASE_SECRET_KEY / VAPID keys)');
  const began = Date.now();
  const [prefsRows, subRows] = await Promise.all([
    allRows<{ user_id: string; tz: string; prefs: unknown }>((a, b) => db.from('reminder_prefs').select('user_id,tz,prefs').order('user_id').range(a, b)),
    allRows<{ user_id: string }>((a, b) => db.from('push_subscriptions').select('user_id').order('endpoint').range(a, b)),
  ]);
  const withDevice = new Set(subRows.map((r) => r.user_id));

  // Who has something due right now (before looking at what's already gone out today).
  const people = prefsRows
    .filter((row) => withDevice.has(row.user_id))
    .map((row) => ({ row, prefs: cleanPrefs(row.prefs), local: localNow(now, row.tz) }))
    .filter((p) => anyOn(p.prefs) && dueReminders(p.prefs, p.local, new Set()).length > 0);
  if (!people.length) return { users: 0, sent: 0, skipped: 0, failed: 0 };

  // Today's log for everyone at once (one or two dates, depending on time zones).
  const days = [...new Set(people.map((p) => p.local.date))];
  const logRows = await allRows<{ user_id: string; kind: string; day: string }>((a, b) =>
    db.from('reminder_log').select('user_id,kind,day').in('day', days).order('user_id').order('kind').order('day').range(a, b),
  );
  const logged = new Map<string, Set<string>>();
  for (const r of logRows) {
    const key = `${r.user_id}|${String(r.day).slice(0, 10)}`;
    (logged.get(key) ?? logged.set(key, new Set()).get(key)!).add(r.kind);
  }

  let users = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const handle = async ({ row, prefs, local }: (typeof people)[number]) => {
    const due = dueReminders(prefs, local, logged.get(`${row.user_id}|${local.date}`) ?? new Set());
    if (!due.length) return;
    users++;
    const day = { date: local.date, weekday: local.weekday, startUtc: localDayStartUtc(now, row.tz).toISOString(), tz: row.tz };
    for (const d of due) {
      // Claim it first: if another run already did, leave it.
      const { data: claimed, error } = await db
        .from('reminder_log')
        .upsert({ user_id: row.user_id, kind: d.key, day: local.date }, { onConflict: 'user_id,kind,day', ignoreDuplicates: true })
        .select('kind');
      if (error) throw new Error(error.message);
      if (!claimed?.length) continue;
      const { done, ctx } = await check(db, row.user_id, d.kind, day);
      if (done) skipped++;
      else sent += await sendToUser(db, row.user_id, reminderMessage(d.kind, ctx));
    }
  };

  // A few people at a time; one person's problem doesn't stop everyone else's reminders.
  let next = 0;
  const worker = async () => {
    while (next < people.length && Date.now() - began < TIME_BUDGET_MS) {
      const p = people[next++];
      try {
        await handle(p);
      } catch (e) {
        failed++;
        console.error('reminder failed for one person:', (e as Error).message);
      }
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  return { users, sent, skipped, failed };
}
