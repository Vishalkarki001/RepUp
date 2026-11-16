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
