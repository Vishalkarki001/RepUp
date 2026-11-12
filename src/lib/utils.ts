import { useEffect, useState } from 'react';
import type { SetEntry, WeightUnit, Workout } from './types';

/** shadcn/ui class-name helper (clsx + tailwind-merge in one). */
export { cn } from 'cn';

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function newSet(): SetEntry {
  return { id: uid(), weight: null, reps: null, done: false };
}

/** Epley estimated one-rep max. */
export function est1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function setVolume(s: SetEntry): number {
  return s.done ? (s.weight ?? 0) * (s.reps ?? 0) : 0;
}

export function workoutVolume(w: Workout): number {
  return w.exercises.reduce((sum, e) => sum + e.sets.reduce((a, s) => a + setVolume(s), 0), 0);
}

export function workoutSetCount(w: Workout): number {
  return w.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.done).length, 0);
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
}

export function formatDate(ts: number | string, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof ts === 'string' ? new Date(ts + 'T00:00:00') : new Date(ts);
  return d.toLocaleDateString('en-IN', opts ?? { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatKg(n: number): string {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? r.toString() : r.toFixed(1);
}

/* Weight unit: a display label only (numbers are stored as the user typed them). */
let currentUnit: WeightUnit = 'kg';
export function setUnit(u: WeightUnit): void {
  currentUnit = u;
}
export function unitLabel(): WeightUnit {
  return currentUnit;
}
/** "62.5 kg" / "135 lb" */
export function formatW(n: number): string {
  return `${formatKg(n)} ${currentUnit}`;
}

export function formatVolume(n: number): string {
  if (n >= 10000) return currentUnit === 'kg' ? `${(n / 1000).toFixed(1)}t` : `${(n / 1000).toFixed(1)}k lb`;
  return `${Math.round(n).toLocaleString('en-IN')} ${currentUnit}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Monday 00:00 of the week containing ts. */
export function startOfWeek(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.getTime();
}

export function defaultWorkoutName(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Morning Workout';
  if (h < 17) return 'Afternoon Workout';
  return 'Evening Workout';
}

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

let audioCtx: AudioContext | null = null;

/** Must be called from a user gesture so the beep can play later. */
export function unlockAudio(): void {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
  } catch {
    /* audio unsupported */
  }
}

export function beep(): void {
  try {
    navigator.vibrate?.([200, 100, 200]);
    if (!audioCtx) return;
    const ctx = audioCtx;
    [0, 0.25, 0.5].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.2);
    });
  } catch {
    /* ignore */
  }
}

/** Keeps the phone screen on while `on` is true (re-acquired when the app comes back to the front). */
export function useWakeLock(on: boolean): void {
  useEffect(() => {
    if (!on || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = async () => {
      try {
        if (document.visibilityState !== 'visible') return;
        lock = await navigator.wakeLock.request('screen');
        if (cancelled) void lock.release();
      } catch {
        /* denied, low battery, unsupported */
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire();
    };
    void acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release().catch(() => {});
    };
  }, [on]);
}
