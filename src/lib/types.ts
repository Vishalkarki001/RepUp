/**
 * Data model. Every record has a string id so the same shapes can later be
 * stored in a database (one table per interface) once login + DB are added.
 */

export const MUSCLES = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Glutes',
  'Core',
  'Full Body',
] as const;
export type Muscle = (typeof MUSCLES)[number];

export const EQUIPMENT = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Kettlebell',
  'Other',
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

/** 0 = Sunday … 6 = Saturday (same as Date#getDay). */
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export interface Exercise {
  id: string;
  name: string;
  muscle: Muscle;
  equipment: Equipment;
  custom?: boolean;
  /** Sticky note shown every time, e.g. "seat height 4". */
  note?: string;
}

export interface SetEntry {
  id: string;
  weight: number | null; // kg; 0 / empty = bodyweight
  reps: number | null;
  done: boolean;
  /** Warm-up sets are ignored for "last time", targets and PRs. */
  warmup?: boolean;
}

export interface RepRange {
  repMin: number;
  repMax: number;
}

export interface WorkoutExercise extends RepRange {
  id: string;
  exerciseId: string;
  sets: SetEntry[];
}

export interface Workout {
  id: string;
  name: string;
  /** Weekday plan this workout was started from (0 = Sun). */
  day?: number;
  /** Legacy (v2) routine id — kept so old backups still load. */
  routineId?: string;
  startedAt: number;
  finishedAt?: number;
  exercises: WorkoutExercise[];
  note?: string;
}

/** One exercise in a day's plan: "3 sets × 10 reps". */
export interface PlanItem {
  exerciseId: string;
  sets: number;
  reps: number;
  /** Starting weight in kg (optional). Used until the exercise has history. */
  weight?: number | null;
}

/** What to train on a weekday. A day without a plan is a rest day. */
export interface DayPlan {
  day: number; // 0 = Sun … 6 = Sat
  name: string;
  items: PlanItem[];
}

export interface BodyWeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  kg: number;
}

export type WeightUnit = 'kg' | 'lb';

/** Which side of the app is shown: gym workouts or running. */
export type AppMode = 'workout' | 'running';

export type RunKind = 'run' | 'walk';

/** One finished run or walk. Distances in metres, times in seconds. */
export interface RunEntry {
  id: string;
  kind: RunKind;
  startedAt: number;
  finishedAt: number;
  /** Moving time (pauses not counted). */
  durationS: number;
  distanceM: number;
  /** Counted with the motion sensor, or estimated from the distance. Null when unknown. */
  steps: number | null;
  stepsSource?: 'sensor' | 'estimate';
  /** Estimate from distance and body weight. */
  calories: number;
  tempC?: number | null;
  weatherCode?: number | null;
  /** Simplified GPS route: [latitude, longitude] points. */
  route?: [number, number][];
  /** Seconds taken for each full kilometre. */
  splits?: number[];
  /** Seconds the GPS was interrupted (screen off / app in the background). */
  gapS?: number;
  source: 'gps' | 'manual';
  note?: string;
}

export interface Settings {
  restSeconds: number;
  /** Reps used when an exercise is added without a plan. */
  defaultReps: number;
  /** Label + plate/step sizes. Numbers are stored as typed, not converted. */
  unit: WeightUnit;
  mode: AppMode;
}

export interface AppState {
  version: 3;
  exercises: Exercise[];
  plans: DayPlan[];
  workouts: Workout[]; // finished workouts, newest first
  active: Workout | null;
  restEndsAt: number | null;
  restTotal: number;
  bodyWeights: BodyWeightEntry[]; // newest first
  runs: RunEntry[]; // newest first
  settings: Settings;
  /** False until the first-run plan picker has been answered. */
  onboarded: boolean;
}

export interface PersonalRecord {
  exerciseId: string;
  weight: number;
  reps: number;
}

export interface WorkoutSummary {
  workout: Workout;
  prs: PersonalRecord[];
  /** Set when the finished workout differs from its day plan (added/removed exercises, sets, reps). */
  planUpdate?: DayPlan;
}
