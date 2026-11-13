import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
