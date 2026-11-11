import { useSyncExternalStore } from 'react';
import { Modal } from './Modal';

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
  if (!req) return null;

  return (
    <Modal
      title={req.title}
      onClose={() => settle(false)}
      className="confirm"
      footer={
        <div className="row gap">
          <button className="btn grow" onClick={() => settle(false)}>
            {req.cancelLabel ?? 'Cancel'}
          </button>
          <button className={`btn grow ${req.danger ? 'danger' : 'primary'}`} onClick={() => settle(true)} autoFocus>
            {req.confirmLabel ?? 'OK'}
          </button>
        </div>
      }
    >
      {req.message && <p className="muted">{req.message}</p>}
    </Modal>
  );
}
