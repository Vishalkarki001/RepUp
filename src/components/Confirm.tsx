'use client';

import { useSyncExternalStore } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * In-app replacement for window.confirm():
 *   if (await confirmDialog({ title: 'Delete?', confirmLabel: 'Delete', danger: true })) …
 * Render <ConfirmHost /> once (App does this).
 */

interface Request {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  resolve: (ok: boolean) => void;
}

let current: Request | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function confirmDialog(opts: Omit<Request, 'resolve'>): Promise<boolean> {
  current?.resolve(false);
  return new Promise((resolve) => {
    current = { ...opts, resolve };
    emit();
  });
}

function settle(ok: boolean) {
  const r = current;
  current = null;
  emit();
  r?.resolve(ok);
}

export function ConfirmHost() {
  const req = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );

  return (
    <AlertDialog open={!!req} onOpenChange={(open) => !open && settle(false)}>
      {req && (
        <AlertDialogContent data-confirm>
          <AlertDialogHeader>
            <AlertDialogTitle>{req.title}</AlertDialogTitle>
            {req.message ? (
              <AlertDialogDescription>{req.message}</AlertDialogDescription>
            ) : (
              <AlertDialogDescription className="sr-only">{req.title}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => settle(false)}>{req.cancelLabel ?? 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction variant={req.danger ? 'destructive' : 'default'} onClick={() => settle(true)}>
              {req.confirmLabel ?? 'OK'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
