'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/components/Loader';

// Client-only, like the app itself (it reads the signed-in session in the browser).
const AdminApp = dynamic(() => import('@/components/admin/AdminApp').then((m) => m.AdminApp), {
  ssr: false,
  loading: () => <Loader label="Opening admin" text="Checking admin access…" />,
});

export function ClientAdmin() {
  return <AdminApp />;
}
