import { useSyncExternalStore } from 'react';

/**
 * Light / dark theme. Stored per device (not in the workout data) so a later
 * cloud sync never flips someone's theme on another phone.
 * The inline script in app/layout.tsx applies it before first paint.
 */

export type ThemePref = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

export const THEME_KEY = 'gym-theme';

const listeners = new Set<() => void>();
const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* storage blocked */
  }
  return 'system';
}

let pref: ThemePref = typeof window !== 'undefined' ? readPref() : 'system';

function resolve(p: ThemePref): Theme {
  if (p === 'system') return media?.matches ? 'dark' : 'light';
  return p;
}

const BG: Record<Theme, string> = { light: '#fcfcfc', dark: '#121212' };

function apply(): void {
  if (typeof document === 'undefined') return;
  const t = resolve(pref);
  document.documentElement.dataset.theme = t;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', BG[t]));
}

media?.addEventListener('change', () => {
  if (pref !== 'system') return;
  apply();
  listeners.forEach((l) => l());
});

export function setThemePref(p: ThemePref): void {
  pref = p;
  try {
    if (p === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, p);
  } catch {
    /* storage blocked */
  }
  apply();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

let snapshot = { pref, theme: resolve(pref) };
function getSnapshot() {
  const theme = resolve(pref);
  if (snapshot.pref !== pref || snapshot.theme !== theme) snapshot = { pref, theme };
  return snapshot;
}

export function useTheme(): { pref: ThemePref; theme: Theme } {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
