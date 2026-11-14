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

/** Keeps the phone screen on while `on` is true (re-acquired when the app comes back to the front). */
export function useWakeLock(on: boolean): void {
  useEffect(() => {
    if (!on || typeof document === 'undefined') return;
    let lock: WakeLockSentinel | null = null;
    let video: HTMLVideoElement | null = null;
    let cancelled = false;
    /**
     * Backup for browsers without the Wake Lock API (older iPhones, some in-app
     * browsers): a tiny silent video playing in a loop also keeps the screen on.
     */
    const playVideo = () => {
      if (!video) {
        video = document.createElement('video');
        video.src = '/keep-awake.mp4';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('aria-hidden', 'true');
        video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:0;top:0';
        document.body.appendChild(video);
      }
      void video.play().catch(() => {});
    };
    const acquire = async () => {
      if (document.visibilityState !== 'visible') return;
      if (!('wakeLock' in navigator)) return playVideo();
      try {
        lock = await navigator.wakeLock.request('screen');
        if (cancelled) void lock.release();
      } catch {
        playVideo(); // denied (e.g. low battery mode): try the video
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire();
    };
    // Some browsers only allow it after a tap: try again on the next one.
    const onTap = () => void acquire();
    void acquire();
    document.addEventListener('visibilitychange', onVisible);
    document.addEventListener('pointerdown', onTap, { once: true });
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      document.removeEventListener('pointerdown', onTap);
      void lock?.release().catch(() => {});
      video?.pause();
      video?.remove();
    };
  }, [on]);
}
