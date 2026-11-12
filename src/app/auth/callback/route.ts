import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { safeNext } from '@/lib/supabase/env';
import { createSupabaseServer } from '@/lib/supabase/server';

/**
 * Where Supabase sends people back to after:
 *  - "Continue with Google"            → ?code=…           (PKCE)
 *  - the sign-up confirmation email    → ?code=… or ?token_hash=…&type=signup
 *  - the reset-password email          → ?code=… or ?token_hash=…&type=recovery
 * We turn that into a session cookie and continue to `next` (same-site only).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  let next = safeNext(searchParams.get('next'));
  if (type === 'recovery') next = '/reset-password';

  const supabase = await createSupabaseServer();
  let error: string | null = searchParams.get('error_description');

  if (!error && code) {
    const res = await supabase.auth.exchangeCodeForSession(code);
    error = res.error?.message ?? null;
  } else if (!error && tokenHash && type) {
    const res = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    error = res.error?.message ?? null;
  } else if (!error) {
    error = 'This link is missing information.';
  }

  if (error) return go(`/login?error=${encodeURIComponent('This link is invalid or has expired. Please try again.')}`);
  return go(next);
}

/**
 * Relative redirect: the browser resolves it against the address it used, so
 * the host is always right (and can't be swapped by a forged Host header).
 * Session cookies set by Supabase above are sent along with this response.
 */
function go(path: string) {
  return new NextResponse(null, { status: 303, headers: { Location: path, 'Cache-Control': 'no-store' } });
}
