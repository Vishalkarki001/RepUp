import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'RepUp — Gym Workout Tracker',
    short_name: 'RepUp',
    description: 'Plan your week, log sets, reps and kg, and see your progress.',
    // Opened from the home-screen icon: signed-out users go straight to login, not the website.
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#121212',
    theme_color: '#121212',
    categories: ['health', 'fitness', 'sports'],
    icons: [
      { src: '/icon-192.png?v=3', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png?v=3', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-192.png?v=3', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-maskable-512.png?v=3', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
