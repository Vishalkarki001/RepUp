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
        position="bottom-right"
        richColors
        closeButton
        duration={3500}
        offset={{ bottom: 24, right: 24 }}
        // Phones: sit just above the bottom tab bar (64px) and the home indicator.
        mobileOffset={{ bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))', left: 12, right: 12 }}
      />
    </>
  );
}
