'use client';

import { DEFAULT_EXERCISES } from '@/lib/data/defaults';
import { supabase } from '@/lib/supabase/client';
import type { SetEntry } from '@/lib/types';

/**
 * Admin data + actions. Every call goes to a database function that checks
 * "is this person an admin?" itself (see supabase/migrations/*admin_panel.sql),
 * so nothing here grants access on its own.
 */

export interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  provider: string;
  role: 'user' | 'admin';
  blocked: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  last_seen_at: string | null;
  email_confirmed: boolean;
  workouts: number;
  last_workout_at: string | null;
  runs: number;
  last_run_at: string | null;
}

export interface AdminStats {
  users: number;
  new_7d: number;
  active_7d: number;
  admins: number;
  blocked: number;
  workouts: number;
  workouts_7d: number;
  runs: number;
  runs_7d: number;
  run_km: number;
  run_km_7d: number;
  daily: { day: string; signups: number; workouts: number; runs: number }[];
}

export interface AdminActivity {
  at: string;
  kind: 'signup' | 'workout' | 'run' | 'admin';
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  detail: string | null;
}

export interface AdminWorkoutExercise {
  id?: string;
  exerciseId: string;
  sets: SetEntry[];
}

export interface AdminWorkout {
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  id: string;
  name: string;
  started_at: string;
  finished_at: string | null;
  exercises: AdminWorkoutExercise[];
  note: string | null;
  exercise_names: Record<string, string>;
  /** The person's own unit setting: numbers are stored as they typed them. */
  unit: 'kg' | 'lb';
}

/** A run or walk as admins see it (the route isn't shared with admins). */
export interface AdminRun {
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  id: string;
  kind: 'run' | 'walk';
  started_at: string;
  finished_at: string;
  duration_s: number;
  distance_m: number;
  steps: number | null;
  steps_source: 'sensor' | 'estimate' | null;
  calories: number;
  temp_c: number | null;
  weather_code: number | null;
  splits: number[];
  gap_s: number;
  source: 'gps' | 'manual';
  note: string | null;
}

/** Turns a database error into words an admin understands. */
export function adminError(err: { code?: string; message?: string } | null | undefined): string | null {
  if (!err) return null;
  const msg = err.message ?? '';
  if (/not allowed/i.test(msg) || err.code === '42501') {
    if (/last admin/i.test(msg)) return 'You are the last admin, so you can’t remove admin from yourself.';
    if (/remove admin first/i.test(msg)) return 'This person is an admin. Remove admin first.';
    if (/unblock/i.test(msg)) return 'Unblock this person first.';
    if (/yourself/i.test(msg)) return 'You can’t do that to your own account.';
    return 'Only admins can do this.';
  }
  if (/email does not match/i.test(msg)) return 'The email you typed doesn’t match this account.';
  if (/not found/i.test(msg)) return 'This account no longer exists.';
  if (/Could not find the function|does not exist/i.test(msg))
    return 'The admin database update hasn’t been run yet (supabase/migrations/20261113000000_admin_panel.sql).';
  if (/Failed to fetch|NetworkError|network/i.test(msg)) return 'No internet connection. Try again when you’re online.';
  return msg || 'Something went wrong.';
}

type Result<T> = { data: T | null; error: string | null };

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<Result<T>> {
  const { data, error } = await supabase().rpc(fn, args);
  return { data: (data as T) ?? null, error: adminError(error) };
}

export const adminApi = {
  isAdmin: () => call<boolean>('is_admin'),
  users: () => call<AdminUser[]>('admin_users'),
  stats: () => call<AdminStats>('admin_stats'),
  activity: (limit = 30) => call<AdminActivity[]>('admin_activity', { p_limit: limit }),
  workouts: (opts: { user?: string | null; search?: string; before?: string | null; limit?: number } = {}) =>
    call<AdminWorkout[]>('admin_workouts', {
      p_user: opts.user ?? null,
      p_search: opts.search?.trim() || null,
      p_before: opts.before ?? null,
      p_limit: opts.limit ?? 50,
    }),
  runs: (opts: { user?: string | null; search?: string; before?: string | null; limit?: number } = {}) =>
    call<AdminRun[]>('admin_runs', {
      p_user: opts.user ?? null,
      p_search: opts.search?.trim() || null,
      p_before: opts.before ?? null,
      p_limit: opts.limit ?? 50,
    }),
  setRole: (user: string, role: 'user' | 'admin') => call<null>('admin_set_role', { p_user: user, p_role: role }),
  setBlocked: (user: string, blocked: boolean) => call<null>('admin_set_blocked', { p_user: user, p_blocked: blocked }),
  setName: (user: string, name: string) => call<null>('admin_set_name', { p_user: user, p_name: name }),

  /** Deletes the account (the database re-checks the typed email), after removing their photos. */
  async deleteUser(user: string, confirmEmail: string): Promise<Result<null>> {
    try {
      const storage = supabase().storage.from('avatars');
      const { data } = await storage.list(user);
      if (data?.length) await storage.remove(data.map((f) => `${user}/${f.name}`));
    } catch {
      /* photos are best-effort; the account itself must still go */
    }
    return call<null>('admin_delete_user', { p_user: user, p_confirm_email: confirmEmail });
  },

  /** Supabase Auth sends the email; we note it in the admin log. */
  async sendPasswordReset(user: AdminUser): Promise<Result<null>> {
    if (!user.email) return { data: null, error: 'This account has no email address.' };
    const { error } = await supabase().auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (error) return { data: null, error: adminError(error) };
    return call<null>('admin_log_password_reset', { p_user: user.id });
  },
};

/* ------------------------------------------------------------------ */
/* helpers                                                              */
/* ------------------------------------------------------------------ */

const BUILT_IN = new Map(DEFAULT_EXERCISES.map((e) => [e.id, e.name]));

export function exerciseLabel(w: AdminWorkout, id: string): string {
  return w.exercise_names[id] ?? BUILT_IN.get(id) ?? 'Unknown exercise';
}

export function workoutTotals(w: AdminWorkout) {
  let sets = 0;
  let volume = 0;
  for (const e of w.exercises) {
    for (const s of e.sets ?? []) {
      if (s.warmup) continue;
      sets++;
      volume += (s.weight ?? 0) * (s.reps ?? 0);
    }
  }
  return { exercises: w.exercises.length, sets, volume };
}

export function displayName(u: { full_name?: string | null; user_name?: string | null; email?: string | null; user_email?: string | null }) {
  return u.full_name || u.user_name || (u.email ?? u.user_email ?? '').split('@')[0] || 'Unknown';
}

export function ago(iso: string | null): string {
  if (!iso) return 'never';
  const ms = Date.now() - Date.parse(iso);
  const m = Math.round(ms / 60_000);
  if (m < 2) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "Fri, 13 Nov" this year, "Fri, 13 Nov 2025" otherwise. */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) });
}

export function dateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
}
