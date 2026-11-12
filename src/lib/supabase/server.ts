import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_KEY, SUPABASE_URL } from './env';

/** Supabase client for Route Handlers / Server Components (one per request). */
export async function createSupabaseServer() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are read-only there. The proxy refreshes them.
        }
      },
    },
  });
}
