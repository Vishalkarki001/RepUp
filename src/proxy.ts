import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured, SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/env';

/**
 * Runs before every page request (Next.js 16 "Proxy", formerly Middleware).
 *  - keeps the Supabase session cookie fresh;
 *  - sends signed-out visitors to /login, so nothing inside the app is served
 *    to them;
 *  - sends signed-in users away from /login.
 * This is the "front door" check. The data itself is protected separately by
 * Row Level Security in the database, so even a bypassed page can't read
 * anyone's data.
 */
const PUBLIC_PATHS = ['/login', '/auth/'];

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Verifies the JWT (signature + expiry) and refreshes it when needed.
  // Never trust getSession() on the server for this.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    const [p, q] = path.split('?');
    url.pathname = p;
    url.search = q ? `?${q}` : '';
    const res = NextResponse.redirect(url);
    // keep any refreshed session cookies
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  };

  if (!signedIn && !isPublic) {
    const next = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname + search)}`;
    return redirectTo(`/login${next}`);
  }
  if (signedIn && pathname === '/login') return redirectTo('/');

  // Pages depend on who is signed in: never let a CDN/browser cache one user's page for another.
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  // Everything except Next.js assets, icons, the manifest and the service worker.
  matcher: [
    '/((?!_next/static|_next/image|favicon|icon-|apple-icon|manifest.webmanifest|sw.js|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|json|js|css|map)$).*)',
  ],
};
