import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServer } from './server';
import { isSupabaseConfigured, SUPABASE_URL } from './env';

/**
 * Server-only database access with the secret key (SUPABASE_SECRET_KEY):
 * bypasses Row Level Security, so only Route Handlers use it, for jobs no
 * single user may do (the shared food list, sending reminders). Never import
 * this from client code.
 */
let admin: SupabaseClient | null = null;
export function adminDb(): SupabaseClient | null {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key || !SUPABASE_URL) return null;
  return (admin ??= createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } }));
}

/** The signed-in user's id (verified from the session cookie), or null. */
export async function signedInUser(): Promise<string | null> {
  if (!isSupabaseConfigured) return 'local-dev'; // no accounts at all (local development)
  const db = await createSupabaseServer();
  const { data } = await db.auth.getClaims();
  return (data?.claims?.sub as string | undefined) ?? null;
}

/**
 * Quiet daily limits for paid or shared work (rate_hit() in the database).
 * Counts one use of `key` today and says whether it's still within `limit`.
 * Normal use never gets near them; they stop scripts. If the database can't
 * answer: `failClosed` (paid work, e.g. the AI search) says no, else yes.
 */
export async function withinLimit(key: string, limit: number, failClosed = false): Promise<boolean> {
  if (!isSupabaseConfigured) return true; // local development without accounts
  const db = adminDb();
  if (!db) return !failClosed;
  const { data, error } = await db.rpc('rate_hit', { p_key: key, p_limit: limit });
  if (error) {
    console.error('rate limit check failed:', error.message);
    return !failClosed;
  }
  return data === true;
}

/** Per person, per day (a real person stays far below these). */
export const LIMITS = {
  /** New packs looked up on the internet (each costs money). */
  webLookupsPerUser: 30,
  /** …and for everyone together. */
  webLookupsTotal: 300,
  /** New food searches sent to USDA (its key has an hourly quota shared by everyone). */
  usdaPerUser: 300,
  /** "Send a test notification". */
  testPushesPerUser: 10,
} as const;
