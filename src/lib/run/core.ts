/**
 * Running maths, kept free of browser APIs so it can be tested:
 * GPS distance, the live tracking state, splits, steps and calories.
 */
import type { RunEntry, RunKind } from '../types';

export interface Fix {
  lat: number;
  lng: number;
  /** Accuracy radius in metres. */
  acc: number;
  /** Time of the fix (ms). */
  t: number;
}

export type TrackStatus = 'idle' | 'locating' | 'running' | 'paused';

export interface TrackState {
  status: TrackStatus;
  kind: RunKind;
  /** When the run (not the GPS search) started. */
  startedAt: number;
  /** Moving time collected before the current stretch. */
  activeMs: number;
  /** Start of the current moving stretch, null while paused. */
  resumedAt: number | null;
  distanceM: number;
  route: [number, number][];
  /** Moving seconds at which each full km was reached. */
  kmMarks: number[];
  lastFix: Fix | null;
  /** Fixes in a row rejected as impossible jumps. */
  rejected: number;
  steps: number;
  /** Seconds where fixes stopped (screen off / app in background). */
  gapS: number;
  /** Metres added across those gaps (the phone wasn't tracking). */
  gapM?: number;
  /** Steps added by estimate for screen-off gaps (the rest were counted by the sensor). */
  stepsGuessed?: number;
  /** Latest GPS accuracy, for the "weak GPS" hint. */
  accuracy: number | null;
  tempC: number | null;
  weatherCode: number | null;
}

export const MAX_ACCURACY_M = 35;
const JITTER_M = 3;
const ROUTE_STEP_M = 8;
const GAP_S = 20;
/** Faster than this between two fixes is a GPS jump, not you. */
export const MAX_SPEED: Record<RunKind, number> = { run: 9, walk: 4.5 };

export function newTrack(kind: RunKind, now: number): TrackState {
  return {
    status: 'locating',
    kind,
    startedAt: now,
    activeMs: 0,
    resumedAt: null,
    distanceM: 0,
    route: [],
    kmMarks: [],
    lastFix: null,
    rejected: 0,
    steps: 0,
    gapS: 0,
    gapM: 0,
    accuracy: null,
    tempC: null,
    weatherCode: null,
  };
}

/** Great-circle distance in metres. */
export function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function movingMs(s: TrackState, now: number): number {
  return s.activeMs + (s.resumedAt !== null ? Math.max(0, now - s.resumedAt) : 0);
}

const round5 = (n: number) => Math.round(n * 1e5) / 1e5;

/** Start the clock (after the GPS search, or straight away). */
export function begin(s: TrackState, now: number): TrackState {
  if (s.status !== 'locating') return s;
  return { ...s, status: 'running', startedAt: now, resumedAt: now };
}

export function pause(s: TrackState, now: number): TrackState {
  if (s.status !== 'running') return s;
  // Forget the last fix so no distance is counted across the pause.
  return { ...s, status: 'paused', activeMs: movingMs(s, now), resumedAt: null, lastFix: null };
}

export function resume(s: TrackState, now: number): TrackState {
  if (s.status !== 'paused') return s;
  return { ...s, status: 'running', resumedAt: now, lastFix: null };
}

/** Feed one GPS fix into the run. */
export function addFix(s: TrackState, fix: Fix, now: number): TrackState {
  const next = { ...s, accuracy: fix.acc };
  if (s.status !== 'running') return next;
  if (fix.acc > MAX_ACCURACY_M) return next;

  const point: [number, number] = [round5(fix.lat), round5(fix.lng)];
  if (!s.lastFix) {
    const route = s.route.length && haversine(s.route[s.route.length - 1][0], s.route[s.route.length - 1][1], fix.lat, fix.lng) < ROUTE_STEP_M ? s.route : [...s.route, point];
    return { ...next, lastFix: fix, route };
  }

  const d = haversine(s.lastFix.lat, s.lastFix.lng, fix.lat, fix.lng);
  if (d < JITTER_M) return next; // standing still: keep the old anchor so slow steps still add up
  const dt = Math.max(0.001, (fix.t - s.lastFix.t) / 1000);
  if (d / dt > MAX_SPEED[s.kind]) {
    // A jump. After a few in a row, trust the new position but don't count the jump.
    return s.rejected >= 2 ? { ...next, lastFix: fix, rejected: 0 } : { ...next, rejected: s.rejected + 1 };
  }

  const distanceM = s.distanceM + d;
  const gapS = dt > GAP_S ? s.gapS + dt : s.gapS;
  const gapM = dt > GAP_S ? (s.gapM ?? 0) + d : (s.gapM ?? 0);
  const last = s.route[s.route.length - 1];
  const route = !last || haversine(last[0], last[1], fix.lat, fix.lng) >= ROUTE_STEP_M ? [...s.route, point] : s.route;
  const kmMarks = [...s.kmMarks];
  const sec = movingMs(s, now) / 1000;
  while (distanceM >= (kmMarks.length + 1) * 1000) kmMarks.push(sec);
  return { ...next, lastFix: fix, rejected: 0, distanceM, gapS, gapM, route, kmMarks };
}

/* ------------------------------------------------------------------ */
/* screen-off gaps                                                      */
/* ------------------------------------------------------------------ */

/**
 * A stretch where the phone stopped tracking (screen off, app closed). Browsers
 * give no GPS or step readings then, so on return we ask whether you kept
 * moving and fill the gap from your pace and step rhythm just before it.
 */
export interface Gap {
  /** When tracking stopped / came back (ms). */
  from: number;
  to: number;
  /** Last position before the gap (for the straight-line distance). */
  fromFix: Fix | null;
  /** Speed (m/s) and step rhythm (steps a minute, from the sensor) just before. Null when unknown. */
  speed: number | null;
  cadence: number | null;
  /** The phone closed the app (the run was brought back paused). */
  restored?: boolean;
}

/** moving: you kept going · stopped: you rested (the time doesn't count) · line: not sure (straight line only). */
export type GapAnswer = 'moving' | 'stopped' | 'line';

/** Shortest gap worth asking about. */
export const GAP_ASK_S = 20;

/**
 * When the gap comes too early to know your own rhythm (e.g. 15 steps in):
 * typical step rate (steps a minute) and speed (m/s) for a steady walk / easy run.
 */
export const TYPICAL_CADENCE: Record<RunKind, number> = { walk: 110, run: 165 };
export const TYPICAL_SPEED: Record<RunKind, number> = { walk: 1.35, run: 2.8 };

/** What a gap adds for each answer (also shown on the buttons). */
export function gapFill(g: Gap, answer: GapAnswer, kind: RunKind, toFix: Fix | null): { distanceM: number; steps: number; countTime: boolean } {
  const seconds = Math.max(0, (g.to - g.from) / 1000);
  const line = g.fromFix && toFix ? haversine(g.fromFix.lat, g.fromFix.lng, toFix.lat, toFix.lng) : 0;
  const cap = MAX_SPEED[kind] * seconds; // never faster than a person can move
  if (answer === 'moving') {
    // Your own pace and rhythm from just before; typical ones if the gap came too early to know them.
    const speed = g.speed && g.speed > 0.3 ? g.speed : TYPICAL_SPEED[kind];
    const distanceM = Math.min(cap, Math.max(line, speed * seconds));
    const cadence = g.cadence && g.cadence > 30 ? g.cadence : g.speed && g.speed > 0.3 ? null : TYPICAL_CADENCE[kind];
    const steps = cadence ? Math.round((cadence * seconds) / 60) : estimateSteps(distanceM, kind);
    return { distanceM, steps, countTime: true };
  }
  const distanceM = Math.min(cap, line);
  return { distanceM, steps: estimateSteps(distanceM, kind), countTime: answer === 'line' };
}

/**
 * Adds a gap to the run: distance, km marks inside it, and the time
 * (removed when you say you stopped; added back when the app had been closed).
 * Returns the steps to add to the step count.
 */
export function applyGap(s: TrackState, g: Gap, answer: GapAnswer, toFix: Fix | null, now: number): { track: TrackState; addSteps: number } {
  const fill = gapFill(g, answer, s.kind, toFix);
  const ms = Math.max(0, g.to - g.from);
  let { activeMs, resumedAt } = s;
  if (g.restored) {
    // The run was brought back paused at the moment it was last saved: the gap isn't in the clock yet.
    if (fill.countTime) activeMs += ms;
  } else if (!fill.countTime && resumedAt !== null) {
    // Running clock already includes the gap: take it out.
    resumedAt = Math.min(now, resumedAt + ms);
  }
  const startSec = (g.restored ? s.activeMs : movingMs(s, g.from)) / 1000;
  const gapSec = fill.countTime ? ms / 1000 : 0;
  const kmMarks = [...s.kmMarks];
  const distanceM = s.distanceM + fill.distanceM;
  while (distanceM >= (kmMarks.length + 1) * 1000) {
    const into = (kmMarks.length + 1) * 1000 - s.distanceM;
    kmMarks.push(Math.round((startSec + (fill.distanceM > 0 ? (into / fill.distanceM) * gapSec : gapSec)) * 10) / 10);
  }
  return {
    track: {
      ...s,
      activeMs,
      resumedAt,
      distanceM,
      kmMarks,
      gapS: s.gapS + ms / 1000,
      gapM: (s.gapM ?? 0) + fill.distanceM,
      stepsGuessed: (s.stepsGuessed ?? 0) + fill.steps,
    },
    addSteps: fill.steps,
  };
}

/**
 * Smooths noisy GPS positions with a simple Kalman filter (what most run
 * trackers do): each new fix moves the estimate in proportion to how much it
 * can be trusted (its accuracy) versus how far you could have moved since.
 */
export class GpsSmoother {
  private lat = 0;
  private lng = 0;
  private variance = -1;
  private t = 0;

  /** How fast you might be moving, in m/s (sets how quickly it follows). */
  private speed: number;

  constructor(speed: number) {
    this.speed = speed;
  }

  reset() {
    this.variance = -1;
  }

  push(f: Fix): Fix {
    const acc = Math.max(f.acc, 1);
    if (this.variance < 0) {
      this.lat = f.lat;
      this.lng = f.lng;
      this.t = f.t;
      this.variance = acc * acc;
      return f;
    }
    const dt = (f.t - this.t) / 1000;
    if (dt > 0) {
      this.variance += dt * this.speed * this.speed;
      this.t = f.t;
    }
    // Degrees → metres don't matter here: the gain is a ratio of variances.
    const k = this.variance / (this.variance + acc * acc);
    this.lat += k * (f.lat - this.lat);
    this.lng += k * (f.lng - this.lng);
    this.variance = (1 - k) * this.variance;
    return { ...f, lat: this.lat, lng: this.lng };
  }
}

/** Expected speed for the smoother. */
// Tuned on simulated noisy routes (straight, track loop, city turns): within ~5% where raw GPS was up to 65% over.
export const SMOOTH_SPEED: Record<RunKind, number> = { run: 2.5, walk: 1 };

/* ------------------------------------------------------------------ */
/* numbers shown to people                                              */
/* ------------------------------------------------------------------ */

/** Typical step length when the motion sensor isn't available. */
const STEP_M: Record<RunKind, number> = { run: 1.0, walk: 0.75 };
export const estimateSteps = (distanceM: number, kind: RunKind) => Math.round(distanceM / STEP_M[kind]);

/** Common rule of thumb: about 1 kcal per kg per km running, about half that walking. */
export const estimateCalories = (distanceM: number, kind: RunKind, weightKg: number) =>
  Math.round((kind === 'run' ? 1.0 : 0.5) * weightKg * (distanceM / 1000));

/** Seconds per km, or null before 50 m. */
export const paceSecPerKm = (distanceM: number, seconds: number) => (distanceM >= 50 && seconds > 0 ? seconds / (distanceM / 1000) : null);

export function formatDuration(totalS: number): string {
  const s = Math.max(0, Math.round(totalS));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

/** 7'05" per km */
export function formatPace(secPerKm: number | null): string {
  if (secPerKm === null || !Number.isFinite(secPerKm) || secPerKm > 60 * 60) return '–';
  const s = Math.round(secPerKm);
  return `${Math.floor(s / 60)}'${String(s % 60).padStart(2, '0')}"`;
}

export const formatKm = (m: number) => (m / 1000).toFixed(m >= 100_000 ? 1 : 2);

/** Keep at most `max` points, evenly spread (always keeps the first and last). */
export function thin<T>(points: T[], max = 1500): T[] {
  if (points.length <= max) return points;
  const step = (points.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => points[Math.round(i * step)]);
}

/** Turn the live state into the saved run. */
export function finishRun(
  s: TrackState,
  now: number,
  opts: { id: string; weightKg: number; sensorSteps: number | null },
): RunEntry {
  const durationS = Math.round(movingMs(s, now) / 1000);
  const distanceM = Math.round(s.distanceM);
  const steps = opts.sensorSteps !== null && opts.sensorSteps > 0 ? opts.sensorSteps : distanceM > 0 ? estimateSteps(distanceM, s.kind) : null;
  const splits = s.kmMarks.map((t, i) => Math.round(t - (i ? s.kmMarks[i - 1] : 0)));
  return {
    id: opts.id,
    kind: s.kind,
    startedAt: s.startedAt,
    finishedAt: now,
    durationS,
    distanceM,
    steps,
    // Counted by the sensor the whole way → 'sensor'; partly worked out from distance (screen was off) → 'estimate' (shown with ~).
    stepsSource: steps === null ? undefined : opts.sensorSteps !== null && opts.sensorSteps > 0 && !(s.stepsGuessed ?? 0) ? 'sensor' : 'estimate',
    calories: estimateCalories(distanceM, s.kind, opts.weightKg),
    tempC: s.tempC,
    weatherCode: s.weatherCode,
    route: thin(s.route),
    splits,
    gapS: Math.round(s.gapS),
    source: 'gps',
  };
}

/* ------------------------------------------------------------------ */
/* step counting from the motion sensor                                 */
/* ------------------------------------------------------------------ */

/**
 * Counts steps from accelerometer readings (m/s², including gravity):
 * smooth the signal, follow its slow baseline, count a step on each clear
 * rise above it, at most ~4 steps a second.
 */
export class StepDetector {
  private smooth = 9.81;
  private base = 9.81;
  private above = false;
  private lastStep = 0;
  steps = 0;

  push(magnitude: number, t: number): boolean {
    this.smooth += 0.25 * (magnitude - this.smooth);
    this.base += 0.02 * (magnitude - this.base);
    const diff = this.smooth - this.base;
    if (!this.above && diff > 1.2 && t - this.lastStep > 250) {
      this.above = true;
      this.lastStep = t;
      this.steps++;
      return true;
    }
    if (this.above && diff < 0.3) this.above = false;
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* weather                                                              */
/* ------------------------------------------------------------------ */

/** WMO weather code → emoji + words (Open-Meteo codes). */
export function weatherLabel(code: number | null | undefined): { emoji: string; text: string } | null {
  if (code === null || code === undefined) return null;
  if (code === 0) return { emoji: '☀️', text: 'Clear' };
  if (code <= 3) return { emoji: '⛅', text: 'Partly cloudy' };
  if (code === 45 || code === 48) return { emoji: '🌫️', text: 'Fog' };
  if (code >= 51 && code <= 57) return { emoji: '🌦️', text: 'Drizzle' };
  if (code >= 61 && code <= 67) return { emoji: '🌧️', text: 'Rain' };
  if (code >= 71 && code <= 77) return { emoji: '❄️', text: 'Snow' };
  if (code >= 80 && code <= 82) return { emoji: '🌦️', text: 'Showers' };
  if (code >= 85 && code <= 86) return { emoji: '🌨️', text: 'Snow showers' };
  if (code >= 95) return { emoji: '⛈️', text: 'Thunderstorm' };
  return { emoji: '🌡️', text: 'Weather' };
}
