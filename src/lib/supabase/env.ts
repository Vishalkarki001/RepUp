/** Public Supabase settings (safe in the browser — data is protected by Row Level Security). */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

/**
 * Only allow same-site relative redirects ("/x"), never "//evil.com", "https://…"
 * or tricks browsers clean up into those ("/\t/evil.com", "/\\evil.com").
 */
export function safeNext(next: string | null | undefined, fallback = '/'): string {
  if (!next || !next.startsWith('/') || /[\u0000-\u0020\\\u007f]/.test(next)) return fallback;
  try {
    const base = 'https://repup.invalid';
    const url = new URL(next, base);
    if (url.origin !== base) return fallback;
    const path = url.pathname + url.search + url.hash;
    return path.startsWith('//') ? fallback : path;
  } catch {
    return fallback;
  }
}
