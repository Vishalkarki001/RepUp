import type { Metadata } from 'next';
import { ClientAdmin } from './ClientAdmin';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

/** Admin panel. Signed-out visitors are sent to /login by src/proxy.ts; non-admins see "Admins only". */
export default function AdminPage() {
  return <ClientAdmin />;
}
