'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL } from './env';

let client: SupabaseClient | null = null;

/** Browser Supabase client. The session lives in cookies so the server (proxy) can check it too. */
export function supabase(): SupabaseClient {
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}
