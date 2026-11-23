import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';
const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');

/**
 * Content-Security-Policy: what the browser may load on RepUp pages. Scripts only
 * from RepUp itself (no other site's scripts, even if someone slips HTML in);
 * data only to RepUp, Supabase, Open Food Facts (barcode backup) and Open-Meteo
 * (weather on a run). Inline scripts stay allowed: the pages are static (built
 * once), and Next.js puts its page data in inline scripts (nonces would need every
 * page rendered per visit).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ''}`, // wasm: the barcode reader
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:", // map tiles, profile photos
  "font-src 'self' data:",
  ['connect-src', "'self'", supabase, supabase.replace(/^https:/, 'wss:'), 'https://world.openfoodfacts.org', 'https://api.open-meteo.com', isDev ? 'ws:' : '']
    .filter(Boolean)
    .join(' '),
  "media-src 'self' blob:", // the keep-awake video during a run
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  isDev ? '' : 'upgrade-insecure-requests',
]
  .filter(Boolean)
  .join('; ');

const nextConfig: NextConfig = {
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  // Lets a test build run in its own folder (NEXT_DIST_DIR=.next-verify) while `next dev` keeps using .next.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // The floating dev "N" badge sat on top of the bottom tab bar on phones.
  devIndicators: false,
  async headers() {
    return [
      {
        // Basic hardening for every page.
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' }, // no clickjacking via iframes
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(self), accelerometer=(self), gyroscope=(self), payment=()' }, // camera (barcodes in food mode), GPS + motion sensor (running mode): only for RepUp itself
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
    ];
  },
};

export default nextConfig;
