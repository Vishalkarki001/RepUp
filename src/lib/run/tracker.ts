'use client';

import { useSyncExternalStore } from 'react';
import { actions, getState } from '../store';
import type { RunEntry, RunKind } from '../types';
import { uid } from '../utils';
import { addFix, begin, finishRun as buildRun, GpsSmoother, MAX_ACCURACY_M, newTrack, pause, resume, SMOOTH_SPEED, StepDetector, type TrackState } from './core';

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

function emit(next: Partial<RunSnapshot>, forceSave = false) {
  const prevStatus = snap.track?.status;
  snap = { ...snap, ...next };
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
    else localStorage.setItem(SAVE_KEY, JSON.stringify({ track: snap.track, motion: snap.motion, savedAt: Date.now() }));
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
    const saved = JSON.parse(raw) as { track: TrackState; motion: boolean; savedAt: number };
    if (!saved?.track || (saved.track.status !== 'running' && saved.track.status !== 'paused')) return;
    const track = saved.track.status === 'running' ? pause(saved.track, saved.savedAt) : saved.track;
    detector = new StepDetector();
    detector.steps = track.steps;
    snap = { track, problem: null, motion: saved.motion };
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
  const raw = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy, t: p.timestamp || Date.now() };
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
  emit({ track: addFix(track, fix, now) });
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

// Some phones stop the GPS watch while the app is in the background: restart it on return.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || snap.track?.status !== 'running') return;
    stopWatch();
    startWatch();
  });
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
  emit({ track: newTrack(kind, Date.now()), problem: null, motion: false }, true);
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
  emit({ track: null, problem: null, motion: false }, true);
  return run;
}

export function discardRun() {
  stopSensors();
  emit({ track: null, problem: null, motion: false }, true);
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
