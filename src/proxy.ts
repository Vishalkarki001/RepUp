import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured, SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/env';
import { MARKETING_PATHS } from '@/lib/site';

/**
 * Runs before every page request (Next.js 16 "Proxy", formerly Middleware).
 *  - keeps the Supabase session cookie fresh;
 *  - sends signed-out visitors to /login, so nothing inside the app is served
 *    to them. Exception: "/" shows the public home page to signed-out visitors
 *    (the page reads the `x-repup-auth` header set here);
 *  - lets everyone see the landing pages (see src/lib/site.ts);
 *  - sends signed-in users away from /login.
 * This is the "front door" check. The data itself is protected separately by
 * Row Level Security in the database, so even a bypassed page can't read
 * anyone's data.
 */
const PUBLIC_PATHS = ['/login', '/auth/'];

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next();

  // Safety net: if Supabase falls back to the Site URL (e.g. the redirect URL isn't
  // allow-listed), a login/confirm/reset `code` can land on "/" or "/login".
  // Hand it to the callback route so it isn't lost.
  const landed = request.nextUrl;
  // Landing pages are the same for everyone: no session work needed.
  if (MARKETING_PATHS.includes(landed.pathname)) return NextResponse.next();

  // Never for the app's own API (e.g. a barcode is not a sign-in code).
  const isApi = landed.pathname.startsWith('/api/');
  if (!isApi && (landed.searchParams.has('code') || landed.searchParams.has('token_hash')) && !landed.pathname.startsWith('/auth/')) {
    const url = landed.clone();
    url.pathname = '/auth/callback';
    if (!url.searchParams.has('next')) url.searchParams.set('next', landed.pathname === '/login' ? '/' : landed.pathname);
    return NextResponse.redirect(url);
  }

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

  if (pathname === '/') {
    // Opened from the home-screen icon while signed out: straight to login.
    if (!signedIn && request.nextUrl.searchParams.get('source') === 'pwa') return redirectTo('/login');
    // Tell the page who is asking. Always overwrite, so a visitor can't send their own value.
    const headers = new Headers(request.headers);
    headers.set('x-repup-auth', signedIn ? '1' : '0');
    const res = NextResponse.next({ request: { headers } });
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'set-cookie' && !key.toLowerCase().startsWith('x-middleware')) res.headers.set(key, value);
    });
    res.headers.set('Cache-Control', 'private, no-store');
    // Lets the service worker keep only the app (not the home page) as its offline copy.
    res.headers.set('x-repup-shell', signedIn ? 'app' : 'landing');
    return res;
  }

  // The app's API answers in JSON: a signed-out call gets 401, not the login page's HTML.
  if (!signedIn && isApi) {
    const res = NextResponse.json({ error: 'sign in' }, { status: 401 });
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  }

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
    '/((?!_next/static|_next/image|favicon|icon-|apple-icon|opengraph-image|twitter-image|manifest.webmanifest|sw.js|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|json|js|css|map|wasm|mp4)$).*)',
  ],
};
