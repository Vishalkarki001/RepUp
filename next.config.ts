import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The floating dev "N" badge sat on top of the bottom tab bar on phones.
  devIndicators: false,
  async headers() {
    return [
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
