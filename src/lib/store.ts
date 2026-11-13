import { useSyncExternalStore } from 'react';
import { DEFAULT_EXERCISES, DEFAULT_PLANS } from './data/defaults';
import type {
  AppState,
  BodyWeightEntry,
  Exercise,
  DayPlan,
  PersonalRecord,
  PlanItem,
  RunEntry,
  SetEntry,
  Settings,
  Workout,
  WorkoutExercise,
  WorkoutSummary,
} from './types';
import { defaultWorkoutName, est1RM, newSet, setUnit, uid } from './utils';

/**
 * Client-side store persisted to localStorage (works fully offline).
 * When login + database are added, keep this as the local cache and sync the
 * same records (exercises, plans, workouts, bodyWeights) to the server.
 */

/** Data saved before accounts existed (or when Supabase isn't configured). */
export const GUEST_KEY = 'gym-workout-tracker:v2';
/** Each signed-in user gets their own on-device copy (offline cache of their cloud data). */
export const userKey = (uid: string) => `repup:v3:user:${uid}`;
let KEY = GUEST_KEY;

function initialState(): AppState {
  return {
    version: 3,
    exercises: DEFAULT_EXERCISES,
    plans: DEFAULT_PLANS,
    workouts: [],
    active: null,
    restEndsAt: null,
    restTotal: 0,
    bodyWeights: [],
    runs: [],
    settings: { restSeconds: 90, defaultReps: 10, unit: 'kg', mode: 'workout' },
    onboarded: false,
  };
}

interface LegacyRoutine {
  name: string;
  days?: number[];
  items: { exerciseId: string; sets: number; repMin?: number; repMax?: number }[];
}

/** v2 had routines scheduled on several days; v3 has one plan per weekday. */
function plansFromRoutines(routines: LegacyRoutine[]): DayPlan[] {
  const plans: DayPlan[] = [];
  for (let day = 0; day < 7; day++) {
    const r = routines.find((x) => x.days?.includes(day));
    if (!r) continue;
    plans.push({
      day,
      name: r.name.split('—')[0].trim() || r.name,
      items: r.items.map((i) => ({ exerciseId: i.exerciseId, sets: i.sets, reps: i.repMax ?? i.repMin ?? 10 })),
    });
  }
  return plans;
}

function normalize(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<AppState> & { routines?: LegacyRoutine[]; settings?: Partial<Settings> & { repMax?: number } };
  if (!Array.isArray(r.exercises) || !Array.isArray(r.workouts)) return null;
  const base = initialState();
  const settings: Settings = {
    restSeconds: r.settings?.restSeconds ?? base.settings.restSeconds,
    defaultReps: r.settings?.defaultReps ?? r.settings?.repMax ?? base.settings.defaultReps,
    unit: r.settings?.unit === 'lb' ? 'lb' : 'kg',
    mode: r.settings?.mode === 'running' ? 'running' : 'workout',
  };
  const fixRange = <T extends { repMin?: number; repMax?: number }>(x: T) => ({
    ...x,
    repMin: x.repMin ?? settings.defaultReps,
    repMax: x.repMax ?? x.repMin ?? settings.defaultReps,
  });
  const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object';
  const validSet = (x: unknown) => isObj(x) && typeof x.id === 'string';
  const validEx = (x: unknown) => isObj(x) && typeof x.exerciseId === 'string' && Array.isArray(x.sets);
  const fixWorkout = (w: Workout): Workout => ({
    ...w,
    exercises: w.exercises.filter(validEx).map((e) => fixRange({ ...e, sets: e.sets.filter(validSet) })),
  });
  const validWorkout = (w: unknown): w is Workout =>
    isObj(w) && typeof w.id === 'string' && typeof w.startedAt === 'number' && Array.isArray(w.exercises);
  const validRun = (x: unknown): x is RunEntry =>
    isObj(x) &&
    typeof x.id === 'string' &&
    typeof x.startedAt === 'number' &&
    typeof x.durationS === 'number' &&
    typeof x.distanceM === 'number' &&
    (x.kind === 'run' || x.kind === 'walk');
  const validPlan = (p: unknown): p is DayPlan =>
    isObj(p) && typeof p.day === 'number' && p.day >= 0 && p.day <= 6 && Array.isArray(p.items);
  const plans = Array.isArray(r.plans)
    ? r.plans
        .filter(validPlan)
        .map((p) => ({ ...p, name: String(p.name ?? ''), items: p.items.filter((i) => isObj(i) && typeof i.exerciseId === 'string') }))
    : Array.isArray(r.routines)
      ? plansFromRoutines(r.routines.filter((x) => isObj(x) && Array.isArray(x.items) && typeof x.name === 'string'))
      : base.plans;
  return {
    version: 3,
    exercises: r.exercises.filter((e) => isObj(e) && typeof e.id === 'string' && typeof e.name === 'string'),
    plans,
    workouts: r.workouts.filter(validWorkout).map(fixWorkout),
    active: validWorkout(r.active) ? fixWorkout(r.active) : null,
    // Legacy rest-timer field (the timer was removed): never restore an expired value.
    restEndsAt: r.restEndsAt && r.restEndsAt > Date.now() ? r.restEndsAt : null,
    restTotal: r.restTotal ?? 0,
    bodyWeights: Array.isArray(r.bodyWeights)
      ? r.bodyWeights.filter((b) => isObj(b) && typeof b.kg === 'number' && typeof b.date === 'string')
      : [],
    runs: Array.isArray(r.runs) ? r.runs.filter(validRun).sort((a, b) => b.startedAt - a.startedAt) : [],
    settings,
    // Data saved before the first-run picker existed belongs to someone who already set things up.
    onboarded: r.onboarded ?? true,
  };
}

function load(): AppState {
  if (typeof window === 'undefined') return initialState();
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = normalize(JSON.parse(raw));
      if (parsed) return parsed;
    }
  } catch {
    /* corrupted or blocked storage */
  }
  // Keep a copy of unreadable data instead of overwriting it on the next save.
  if (raw) {
    try {
      localStorage.setItem(`${KEY}:unreadable-${Date.now()}`, raw);
    } catch {
      /* storage full / blocked */
    }
  }
  return initialState();
}

let state: AppState = load();
setUnit(state.settings.unit);
const listeners = new Set<() => void>();

function set(updater: (s: AppState) => AppState): void {
  const next = updater(state);
  if (next === state) return;
  state = next;
  setUnit(state.settings.unit);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full / blocked */
  }
  listeners.forEach((l) => l());
}

/** Current state (for the sync engine). */
export function getState(): AppState {
  return state;
}

/** Listen to every change (for the sync engine). */
export function subscribeState(l: () => void): () => void {
  return subscribe(l);
}

/** Merge on-device guest data into a user's state (workouts, weights and own exercises are combined). */
function mergeGuest(user: AppState, guest: AppState): AppState {
  const byId = <T extends { id: string }>(a: T[], b: T[]) => [...new Map([...b, ...a].map((x) => [x.id, x])).values()];
  const workouts = byId(user.workouts, guest.workouts).sort((a, b) => b.startedAt - a.startedAt);
  const bodyWeights = byId(user.bodyWeights, guest.bodyWeights).sort((a, b) => b.date.localeCompare(a.date));
  const runs = byId(user.runs, guest.runs).sort((a, b) => b.startedAt - a.startedAt);
  const exercises = byId(user.exercises, guest.exercises);
  const fresh = !user.onboarded;
  return {
    ...user,
    exercises,
    workouts,
    bodyWeights,
    runs,
    plans: fresh ? guest.plans : user.plans,
    settings: fresh ? guest.settings : user.settings,
    onboarded: user.onboarded || guest.onboarded,
    active: user.active ?? guest.active,
  };
}

/**
 * Switch the store to a signed-in user's own data (or back to guest with null).
 * The first time someone signs in on a device, workouts saved here before
 * accounts existed are moved into their account (and removed from the guest slot).
 */
export function switchUser(uid: string | null): { movedGuestData: boolean } {
  KEY = uid ? userKey(uid) : GUEST_KEY;
  let next = load();
  let movedGuestData = false;
  if (uid && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(GUEST_KEY);
      const guest = raw ? normalize(JSON.parse(raw)) : null;
      if (raw && guest) {
        const hasData = guest.workouts.length > 0 || guest.runs.length > 0 || guest.bodyWeights.length > 0 || guest.exercises.some((e) => e.custom);
        if (hasData || guest.onboarded) {
          next = mergeGuest(next, guest);
          movedGuestData = hasData;
        }
        localStorage.setItem(`${GUEST_KEY}:moved-to-account`, raw); // safety copy
        localStorage.removeItem(GUEST_KEY);
      }
    } catch {
      /* storage blocked */
    }
  }
  set(() => next);
  if (state !== next) state = next;
  setUnit(state.settings.unit);
  listeners.forEach((l) => l());
  return { movedGuestData };
}

/** Remove a user's on-device copy (on sign out, after everything is synced). */
export function forgetUserOnDevice(uid: string): void {
  try {
    localStorage.removeItem(userKey(uid));
    localStorage.removeItem(`${userKey(uid)}:synced`);
  } catch {
    /* storage blocked */
  }
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

// Keep several open tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY || !e.newValue) return;
    try {
      const next = normalize(JSON.parse(e.newValue));
      if (next) {
        state = next;
        setUnit(state.settings.unit);
        listeners.forEach((l) => l());
      }
    } catch {
      /* ignore */
    }
  });
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

/* ---------- selectors ---------- */

export function exerciseMap(s: AppState): Map<string, Exercise> {
  return new Map(s.exercises.map((e) => [e.id, e]));
}

export interface LastSession {
  workoutId: string;
  date: number;
  sets: SetEntry[]; // completed sets incl. warm-ups
}

/** Most recent finished workout that included this exercise. */
export function lastSessionFor(s: AppState, exerciseId: string): LastSession | null {
  for (const w of s.workouts) {
    const we = w.exercises.find((e) => e.exerciseId === exerciseId && e.sets.some((x) => x.done));
    if (we) return { workoutId: w.id, date: w.startedAt, sets: we.sets.filter((x) => x.done) };
  }
  return null;
}

export interface ExerciseSession {
  workoutId: string;
  date: number;
  sets: SetEntry[]; // working sets only
  best1RM: number;
  maxWeight: number;
  maxReps: number;
  volume: number;
}

/** All sessions of an exercise (working sets only), oldest first. */
export function exerciseHistory(s: AppState, exerciseId: string): ExerciseSession[] {
  const out: ExerciseSession[] = [];
  for (const w of s.workouts) {
    for (const we of w.exercises) {
      if (we.exerciseId !== exerciseId) continue;
      const sets = we.sets.filter((x) => x.done && !x.warmup);
      if (!sets.length) continue;
      out.push({
        workoutId: w.id,
        date: w.startedAt,
        sets,
        best1RM: Math.max(...sets.map((x) => est1RM(x.weight ?? 0, x.reps ?? 0))),
        maxWeight: Math.max(...sets.map((x) => x.weight ?? 0)),
        maxReps: Math.max(...sets.map((x) => x.reps ?? 0)),
        volume: sets.reduce((a, x) => a + (x.weight ?? 0) * (x.reps ?? 0), 0),
      });
    }
  }
  return out.reverse();
}

export function planForDay(s: AppState, day: number): DayPlan | null {
  const p = s.plans.find((x) => x.day === day);
  return p && p.items.length ? p : null;
}

/**
 * What the day plan would look like if it matched this workout: same
 * exercises in the same order, working-set count and goal reps. Returns
 * undefined when nothing changed or the workout wasn't started from a plan.
 */
function planChangesFrom(s: AppState, w: Workout): DayPlan | undefined {
  if (w.day === undefined) return undefined;
  const plan = s.plans.find((p) => p.day === w.day);
  const planned = (id: string) => plan?.items.find((i) => i.exerciseId === id);
  const items: PlanItem[] = w.exercises
    // An exercise added today but never ticked isn't proposed for the plan.
    .filter((e) => planned(e.exerciseId) || e.sets.some((x) => x.done))
    .map((e) => {
      const working = e.sets.filter((x) => !x.warmup);
      const done = working.filter((x) => x.done).length;
      const p = planned(e.exerciseId);
      // Extra sets count only if ticked; removed sets always count; a skipped
      // (unticked) planned set doesn't shrink the plan.
      const sets = Math.min(working.length, Math.max(done, p?.sets ?? 0));
      return { exerciseId: e.exerciseId, sets: Math.max(1, sets), reps: e.repMax, weight: p?.weight ?? null };
    });
  if (!items.length) return undefined;
  const key = (l: PlanItem[]) => l.map((i) => `${i.exerciseId}:${i.sets}:${i.reps}`).join('|');
  if (plan && key(plan.items) === key(items)) return undefined;
  return { day: w.day, name: plan?.name || w.name, items };
}

/* ---------- actions ---------- */

export function toWorkoutExercise(i: PlanItem): WorkoutExercise {
  // The planned kg pre-fills the sets only the first time; after that the
  // "last time" numbers and the progression target take over.
  const hasHistory = state.workouts.some((w) => w.exercises.some((e) => e.exerciseId === i.exerciseId));
  const weight = !hasHistory && i.weight ? i.weight : null;
  return {
    id: uid(),
    exerciseId: i.exerciseId,
    repMin: i.reps,
    repMax: i.reps,
    sets: Array.from({ length: Math.max(1, i.sets) }, () => ({ ...newSet(), weight })),
  };
}

function workoutFrom(name: string, items: PlanItem[], day?: number): Workout {
  return {
    id: uid(),
    name,
    day,
    startedAt: Date.now(),
    exercises: items.filter((i) => state.exercises.some((e) => e.id === i.exerciseId)).map(toWorkoutExercise),
  };
}

export const actions = {
  startEmptyWorkout() {
    // Starts unnamed so the name box asks for one; finishing without a name uses the time of day.
    set((s) => (s.active ? s : { ...s, active: workoutFrom('', []) }));
  },

  startPlan(day: number) {
    set((s) => {
      const p = planForDay(s, day);
      if (s.active || !p) return s;
      return { ...s, active: workoutFrom(p.name || 'Workout', p.items, day) };
    });
  },

  repeatWorkout(workoutId: string) {
    set((s) => {
      const w = s.workouts.find((x) => x.id === workoutId);
      if (s.active || !w) return s;
      const items = w.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets.filter((x) => !x.warmup).length || e.sets.length,
        reps: e.repMax,
      }));
      return { ...s, active: workoutFrom(w.name, items, w.day) };
    });
  },

  /** Exercises appended to the running workout. */
  addToActive(exerciseIds: string[]) {
    actions.updateActive((w) => ({
      ...w,
      exercises: [
        ...w.exercises,
        ...exerciseIds.map((exerciseId) => {
          // Re-use the reps this exercise had last time, if any.
          const last = state.workouts.flatMap((x) => x.exercises).find((e) => e.exerciseId === exerciseId);
          return toWorkoutExercise({ exerciseId, sets: 3, reps: last?.repMax ?? state.settings.defaultReps });
        }),
      ],
    }));
  },

  /** Replace everything at once (used when cloud data is merged in). */
  replaceAll(next: AppState) {
    set(() => next);
  },

  updateActive(fn: (w: Workout) => Workout) {
    set((s) => (s.active ? { ...s, active: fn(s.active) } : s));
  },

  cancelWorkout() {
    set((s) => ({ ...s, active: null, restEndsAt: null }));
  },

  /** Saves the active workout. Returns null if no set was completed. */
  finishWorkout(): WorkoutSummary | null {
    const s = state;
    if (!s.active) return null;
    const exercises = s.active.exercises
      .map((e) => ({ ...e, sets: e.sets.filter((x) => x.done && (x.reps ?? 0) > 0) }))
      .filter((e) => e.sets.length > 0);
    if (!exercises.length) return null;

    const workout: Workout = {
      ...s.active,
      name: s.active.name.trim() || defaultWorkoutName(),
      exercises,
      finishedAt: Date.now(),
    };
    const planUpdate = planChangesFrom(s, s.active);

    // Personal records vs. all earlier history (working sets only).
    const prs: PersonalRecord[] = [];
    for (const we of exercises) {
      const working = we.sets.filter((x) => !x.warmup);
      const prev = exerciseHistory(s, we.exerciseId);
      if (!working.length || !prev.length) continue;
      const prevBest = Math.max(...prev.map((p) => p.best1RM));
      const best = working.reduce((a, b) =>
        est1RM(b.weight ?? 0, b.reps ?? 0) > est1RM(a.weight ?? 0, a.reps ?? 0) ? b : a,
      );
      if (prevBest === 0 && (best.weight ?? 0) === 0) {
        const reps = Math.max(...working.map((x) => x.reps ?? 0));
        if (reps > Math.max(...prev.map((p) => p.maxReps))) prs.push({ exerciseId: we.exerciseId, weight: 0, reps });
      } else if (est1RM(best.weight ?? 0, best.reps ?? 0) > prevBest + 0.01) {
        prs.push({ exerciseId: we.exerciseId, weight: best.weight ?? 0, reps: best.reps ?? 0 });
      }
    }

    set((st) => ({ ...st, workouts: [workout, ...st.workouts], active: null, restEndsAt: null }));
    return { workout, prs, planUpdate };
  },

  /** Replaces a finished workout (used by History → Edit). Drops sets without reps. */
  updateWorkout(w: Workout) {
    const exercises = w.exercises
      .map((e) => ({ ...e, sets: e.sets.filter((x) => (x.reps ?? 0) > 0).map((x) => ({ ...x, done: true })) }))
      .filter((e) => e.sets.length > 0);
    set((s) => ({
      ...s,
      workouts: exercises.length
        ? s.workouts.map((x) => (x.id === w.id ? { ...w, name: w.name.trim() || x.name, exercises } : x))
        : s.workouts.filter((x) => x.id !== w.id),
    }));
  },

  /** First-run choice: replace the week with a template (or clear it). */
  finishOnboarding(plans: DayPlan[] | null) {
    set((s) => ({ ...s, plans: plans ?? s.plans, onboarded: true }));
  },

  /** Undo for "delete workout": puts it back in date order. */
  restoreWorkout(w: Workout) {
    set((s) =>
      s.workouts.some((x) => x.id === w.id)
        ? s
        : { ...s, workouts: [...s.workouts, w].sort((a, b) => b.startedAt - a.startedAt) },
    );
  },

  /** Undo for "discard workout". */
  restoreActive(w: Workout) {
    set((s) => (s.active ? s : { ...s, active: w }));
  },

  deleteWorkout(id: string) {
    set((s) => ({ ...s, workouts: s.workouts.filter((w) => w.id !== id) }));
  },

  /** Saves (or clears, when it has no exercises) the plan for one weekday. */
  savePlan(plan: DayPlan) {
    set((s) => {
      const rest = s.plans.filter((p) => p.day !== plan.day);
      const plans = plan.items.length ? [...rest, plan] : rest;
      return { ...s, plans: plans.sort((a, b) => a.day - b.day) };
    });
  },

  addExercise(e: Omit<Exercise, 'id' | 'custom'>): Exercise {
    const created: Exercise = { ...e, id: 'custom-' + uid(), custom: true };
    set((s) => ({ ...s, exercises: [...s.exercises, created] }));
    return created;
  },

  updateExercise(id: string, patch: Partial<Omit<Exercise, 'id'>>) {
    set((s) => ({ ...s, exercises: s.exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  },

  deleteExercise(id: string) {
    set((s) => ({
      ...s,
      exercises: s.exercises.filter((e) => e.id !== id),
      plans: s.plans.map((p) => ({ ...p, items: p.items.filter((i) => i.exerciseId !== id) })),
      active: s.active
        ? { ...s.active, exercises: s.active.exercises.filter((e) => e.exerciseId !== id) }
        : null,
    }));
  },

  startRest(seconds?: number) {
    const secs = seconds ?? state.settings.restSeconds;
    if (secs <= 0) return;
    set((s) => ({ ...s, restEndsAt: Date.now() + secs * 1000, restTotal: secs }));
  },

  adjustRest(deltaSeconds: number) {
    set((s) => {
      if (!s.restEndsAt) return s;
      const ends = s.restEndsAt + deltaSeconds * 1000;
      if (ends <= Date.now()) return { ...s, restEndsAt: null };
      return { ...s, restEndsAt: ends, restTotal: Math.max(1, s.restTotal + deltaSeconds) };
    });
  },

  stopRest() {
    set((s) => (s.restEndsAt ? { ...s, restEndsAt: null } : s));
  },

  addBodyWeight(kg: number, date: string) {
    set((s) => {
      const rest = s.bodyWeights.filter((b) => b.date !== date);
      const entry: BodyWeightEntry = { id: uid(), date, kg };
      return { ...s, bodyWeights: [entry, ...rest].sort((a, b) => b.date.localeCompare(a.date)) };
    });
  },

  /** Save a finished (or hand-entered) run. */
  addRun(run: RunEntry) {
    set((s) => ({ ...s, runs: [run, ...s.runs.filter((r) => r.id !== run.id)].sort((a, b) => b.startedAt - a.startedAt) }));
  },

  updateRun(id: string, patch: Partial<Omit<RunEntry, 'id'>>) {
    set((s) => ({ ...s, runs: s.runs.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  },

  deleteRun(id: string) {
    set((s) => ({ ...s, runs: s.runs.filter((r) => r.id !== id) }));
  },

  deleteBodyWeight(id: string) {
    set((s) => ({ ...s, bodyWeights: s.bodyWeights.filter((b) => b.id !== id) }));
  },

  updateSettings(patch: Partial<Settings>) {
    set((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },

  exportJSON(): string {
    return JSON.stringify(state, null, 2);
  },

  importJSON(text: string): boolean {
    try {
      const parsed = normalize(JSON.parse(text));
      if (!parsed) return false;
      set(() => parsed);
      return true;
    } catch {
      return false;
    }
  },

  resetAll() {
    set(() => initialState());
  },
};
