'use client';

import { useSyncExternalStore } from 'react';
import { actions, getState, subscribeState, userKey } from './store';
import { supabase } from './supabase/client';
import type { AppState, BodyWeightEntry, DayPlan, Exercise, RunEntry, Workout } from './types';

/**
 * Cloud sync with Supabase.
 *
 * The database is the source of truth; the on-device copy is a cache so the
 * app opens instantly and keeps working without internet at the gym.
 *
 *  - pull(): read every row for this user and merge it in;
 *  - push(): send only what changed since the last successful sync
 *    (compared with a per-table "last synced" snapshot), soft-deleting rows
 *    that disappeared locally;
 *  - runs on sign-in, on every local change (debounced), when the app comes
 *    back to the foreground and when the connection returns.
 * Row Level Security in the database guarantees a user only ever touches
 * their own rows.
 */

type Table = 'user_settings' | 'exercises' | 'plans' | 'workouts' | 'body_weights' | 'runs';
type Row = Record<string, unknown>;
type Rows = Record<Table, Map<string, Row>>;
type Snapshot = Record<Table, Record<string, string>>;

const TABLES: Table[] = ['user_settings', 'exercises', 'plans', 'workouts', 'body_weights', 'runs'];
const CONFLICT: Record<Table, string> = {
  user_settings: 'user_id',
  exercises: 'user_id,id',
  plans: 'user_id,day',
  workouts: 'user_id,id',
  body_weights: 'user_id,id',
  runs: 'user_id,id',
};
/** Tables that may not exist yet while a database update is being applied: treated as empty until they do. */
const OPTIONAL: Table[] = ['runs'];
const missingTables = new Set<Table>();
const isMissingTable = (e: { code?: string; message?: string }) =>
  e.code === '42P01' || e.code === 'PGRST205' || /could not find the table|does not exist/i.test(e.message ?? '');
const PUSH_DELAY_MS = 1500;

/* ------------------------------------------------------------------ */
/* local state  →  database rows                                       */
/* ------------------------------------------------------------------ */

function rowsFromState(s: AppState, uid: string): Rows {
  const r: Rows = { user_settings: new Map(), exercises: new Map(), plans: new Map(), workouts: new Map(), body_weights: new Map(), runs: new Map() };
  r.user_settings.set(uid, {
    user_id: uid,
    rest_seconds: s.settings.restSeconds,
    default_reps: s.settings.defaultReps,
    unit: s.settings.unit,
    mode: s.settings.mode,
    onboarded: s.onboarded,
  });
  for (const e of s.exercises) {
    // Built-in exercises only need a row when the user added a note to them.
    if (!e.custom && !e.note) continue;
    r.exercises.set(e.id, {
      user_id: uid,
      id: e.id,
      name: e.name,
      muscle: e.muscle,
      equipment: e.equipment,
      custom: !!e.custom,
      note: e.note ?? null,
      deleted: false,
    });
  }
  for (const p of s.plans) {
    r.plans.set(String(p.day), { user_id: uid, day: p.day, name: p.name, items: p.items, deleted: false });
  }
  for (const w of s.workouts) {
    r.workouts.set(w.id, {
      user_id: uid,
      id: w.id,
      name: w.name,
      day: w.day ?? null,
      started_at: new Date(w.startedAt).toISOString(),
      finished_at: w.finishedAt ? new Date(w.finishedAt).toISOString() : null,
      exercises: w.exercises,
      note: w.note ?? null,
      deleted: false,
    });
  }
  for (const b of s.bodyWeights) {
    r.body_weights.set(b.id, { user_id: uid, id: b.id, date: b.date, kg: b.kg, deleted: false });
  }
  for (const x of s.runs) r.runs.set(x.id, runRow(uid, x));
  return r;
}

function runRow(uid: string, x: RunEntry): Row {
  return {
    user_id: uid,
    id: x.id,
    kind: x.kind,
    started_at: new Date(x.startedAt).toISOString(),
    finished_at: new Date(x.finishedAt).toISOString(),
    duration_s: Math.round(x.durationS),
    distance_m: Math.round(x.distanceM),
    steps: x.steps === null || x.steps === undefined ? null : Math.round(x.steps),
    steps_source: x.stepsSource ?? null,
    calories: Math.round(x.calories),
    temp_c: x.tempC === null || x.tempC === undefined ? null : Number(x.tempC),
    weather_code: x.weatherCode === null || x.weatherCode === undefined ? null : Number(x.weatherCode),
    route: x.route ?? [],
    splits: x.splits ?? [],
    gap_s: Math.round(x.gapS ?? 0),
    source: x.source,
    note: x.note ?? null,
    deleted: false,
  };
}

const keyOf = (t: Table, row: Row) => (t === 'user_settings' ? String(row.user_id) : t === 'plans' ? String(row.day) : String(row.id));

/** JSON with object keys sorted (Postgres jsonb reorders keys, so plain JSON.stringify would never match). */
function stable(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`;
  if (v && typeof v === 'object') {
    return `{${Object.keys(v as Row)
      .filter((k) => (v as Row)[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable((v as Row)[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(v ?? null);
}
const fingerprint = (row: Row) => stable(row);

/** A row read from the database, reshaped exactly like rowsFromState() would build it. */
function normalizeRemote(t: Table, r: Row): Row {
  const iso = (v: unknown) => (v ? new Date(String(v)).toISOString() : null);
  switch (t) {
    case 'user_settings':
      return {
        user_id: r.user_id,
        rest_seconds: Number(r.rest_seconds),
        default_reps: Number(r.default_reps),
        unit: r.unit,
        mode: r.mode === 'running' ? 'running' : 'workout',
        onboarded: Boolean(r.onboarded),
      };
    case 'exercises':
      return { user_id: r.user_id, id: r.id, name: r.name, muscle: r.muscle, equipment: r.equipment, custom: Boolean(r.custom), note: r.note ?? null, deleted: false };
    case 'plans':
      return { user_id: r.user_id, day: Number(r.day), name: r.name, items: r.items, deleted: false };
    case 'workouts':
      return {
        user_id: r.user_id,
        id: r.id,
        name: r.name,
        day: r.day === null || r.day === undefined ? null : Number(r.day),
        started_at: iso(r.started_at),
        finished_at: iso(r.finished_at),
        exercises: r.exercises,
        note: r.note ?? null,
        deleted: false,
      };
    case 'body_weights':
      return { user_id: r.user_id, id: r.id, date: r.date, kg: Number(r.kg), deleted: false };
    case 'runs':
      return runRow(String(r.user_id), runFromRow(r));
  }
}

function runFromRow(r: Row): RunEntry {
  const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  return {
    id: String(r.id),
    kind: r.kind === 'walk' ? 'walk' : 'run',
    startedAt: Date.parse(String(r.started_at)),
    finishedAt: Date.parse(String(r.finished_at)),
    durationS: Number(r.duration_s),
    distanceM: Number(r.distance_m),
    steps: num(r.steps),
    stepsSource: r.steps_source === 'sensor' || r.steps_source === 'estimate' ? r.steps_source : undefined,
    calories: Number(r.calories),
    tempC: num(r.temp_c),
    weatherCode: num(r.weather_code),
    route: Array.isArray(r.route) ? (r.route as [number, number][]) : [],
    splits: Array.isArray(r.splits) ? (r.splits as number[]) : [],
    gapS: Number(r.gap_s ?? 0),
    source: r.source === 'manual' ? 'manual' : 'gps',
    note: (r.note as string | null) ?? undefined,
  };
}

/* ------------------------------------------------------------------ */
/* database rows  →  local state                                       */
/* ------------------------------------------------------------------ */

function applyRemote(s: AppState, remote: Record<Table, Row[]>, dirty: Record<Table, Set<string>>, firstSync: boolean): AppState {
  let exercises = [...s.exercises];
  let plans = [...s.plans];
  let workouts = [...s.workouts];
  let bodyWeights = [...s.bodyWeights];
  let settings = s.settings;
  let onboarded = s.onboarded;

  const remoteSettings = remote.user_settings[0];
  const remoteOnboarded = Boolean(remoteSettings?.onboarded);

  if (remoteSettings && !dirty.user_settings.size) {
    // First sign-in on this device: the account's settings win, unless only this device has been set up.
    const takeRemote = !firstSync || remoteOnboarded;
    if (takeRemote) {
      settings = {
        restSeconds: Number(remoteSettings.rest_seconds),
        defaultReps: Number(remoteSettings.default_reps),
        unit: remoteSettings.unit === 'lb' ? 'lb' : 'kg',
        mode: remoteSettings.mode === 'running' ? 'running' : 'workout',
      };
    }
    onboarded = remoteOnboarded || (firstSync && s.onboarded);
  }

  for (const row of remote.exercises) {
    const id = String(row.id);
    if (dirty.exercises.has(id)) continue;
    const i = exercises.findIndex((e) => e.id === id);
    if (row.deleted) {
      if (i >= 0 && exercises[i].custom) exercises.splice(i, 1);
      else if (i >= 0) exercises[i] = { ...exercises[i], note: undefined };
      continue;
    }
    if (row.custom) {
      const ex: Exercise = {
        id,
        name: String(row.name),
        muscle: row.muscle as Exercise['muscle'],
        equipment: row.equipment as Exercise['equipment'],
        custom: true,
        note: (row.note as string | null) ?? undefined,
      };
      if (i >= 0) exercises[i] = ex;
      else exercises = [...exercises, ex];
    } else if (i >= 0) {
      exercises[i] = { ...exercises[i], note: (row.note as string | null) ?? undefined };
    }
  }

  // Plans: on the first sign-in of an existing account its week replaces this device's default week.
  if (firstSync && remoteOnboarded && !dirty.plans.size) {
    plans = remote.plans.filter((r) => !r.deleted).map((r) => ({ day: Number(r.day), name: String(r.name), items: r.items as DayPlan['items'] }));
  } else {
    for (const row of remote.plans) {
      const day = Number(row.day);
      if (dirty.plans.has(String(day))) continue;
      plans = plans.filter((p) => p.day !== day);
      if (!row.deleted) plans.push({ day, name: String(row.name), items: row.items as DayPlan['items'] });
    }
  }
  plans.sort((a, b) => a.day - b.day);

  for (const row of remote.workouts) {
    const id = String(row.id);
    if (dirty.workouts.has(id)) continue;
    workouts = workouts.filter((w) => w.id !== id);
    if (!row.deleted) {
      const w: Workout = {
        id,
        name: String(row.name),
        day: row.day === null || row.day === undefined ? undefined : Number(row.day),
        startedAt: Date.parse(String(row.started_at)),
        finishedAt: row.finished_at ? Date.parse(String(row.finished_at)) : undefined,
        exercises: row.exercises as Workout['exercises'],
        note: (row.note as string | null) ?? undefined,
      };
      workouts.push(w);
    }
  }
  workouts.sort((a, b) => b.startedAt - a.startedAt);

  for (const row of remote.body_weights) {
    const id = String(row.id);
    if (dirty.body_weights.has(id)) continue;
    bodyWeights = bodyWeights.filter((b) => b.id !== id);
    if (!row.deleted) bodyWeights.push({ id, date: String(row.date), kg: Number(row.kg) } satisfies BodyWeightEntry);
  }
  bodyWeights.sort((a, b) => b.date.localeCompare(a.date));

  let runs = [...s.runs];
  for (const row of remote.runs) {
    const id = String(row.id);
    if (dirty.runs.has(id)) continue;
    runs = runs.filter((x) => x.id !== id);
    if (!row.deleted) runs.push(runFromRow(row));
  }
  runs.sort((a, b) => b.startedAt - a.startedAt);

  return { ...s, exercises, plans, workouts, bodyWeights, runs, settings, onboarded };
}

/* ------------------------------------------------------------------ */
/* status (for the UI)                                                  */
/* ------------------------------------------------------------------ */

export type SyncStatus = { state: 'idle' | 'syncing' | 'offline' | 'error'; lastSyncedAt: number | null; message?: string };
let status: SyncStatus = { state: 'idle', lastSyncedAt: null };
const statusListeners = new Set<() => void>();
function setStatus(next: Partial<SyncStatus>) {
  status = { ...status, ...next };
  statusListeners.forEach((l) => l());
}
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    (l) => {
      statusListeners.add(l);
      return () => statusListeners.delete(l);
    },
    () => status,
    () => status,
  );
}

/* ------------------------------------------------------------------ */
/* engine                                                               */
/* ------------------------------------------------------------------ */

let uid: string | null = null;
let snapshot: Snapshot | null = null;
/** The synced parts of the state as they were at the last successful sync (fast "anything changed?" check). */
let syncedRefs: unknown[] | null = null;
const syncedParts = (s: AppState) => [s.exercises, s.plans, s.workouts, s.bodyWeights, s.runs, s.settings, s.onboarded];
const markSynced = () => {
  syncedRefs = syncedParts(getState());
};
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryDelay = 15_000;
let running: Promise<void> = Promise.resolve();
let stopListening: (() => void) | null = null;

const snapKey = (id: string) => `${userKey(id)}:synced`;
const emptySnapshot = (): Snapshot => ({ user_settings: {}, exercises: {}, plans: {}, workouts: {}, body_weights: {}, runs: {} });

function loadSnapshot(id: string): Snapshot | null {
  try {
    const raw = localStorage.getItem(snapKey(id));
    return raw ? { ...emptySnapshot(), ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}
function saveSnapshot() {
  if (!uid || !snapshot) return;
  try {
    localStorage.setItem(snapKey(uid), JSON.stringify(snapshot));
  } catch {
    /* storage full */
  }
}

/** Keys that changed locally since the last successful sync. */
function dirtyKeys(rows: Rows, snap: Snapshot): Record<Table, Set<string>> {
  const out = {} as Record<Table, Set<string>>;
  for (const t of TABLES) {
    out[t] = new Set();
    for (const [k, row] of rows[t]) if (snap[t][k] !== fingerprint(row)) out[t].add(k);
    for (const k of Object.keys(snap[t])) if (!rows[t].has(k)) out[t].add(k);
  }
  return out;
}

const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;

/** Serialise sync work so pulls and pushes never overlap. */
function queue(job: () => Promise<void>): Promise<void> {
  running = running.then(job, job);
  return running;
}

async function pullNow(): Promise<void> {
  if (!uid) return;
  if (isOffline()) return setStatus({ state: 'offline' });
  setStatus({ state: 'syncing' });
  const db = supabase();
  const raw = await Promise.all(TABLES.map((t) => db.from(t).select('*')));
  const results = raw.map((r, i) => {
    const t = TABLES[i];
    if (r.error && OPTIONAL.includes(t) && isMissingTable(r.error)) {
      missingTables.add(t);
      return { data: [] as Row[], error: null };
    }
    if (!r.error) missingTables.delete(t);
    return { data: (r.data ?? []) as Row[], error: r.error };
  });
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
  const remote = Object.fromEntries(TABLES.map((t, i) => [t, results[i].data])) as Record<Table, Row[]>;

  const firstSync = snapshot === null;
  const snap = snapshot ?? emptySnapshot();
  const before = getState();
  const dirty = dirtyKeys(rowsFromState(before, uid), snap);
  if (firstSync) {
    // First sync on this device: nothing here is "newer" than the account's settings / week —
    // applyRemote() decides who wins for those two.
    dirty.user_settings.clear();
    dirty.plans.clear();
  }
  const merged = applyRemote(before, remote, dirty, firstSync);
  if (stable(merged) !== stable(before)) actions.replaceAll(merged);

  // New snapshot = exactly what the server holds now. Anything local that differs gets pushed next.
  const next = emptySnapshot();
  for (const t of TABLES) {
    for (const row of remote[t]) {
      if (row.deleted) continue;
      next[t][keyOf(t, row)] = fingerprint(normalizeRemote(t, row));
    }
  }
  snapshot = next;
  saveSnapshot();
  markSynced();
}

async function pushNow(): Promise<void> {
  if (!uid) return;
  if (isOffline()) return setStatus({ state: 'offline' });
  const rows = rowsFromState(getState(), uid);
  const snap = snapshot ?? emptySnapshot();
  const db = supabase();
  let sent = 0;
  for (const t of TABLES) {
    if (missingTables.has(t)) continue; // not in the database yet: keep it on the device and send it later
    const changed: Row[] = [];
    for (const [k, row] of rows[t]) if (snap[t][k] !== fingerprint(row)) changed.push(row);
    const removed: Row[] = [];
    for (const k of Object.keys(snap[t])) {
      if (rows[t].has(k) || t === 'user_settings') continue;
      try {
        removed.push({ ...JSON.parse(snap[t][k]), deleted: true });
      } catch {
        /* unreadable snapshot entry — skip */
      }
    }
    const batch = [...changed, ...removed];
    if (!batch.length) continue;
    setStatus({ state: 'syncing' });
    for (let i = 0; i < batch.length; i += 200) {
      const { error } = await db.from(t).upsert(batch.slice(i, i + 200), { onConflict: CONFLICT[t] });
      if (error) throw error;
    }
    for (const row of changed) snap[t][keyOf(t, row)] = fingerprint(row);
    for (const row of removed) delete snap[t][keyOf(t, row)];
    sent += batch.length;
  }
  snapshot = snap;
  if (sent) saveSnapshot();
  markSynced();
}

async function run(job: () => Promise<void>) {
  try {
    await job();
    setStatus({ state: isOffline() ? 'offline' : 'idle', lastSyncedAt: Date.now(), message: undefined });
    retryDelay = 15_000;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    setStatus({ state: isOffline() || /fetch|network/i.test(msg) ? 'offline' : 'error', message: msg });
    // Try again by itself: 15 s, 30 s, 60 s … up to every 2 minutes.
    if (uid && !retryTimer) {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        void syncNow();
      }, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 120_000);
    }
  }
}

/** Pull then push (used on start, focus and reconnect). */
export function syncNow(): Promise<void> {
  return queue(() => run(async () => {
    await pullNow();
    await pushNow();
  }));
}

/** Push pending local changes right away (e.g. before signing out). */
export function flush(): Promise<void> {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = null;
  return queue(() => run(pushNow));
}

function schedulePush() {
  // Show "Saving…" right away when something that gets saved has changed
  // (typing in a running workout isn't saved to the cloud, so it doesn't count).
  if (uid && status.state !== 'syncing' && hasUnsyncedChanges()) setStatus({ state: isOffline() ? 'offline' : 'syncing' });
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void queue(() => run(pushNow));
  }, PUSH_DELAY_MS);
}

/**
 * Start syncing for a signed-in user. Resolves after the first pull+push
 * (or after `timeoutMs`, so a slow connection never blocks the app).
 */
export async function startSync(userId: string, timeoutMs = 6000): Promise<void> {
  stopSync();
  uid = userId;
  snapshot = loadSnapshot(userId);

  const unsubStore = subscribeState(schedulePush);
  const onVisible = () => document.visibilityState === 'visible' && void syncNow();
  const onOnline = () => void syncNow();
  const onOffline = () => setStatus({ state: 'offline' });
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  stopListening = () => {
    unsubStore();
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };

  await Promise.race([syncNow(), new Promise((r) => setTimeout(r, timeoutMs))]);
}

export function stopSync(): void {
  stopListening?.();
  stopListening = null;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = null;
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
  retryDelay = 15_000;
  uid = null;
  snapshot = null;
  syncedRefs = null;
}

/** True when some local change hasn't reached the server yet. */
export function hasUnsyncedChanges(): boolean {
  if (!uid) return false;
  // Fast path: nothing that syncs has been replaced since the last sync.
  if (syncedRefs && syncedParts(getState()).every((part, i) => part === syncedRefs![i])) return false;
  const snap = snapshot ?? emptySnapshot();
  const d = dirtyKeys(rowsFromState(getState(), uid), snap);
  return TABLES.some((t) => d[t].size > 0);
}
