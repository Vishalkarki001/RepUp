/**
 * Reminders (push notifications): what can be reminded, when it's due, and
 * the words of each notification. Plain functions shared by the app (settings
 * screen), the server (/api/push/run) and the tests. No React, no browser APIs.
 */

export type ReminderKind = 'workout' | 'lunch' | 'dinner' | 'water' | 'weight' | 'run' | 'weekly';

export interface ReminderPrefs {
  workout: { on: boolean; time: string; days: number[] };
  lunch: { on: boolean; time: string };
  dinner: { on: boolean; time: string };
  /** Three nudges a day at fixed times. */
  water: { on: boolean };
  weight: { on: boolean; time: string; day: number };
  run: { on: boolean; time: string; days: number[] };
  /** Sunday 7 pm: the week in numbers. On unless turned off. */
  weekly: { on: boolean };
}

/** 0 = Sunday … 6 = Saturday (same as Date#getDay). */
export const DEFAULT_PREFS: ReminderPrefs = {
  workout: { on: false, time: '18:00', days: [1, 3, 5] },
  lunch: { on: false, time: '14:30' },
  dinner: { on: false, time: '21:30' },
  water: { on: false },
  weight: { on: false, time: '08:00', day: 0 },
  run: { on: false, time: '06:30', days: [2, 4, 6] },
  weekly: { on: true },
};

/** When the weekly report goes out (Sunday, the person's own time). */
export const WEEKLY_TIME = '19:00';

export const WATER_TIMES = ['11:00', '15:00', '19:00'];
/** A reminder can go out until this long after its time (the job runs every 5 minutes and may be late). */
export const WINDOW_MIN = 30;
/** What counts as "drank enough water" (glasses of 250 ml). */
export const WATER_GOAL = 8;

const isTime = (t: unknown): t is string => typeof t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
const isDays = (d: unknown): d is number[] => Array.isArray(d) && d.every((x) => Number.isInteger(x) && x >= 0 && x <= 6);

/** Saved prefs (any shape) → complete, valid prefs. */
export function cleanPrefs(raw: unknown): ReminderPrefs {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, Record<string, unknown> | undefined>;
  const d = DEFAULT_PREFS;
  const on = (k: keyof ReminderPrefs) => r[k]?.on === true;
  const time = (k: keyof ReminderPrefs, fallback: string) => (isTime(r[k]?.time) ? (r[k]!.time as string) : fallback);
  const days = (k: 'workout' | 'run', fallback: number[]) => (isDays(r[k]?.days) ? [...new Set(r[k]!.days as number[])].sort() : fallback);
  const day = r.weight?.day;
  return {
    workout: { on: on('workout'), time: time('workout', d.workout.time), days: days('workout', d.workout.days) },
    lunch: { on: on('lunch'), time: time('lunch', d.lunch.time) },
    dinner: { on: on('dinner'), time: time('dinner', d.dinner.time) },
    water: { on: on('water') },
    weight: { on: on('weight'), time: time('weight', d.weight.time), day: Number.isInteger(day) && (day as number) >= 0 && (day as number) <= 6 ? (day as number) : d.weight.day },
    run: { on: on('run'), time: time('run', d.run.time), days: days('run', d.run.days) },
    weekly: { on: r.weekly?.on !== false },
  };
}

export const anyOn = (p: ReminderPrefs) => Object.values(p).some((x) => x.on);

/** Local date, weekday and minutes since midnight in a time zone. */
export function localNow(now: Date, tz: string): { date: string; weekday: number; minutes: number } {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  } catch {
    return localNow(now, 'Asia/Kolkata'); // unknown time zone
  }
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

/** Start of a local day as a UTC instant (for "logged today?" checks in the database). */
export function localDayStartUtc(now: Date, tz: string): Date {
  const l = localNow(now, tz);
  const startMinutesAgo = l.minutes;
  return new Date(Math.floor(now.getTime() / 60000) * 60000 - startMinutesAgo * 60000);
}

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const inWindow = (minutes: number, t: string) => minutes >= toMin(t) && minutes < toMin(t) + WINDOW_MIN;

/**
 * Reminders whose time has come (log keys like "lunch" or "water-2", once a day),
 * not counting ones already sent today. Whether the thing is already done
 * (lunch logged, workout finished…) is checked by the caller.
 */
export function dueReminders(p: ReminderPrefs, local: { weekday: number; minutes: number }, sentToday: Set<string>): { key: string; kind: ReminderKind }[] {
  const out: { key: string; kind: ReminderKind }[] = [];
  const add = (key: string, kind: ReminderKind) => !sentToday.has(key) && out.push({ key, kind });
  if (p.workout.on && p.workout.days.includes(local.weekday) && inWindow(local.minutes, p.workout.time)) add('workout', 'workout');
  if (p.lunch.on && inWindow(local.minutes, p.lunch.time)) add('lunch', 'lunch');
  if (p.dinner.on && inWindow(local.minutes, p.dinner.time)) add('dinner', 'dinner');
  if (p.water.on) WATER_TIMES.forEach((t, i) => inWindow(local.minutes, t) && add(`water-${i + 1}`, 'water'));
  if (p.weight.on && p.weight.day === local.weekday && inWindow(local.minutes, p.weight.time)) add('weight', 'weight');
  if (p.run.on && p.run.days.includes(local.weekday) && inWindow(local.minutes, p.run.time)) add('run', 'run');
  if (p.weekly.on && local.weekday === 0 && inWindow(local.minutes, WEEKLY_TIME)) add('weekly', 'weekly');
  return out;
}

/* ------------------------------------------------------------------ */
/* the notifications                                                    */
/* ------------------------------------------------------------------ */

export interface PushMessage {
  title: string;
  body: string;
  /** Replaces an older notification of the same kind instead of stacking. */
  tag: string;
  /** Where a tap opens. */
  url: string;
}

export interface ReminderContext {
  /** Today's planned workout, if any. */
  planName?: string;
  exercises?: string[];
  kcalEaten?: number;
  kcalTarget?: number | null;
  glasses?: number;
  lastRunKm?: number | null;
  runKind?: 'run' | 'walk';
  /** "4 gym days · 12.4 km run · food logged 5 of 7 days". */
  weekLine?: string;
}

const list = (names: string[]) => (names.length > 3 ? `${names.slice(0, 3).join(', ')} +${names.length - 3}` : names.join(', '));

/** Short, friendly, with the person's own numbers. */
export function reminderMessage(kind: ReminderKind, c: ReminderContext = {}): PushMessage {
  switch (kind) {
    case 'workout':
      return {
        title: c.planName ? `${c.planName} day today 💪` : 'Workout day today 💪',
        body: c.exercises?.length ? `${list(c.exercises)}. Beat last time!` : 'Open RepUp and start your workout. Beat last time!',
        tag: 'workout',
        url: '/?open=workout',
      };
    case 'lunch':
    case 'dinner': {
      const left = c.kcalTarget ? Math.round(c.kcalTarget - (c.kcalEaten ?? 0)) : null;
      return {
        title: kind === 'lunch' ? 'Lunch not logged yet 🍛' : 'Dinner not logged yet 🍽️',
        body:
          left !== null
            ? `${left >= 0 ? `${left.toLocaleString('en-IN')} kcal left today` : `${Math.abs(left).toLocaleString('en-IN')} kcal over today`}. Takes 20 seconds: tap to add it.`
            : 'Takes 20 seconds: tap to add it.',
        tag: kind,
        url: `/?open=food&meal=${kind}`,
      };
    }
    case 'water':
      return {
        title: 'Time for a glass of water 💧',
        body: c.glasses ? `${c.glasses} of ${WATER_GOAL} glasses so far today.` : `Aim for ${WATER_GOAL} glasses today. Tap to add one.`,
        tag: 'water',
        url: '/?open=water',
      };
    case 'weight':
      return {
        title: 'Weekly weigh-in ⚖️',
        body: 'Same scale, before breakfast. One number a week shows the trend.',
        tag: 'weight',
        url: '/?open=weight',
      };
    case 'run':
      return {
        title: c.runKind === 'walk' ? 'Walk day today 🚶' : 'Run day today 🏃',
        body: c.lastRunKm ? `Last time: ${c.lastRunKm.toFixed(2)} km. Go again today?` : 'Lace up and tap Start. Every km counts.',
        tag: 'run',
        url: '/?open=run',
      };
    case 'weekly':
      return {
        title: 'Your week 💪',
        body: c.weekLine ? `${c.weekLine}. Tap to see it all.` : 'Tap to see your week in numbers.',
        tag: 'weekly',
        url: '/?open=week',
      };
  }
}

/** The "it works" notification from the settings screen. */
export const TEST_MESSAGE: PushMessage = {
  title: 'Reminders are on ✅',
  body: 'This is how RepUp will remind you. Tap to open the app.',
  tag: 'test',
  url: '/',
};
