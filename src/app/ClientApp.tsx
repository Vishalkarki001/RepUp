'use client';

import dynamic from 'next/dynamic';

/**
 * The tracker keeps all data on the device (localStorage), so it renders on the
 * client only. This avoids hydration mismatches and keeps the app usable offline.
 *
 * The loader below shows only for the split second the app code is loading.
 * It uses inline styles on purpose, so it looks right even before the
 * stylesheet has arrived (no flash of an unstyled logo or text).
 */
const App = dynamic(() => import('@/components/App').then((m) => m.App), {
  ssr: false,
  loading: () => <Loader />,
});

export function Loader() {
  return (
    <div role="status" aria-label="Loading" style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <style>{'@keyframes repup-spin{to{transform:rotate(360deg)}}'}</style>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '3px solid rgba(124, 58, 237, 0.2)',
          borderTopColor: '#7c3aed',
          animation: 'repup-spin 0.75s linear infinite',
        }}
      />
    </div>
  );
}

export function ClientApp() {
  return <App />;
}
