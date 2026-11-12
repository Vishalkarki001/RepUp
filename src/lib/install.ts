'use client';

import { useSyncExternalStore } from 'react';

/**
 * "Install app" support.
 *
 * Chrome/Edge/Samsung Internet on Android (and desktop Chrome) fire
 * `beforeinstallprompt` once the site is installable. Chrome only shows its own
 * mini banner when its engagement rules allow it, so we keep the event and offer
 * our own button instead. iPhone Safari has no such event: there we show the
 * "Share → Add to Home Screen" steps.
 */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export type InstallState = {
  /** Already running as an installed app (home-screen icon). */
  installed: boolean;
  /** One-tap install is available (Android / desktop Chrome). */
  canPrompt: boolean;
  /** iPhone/iPad Safari: install by hand from the Share menu. */
  ios: boolean;
};

let deferred: InstallPromptEvent | null = null;
let justInstalled = false;
const listeners = new Set<() => void>();
const emit = () => {
  cached = null;
  listeners.forEach((l) => l());
};

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac with touch.
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // we show our own button
    deferred = e as InstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    justInstalled = true;
    emit();
  });
}

let cached: InstallState | null = null;
const SERVER: InstallState = { installed: false, canPrompt: false, ios: false };

function snapshot(): InstallState {
  if (!cached) {
    const installed = justInstalled || isStandalone();
    cached = { installed, canPrompt: !installed && !!deferred, ios: !installed && isIOS() };
  }
  return cached;
}

export function useInstall(): InstallState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    snapshot,
    () => SERVER,
  );
}

/** Opens the browser's install dialog. Resolves true if the user said yes. */
export async function promptInstall(): Promise<boolean> {
  const ev = deferred;
  if (!ev) return false;
  deferred = null; // the event can only be used once
  emit();
  await ev.prompt();
  const { outcome } = await ev.userChoice;
  return outcome === 'accepted';
}
