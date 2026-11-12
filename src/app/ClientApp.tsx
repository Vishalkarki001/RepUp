'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/components/Loader';

/**
 * The tracker keeps all data on the device (localStorage), so it renders on the
 * client only. This avoids hydration mismatches and keeps the app usable offline.
 *
 */
const App = dynamic(() => import('@/components/App').then((m) => m.App), {
  ssr: false,
  loading: () => <Loader />,
});

export function ClientApp() {
  return <App />;
}
