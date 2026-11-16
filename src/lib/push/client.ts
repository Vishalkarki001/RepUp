'use client';

import { cleanPrefs, type ReminderPrefs } from '../reminders';
import { supabase } from '../supabase/client';
import { isSupabaseConfigured } from '../supabase/env';

/**
 * Reminders on this device: permission, the push subscription, the
 * person's reminder settings, and a test notification. Works in the browser
 * and in the installed app (PWA); on iPhone only in the installed app.
 */

export type PushStatus =
  /** Ready (or ready once permission is given). */
  | 'ok'
  /** iPhone / iPad in Safari: needs "Add to Home Screen" first. */
  | 'ios-install'
  /** The person blocked notifications for RepUp. */
  | 'denied'
  /** This browser can't do push at all. */
  | 'unsupported';

const isIOS = () =>
  typeof navigator !== 'undefined' && (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
const isInstalled = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

export function pushStatus(): PushStatus {
  if (typeof window === 'undefined') return 'unsupported';
  const capable = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (isIOS() && !isInstalled()) return 'ios-install';
  if (!capable || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  return 'ok';
}

/** The base64url public key → the bytes PushManager wants. */
function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function registration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready;
}

/**
 * Ask for permission (call from a tap) and register this device for
 * reminders. Returns null when it worked, or what went wrong.
 */
export async function enablePushHere(): Promise<PushStatus | 'error' | null> {
  const status = pushStatus();
  if (status !== 'ok') return status;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'error';
  try {
    const reg = await registration();
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) }));
    const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) return 'error';
    const { error } = await supabase().rpc('save_push_subscription', { p_endpoint: json.endpoint, p_p256dh: json.keys.p256dh, p_auth: json.keys.auth });
    return error ? 'error' : null;
  } catch {
    return 'error';
  }
}

/** Is this device registered for reminders right now? */
export async function pushOnHere(): Promise<boolean> {
  if (pushStatus() !== 'ok' || Notification.permission !== 'granted') return false;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    return !!(await reg?.pushManager.getSubscription());
  } catch {
    return false;
  }
}

/** Stop reminders on this device (also done when logging out, so the next person doesn't get them). */
export async function disablePushHere(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    if (isSupabaseConfigured) await supabase().from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    await sub.unsubscribe();
  } catch {
    /* offline: the server drops it the next time sending fails */
  }
}

export async function loadReminderPrefs(): Promise<ReminderPrefs | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase().from('reminder_prefs').select('prefs').maybeSingle();
  if (error) throw error;
  return data ? cleanPrefs(data.prefs) : null;
}

export async function saveReminderPrefs(userId: string, prefs: ReminderPrefs): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  const { error } = await supabase().from('reminder_prefs').upsert({ user_id: userId, tz, prefs }, { onConflict: 'user_id' });
  return !error;
}

/** Sends "Reminders are on ✅" to this person's devices. Returns how many got it, or null on failure. */
export async function sendTestNotification(): Promise<number | null> {
  try {
    const res = await fetch('/api/push/test', { method: 'POST' });
    if (!res.ok) return null;
    return ((await res.json()) as { sent: number }).sent;
  } catch {
    return null;
  }
}
