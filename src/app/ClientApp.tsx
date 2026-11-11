'use client';

import dynamic from 'next/dynamic';

/**
 * The tracker keeps all data on the device (localStorage), so it renders on the
 * client only. This avoids hydration mismatches and keeps the app usable offline.
 */
const App = dynamic(() => import('@/components/App').then((m) => m.App), {
  ssr: false,
  loading: () => (
    <div className="boot">
      <div className="boot-logo" />
      <p>Loading your workouts…</p>
    </div>
  ),
});

export function ClientApp() {
  return <App />;
}
