'use client';

import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { ConfirmHost } from './Confirm';
// Starts listening for the browser's install event as early as possible.
import '@/lib/install';

/** App-wide pieces every page needs (login page included): toasts + confirm dialog. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ConfirmHost />
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={3500}
        offset={{ top: 'calc(12px + env(safe-area-inset-top, 0px))' }}
        mobileOffset={{ top: 'calc(10px + env(safe-area-inset-top, 0px))', left: 12, right: 12 }}
      />
    </>
  );
}
