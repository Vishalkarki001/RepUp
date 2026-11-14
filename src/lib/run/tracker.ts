'use client';

import { useSyncExternalStore } from 'react';
import { actions, getState } from '../store';
import type { RunEntry, RunKind } from '../types';
import { uid } from '../utils';
import {
  addFix,
  applyGap,
  begin,
  finishRun as buildRun,
  GAP_ASK_S,
  GpsSmoother,
  MAX_ACCURACY_M,
  movingMs,
  newTrack,
  pause,
  resume,
  SMOOTH_SPEED,
  StepDetector,
  type Fix,
  type Gap,
  type GapAnswer,
  type TrackState,
} from './core';

/**
 * The live run: GPS (watchPosition), steps (motion sensor), weather, and a
 * copy on the device so a run survives the app being closed by the phone.
 *
 * Browsers only track while the page is open and the screen is on, so the
 * run screen keeps the screen awake and tells people to keep the app open.
 */

export type RunProblem = 'denied' | 'unsupported' | null;
export interface RunSnapshot {
  track: TrackState | null;
  problem: RunProblem;
  /** True once the motion sensor has sent readings (real step counting). */
  motion: boolean;
  /** The phone stopped tracking for a while (screen off / app closed): waiting for "did you keep moving?". */
  gap?: Gap | null;
}

const SAVE_KEY = 'repup:active-run';
const LOCATE_TIMEOUT_MS = 10_000;

let snap: RunSnapshot = { track: null, problem: null, motion: false };
let watchId: number | null = null;
let locateTimer: ReturnType<typeof setTimeout> | null = null;
let detector = new StepDetector();
let smoother = new GpsSmoother(SMOOTH_SPEED.run);
let motionOn = false;
let weatherAsked = false;
let lastSave = 0;
const listeners = new Set<() => void>();

/* Recent pace and step rhythm, to fill a screen-off gap. One sample a second at most. */
type Sample = { t: number; d: number; steps: number };
let samples: Sample[] = [];
function sample(track: TrackState) {
  if (track.status !== 'running') return;
  const t = Date.now();
  if (samples.length && t - samples[samples.length - 1].t < 1000) return;
  samples.push({ t, d: track.distanceM, steps: track.steps });
  if (samples.length > 240) samples = samples.slice(-180);
}
/** Speed (m/s) and steps a minute over about the last 1–2 minutes; whole-run averages as a fallback. */
function recentStats(track: TrackState, now: number): { speed: number | null; cadence: number | null } {
  const recent = samples.filter((x) => now - x.t <= 120_000);
  const first = recent[0];
  const span = first ? (now - first.t) / 1000 : 0;
  if (first && span >= 20) {
    return {
      speed: Math.max(0, (track.distanceM - first.d) / span),
      cadence: snap.motion ? Math.max(0, ((track.steps - first.steps) / span) * 60) : null,
    };
  }
  const sec = movingMs(track, now) / 1000;
  if (sec < 20) return { speed: null, cadence: null };
  return { speed: track.distanceM / sec, cadence: snap.motion ? (track.steps / sec) * 60 : null };
}
/** Where tracking stopped when the page was hidden. */
let hidden: { at: number; fromFix: Fix | null; speed: number | null; cadence: number | null } | null = null;
/** First good position after a gap (for the straight-line distance across it). */
let gapToFix: Fix | null = null;
/** When the last GPS reading arrived (any reading, even standing still). */
let lastSeenAt = 0;

function emit(next: Partial<RunSnapshot>, forceSave = false) {
  const prevStatus = snap.track?.status;
  snap = { ...snap, ...next };
  if (snap.track) sample(snap.track);
  const now = Date.now();
  if (forceSave || snap.track?.status !== prevStatus || now - lastSave > 3000) {
    lastSave = now;
    persist();
  }
  listeners.forEach((l) => l());
}

function persist() {
  try {
    if (!snap.track || snap.track.status === 'locating') localStorage.removeItem(SAVE_KEY);
    else {
      const now = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify({ track: snap.track, motion: snap.motion, savedAt: now, stats: recentStats(snap.track, now) }));
    }
  } catch {
    /* storage blocked */
  }
}

/** A run left on the device (the phone closed the app): bring it back paused. */
function restore() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as {
      track: TrackState;
      motion: boolean;
      savedAt: number;
      stats?: { speed: number | null; cadence: number | null };
    };
    if (!saved?.track || (saved.track.status !== 'running' && saved.track.status !== 'paused')) return;
    const wasRunning = saved.track.status === 'running';
    const track = wasRunning ? pause(saved.track, saved.savedAt) : saved.track;
    detector = new StepDetector();
    detector.steps = track.steps;
    // The phone closed RepUp mid-run: ask what happened in between (up to 3 hours later).
    const away = Date.now() - saved.savedAt;
    const gap: Gap | null =
      wasRunning && away >= GAP_ASK_S * 1000 && away <= 3 * 3600_000
        ? { from: saved.savedAt, to: Date.now(), fromFix: saved.track.lastFix, speed: saved.stats?.speed ?? null, cadence: saved.stats?.cadence ?? null, restored: true }
        : null;
    snap = { track, problem: null, motion: saved.motion, gap };
  } catch {
    /* unreadable */
  }
}
restore();

/* ------------------------------------------------------------------ */
/* sensors                                                              */
/* ------------------------------------------------------------------ */

function onPosition(p: GeolocationPosition) {
  let track = snap.track;
  if (!track) return;
  // Time = when the reading reached us. A position's own timestamp can be old (a cached first fix)
  // or off by seconds on some phones, which would look like a gap in tracking.
  const raw = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy, t: Date.now() };
  // While the page is hidden (screen off), a reading after a long silence means the phone had stopped
  // GPS: don't join it with a straight line, ask instead. (With the screen on, a silence is just
  // standing still or weak GPS, handled by addFix as before.)
  const receivedAt = Date.now();
  const prev = track.lastFix;
  if (hidden && track.status === 'running' && !snap.gap && prev && lastSeenAt && receivedAt - lastSeenAt >= GAP_ASK_S * 1000) {
    gapToFix = raw;
    smoother = new GpsSmoother(SMOOTH_SPEED[track.kind]); // start fresh here, not sliding over from the old spot
    track = { ...track, lastFix: null };
    snap = { ...snap, gap: { from: lastSeenAt, to: receivedAt, fromFix: prev, speed: hidden.speed, cadence: hidden.cadence } };
  }
  lastSeenAt = receivedAt;
  // Smooth only usable fixes (a 200 m-wide reading would drag the estimate away).
  const fix = raw.acc <= MAX_ACCURACY_M && track.status === 'running' ? { ...smoother.push(raw), acc: raw.acc } : raw;
  const now = Date.now();
  if (track.status === 'locating' && fix.acc <= 50) {
    if (locateTimer) clearTimeout(locateTimer);
    locateTimer = null;
    track = begin(track, now);
    smoother.reset();
  }
  if (!weatherAsked) {
    weatherAsked = true;
    void loadWeather(fix.lat, fix.lng);
  }
  if (snap.gap && !gapToFix && raw.acc <= MAX_ACCURACY_M) gapToFix = raw;
  emit({ track: addFix(track, fix, now) }, !!snap.gap);
}

function onPositionError(e: GeolocationPositionError) {
  if (e.code !== e.PERMISSION_DENIED) return; // weak signal / timeout: keep waiting
  if (snap.track?.status === 'locating') {
    stopSensors();
    emit({ track: null, problem: 'denied' }, true);
  } else emit({ problem: 'denied' });
}

function startWatch() {
  if (watchId !== null || typeof navigator === 'undefined' || !navigator.geolocation) return;
  watchId = navigator.geolocation.watchPosition(onPosition, onPositionError, { enableHighAccuracy: true, maximumAge: 0, timeout: 30_000 });
}

function stopWatch() {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
}

function onMotion(e: DeviceMotionEvent) {
  const a = e.accelerationIncludingGravity;
  if (!a || a.x === null || a.y === null || a.z === null) return;
  if (!snap.motion) emit({ motion: true });
  const track = snap.track;
  if (!track || track.status !== 'running') return;
  if (detector.push(Math.hypot(a.x, a.y, a.z), e.timeStamp || performance.now())) {
    emit({ track: { ...track, steps: detector.steps } });
  }
}

/** iPhone asks for motion permission, and only from a tap: call this inside the button handler. */
async function askMotion(): Promise<void> {
  const D = typeof DeviceMotionEvent !== 'undefined' ? (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }) : null;
  try {
    if (D?.requestPermission) await D.requestPermission();
  } catch {
    /* refused: steps will be estimated from the distance */
  }
}

function startMotion() {
  if (motionOn || typeof window === 'undefined') return;
  window.addEventListener('devicemotion', onMotion);
  motionOn = true;
}

function stopMotion() {
  if (!motionOn) return;
  window.removeEventListener('devicemotion', onMotion);
  motionOn = false;
}

function stopSensors() {
  stopWatch();
  stopMotion();
  if (locateTimer) clearTimeout(locateTimer);
  locateTimer = null;
}

/** Current weather at the start (Open-Meteo: free, no key). Position rounded to ~1 km. */
async function loadWeather(lat: number, lng: number) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lng.toFixed(2)}&current=temperature_2m,weather_code`;
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return;
    const data = (await res.json()) as { current?: { temperature_2m?: number; weather_code?: number } };
    const track = snap.track;
    if (!track || typeof data.current?.temperature_2m !== 'number') return;
    emit({ track: { ...track, tempC: Math.round(data.current.temperature_2m * 10) / 10, weatherCode: data.current.weather_code ?? null } });
  } catch {
    /* offline: no weather this time */
  }
}

// Screen off / another app: browsers stop GPS and the step sensor. Remember where we were,
// and on return ask whether you kept moving (see answerGap). Also restart the GPS watch:
// some phones don't resume it by themselves.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    const track = snap.track;
    if (document.visibilityState === 'hidden') {
      if (track?.status === 'running' && !snap.gap) {
        const now = Date.now();
        hidden = { at: now, fromFix: track.lastFix, ...recentStats(track, now) };
        persist();
      }
      return;
    }
    if (track?.status !== 'running') return;
    const back = Date.now();
    // Measured from the last GPS reading: if the browser kept sending GPS while hidden, that was real tracking.
    const from = Math.max(hidden?.at ?? back, lastSeenAt);
    if (hidden && !snap.gap && back - from >= GAP_ASK_S * 1000) {
      gapToFix = null;
      // Start the GPS smoothing fresh where you are now (else it slides over from the old spot and counts that twice).
      smoother = new GpsSmoother(SMOOTH_SPEED[track.kind]);
      // Don't join the gap automatically: it's filled once you answer.
      emit({ track: { ...track, lastFix: null }, gap: { from, to: back, fromFix: track.lastFix ?? hidden.fromFix, speed: hidden.speed, cadence: hidden.cadence } }, true);
    }
    hidden = null;
    stopWatch();
    startWatch();
  });
}

/** "Did you keep moving while the screen was off?" Fills the gap and carries on. */
export async function answerGap(answer: GapAnswer): Promise<void> {
  const track = snap.track;
  const gap = snap.gap;
  if (!track || !gap) return;
  const toFix = gapToFix ?? track.lastFix;
  const { track: filled, addSteps } = applyGap(track, gap, answer, toFix, Date.now());
  detector.steps = track.steps + addSteps;
  gapToFix = null;
  emit({ track: { ...filled, steps: detector.steps }, gap: null }, true);
  // The app had been closed and the run came back paused: if you kept going, keep going.
  if (gap.restored && answer === 'moving') await resumeRun();
}

/* ------------------------------------------------------------------ */
/* actions (call from button taps)                                      */
/* ------------------------------------------------------------------ */

export async function startRun(kind: RunKind): Promise<void> {
  if (snap.track) return;
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    emit({ problem: 'unsupported' });
    return;
  }
  await askMotion();
  detector = new StepDetector();
  smoother = new GpsSmoother(SMOOTH_SPEED[kind]);
  weatherAsked = false;
  samples = [];
  hidden = null;
  gapToFix = null;
  lastSeenAt = 0;
  emit({ track: newTrack(kind, Date.now()), problem: null, motion: false, gap: null }, true);
  startWatch();
  startMotion();
  // Weak GPS: start the clock anyway after a few seconds.
  locateTimer = setTimeout(() => {
    locateTimer = null;
    if (snap.track?.status === 'locating') emit({ track: begin(snap.track, Date.now()) });
  }, LOCATE_TIMEOUT_MS);
}

/** Skip waiting for GPS. */
export function startNow() {
  if (snap.track?.status !== 'locating') return;
  if (locateTimer) clearTimeout(locateTimer);
  locateTimer = null;
  emit({ track: begin(snap.track, Date.now()) });
}

export function pauseRun() {
  if (snap.track) emit({ track: pause(snap.track, Date.now()) }, true);
}

export async function resumeRun() {
  if (!snap.track) return;
  await askMotion();
  smoother = new GpsSmoother(SMOOTH_SPEED[snap.track.kind]); // start fresh where you are now
  startWatch();
  startMotion();
  emit({ track: resume(snap.track, Date.now()), problem: null }, true);
}

/** Body weight for calories: latest entry (converted from lb if needed), else 70 kg. */
export function weightKgForCalories(): number {
  const s = getState();
  const latest = s.bodyWeights[0]?.kg;
  if (!latest) return 70;
  return s.settings.unit === 'lb' ? latest * 0.4536 : latest;
}

/** Stop, save and return the run. */
export function finishRun(): RunEntry | null {
  const track = snap.track;
  if (!track) return null;
  stopSensors();
  const run = buildRun(track, Date.now(), { id: uid(), weightKg: weightKgForCalories(), sensorSteps: snap.motion ? track.steps : null });
  actions.addRun(run);
  samples = [];
  emit({ track: null, problem: null, motion: false, gap: null }, true);
  return run;
}

export function discardRun() {
  stopSensors();
  samples = [];
  emit({ track: null, problem: null, motion: false, gap: null }, true);
}

export function clearRunProblem() {
  emit({ problem: null });
}

/** Remove a saved live run from this device (on sign out). */
export function forgetActiveRun() {
  stopSensors();
  snap = { track: null, problem: null, motion: false };
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* storage blocked */
  }
  listeners.forEach((l) => l());
}

const SERVER: RunSnapshot = { track: null, problem: null, motion: false };
export function useRun(): RunSnapshot {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snap,
    () => SERVER,
  );
}
