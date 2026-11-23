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
async function check(db: SupabaseClient, userId: string, kind: ReminderKind, day: { date: string; weekday: number; startUtc: string }): Promise<{ done: boolean; ctx: ReminderContext }> {
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
  }
}

/** Every 5 minutes: send what's due, once a day each, skipping what's already done. */
export async function runReminders(now = new Date()): Promise<{ users: number; sent: number; skipped: number }> {
  const db = adminDb();
  if (!db || !pushReady()) throw new Error('push not configured (SUPABASE_SECRET_KEY / VAPID keys)');
  const [{ data: prefsRows }, { data: subRows }] = await Promise.all([
    db.from('reminder_prefs').select('user_id,tz,prefs').limit(5000),
    db.from('push_subscriptions').select('user_id').limit(20000),
  ]);
  const withDevice = new Set((subRows ?? []).map((r) => r.user_id as string));
  let users = 0;
  let sent = 0;
  let skipped = 0;
  for (const row of (prefsRows ?? []) as { user_id: string; tz: string; prefs: unknown }[]) {
    if (!withDevice.has(row.user_id)) continue;
    const prefs = cleanPrefs(row.prefs);
    if (!anyOn(prefs)) continue;
    const local = localNow(now, row.tz);
    const { data: logRows } = await db.from('reminder_log').select('kind').eq('user_id', row.user_id).eq('day', local.date);
    const due = dueReminders(prefs, local, new Set((logRows ?? []).map((r) => r.kind as string)));
    if (!due.length) continue;
    users++;
    const day = { date: local.date, weekday: local.weekday, startUtc: localDayStartUtc(now, row.tz).toISOString() };
    for (const d of due) {
      const { done, ctx } = await check(db, row.user_id, d.kind, day);
      if (done) skipped++;
      else sent += await sendToUser(db, row.user_id, reminderMessage(d.kind, ctx));
      // Logged either way: each reminder is looked at once a day.
      await db.from('reminder_log').upsert({ user_id: row.user_id, kind: d.key, day: local.date }, { onConflict: 'user_id,kind,day', ignoreDuplicates: true });
    }
  }
  return { users, sent, skipped };
}
