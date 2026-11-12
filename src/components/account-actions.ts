'use client';

import { signOut, wouldLoseChanges } from '@/lib/account';
import { confirmDialog } from './Confirm';

/** Log out, but warn first if some changes never reached the account (offline). */
export async function logOutWithCheck(): Promise<void> {
  if (await wouldLoseChanges()) {
    const ok = await confirmDialog({
      title: 'Log out without saving?',
      message: 'Some changes haven’t reached your account yet (no internet). If you log out now they’ll be lost.',
      confirmLabel: 'Log out anyway',
      danger: true,
    });
    if (!ok) return;
  }
  await signOut();
}
