'use client';

import { CloudAlert, CloudCheck, CloudOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/lib/account';
import { syncNow, useSyncStatus } from '@/lib/sync';
import { cn } from '@/lib/utils';

/**
 * Small cloud status in every screen header: Saving… / Saved / Offline / Not saved.
 * Tap to sync right now.
 */
export function SyncIndicator({ className }: { className?: string }) {
  const account = useAccount();
  const sync = useSyncStatus();
  if (!account) return null;

  const view =
    sync.state === 'syncing'
      ? { icon: <Loader2 className="animate-spin" />, label: 'Saving…', tone: 'text-muted-foreground' }
      : sync.state === 'offline'
        ? { icon: <CloudOff />, label: 'Offline', tone: 'text-warning' }
        : sync.state === 'error'
          ? { icon: <CloudAlert />, label: 'Not saved', tone: 'text-destructive' }
          : { icon: <CloudCheck />, label: 'Saved', tone: 'text-success' };

  const help =
    sync.state === 'offline'
      ? 'No internet — your changes are kept on this device and will be saved when you’re back online.'
      : sync.state === 'error'
        ? 'Couldn’t save to your account. Tap to try again.'
        : sync.state === 'syncing'
          ? 'Saving your changes to your account…'
          : 'Everything is saved to your account. Tap to check for updates.';

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('h-9 gap-1.5 px-2 text-xs font-medium', view.tone, className)}
      title={help}
      aria-label={`${view.label}. ${help}`}
      aria-live="polite"
      onClick={async () => {
        if (sync.state === 'syncing') return;
        await syncNow();
      }}
    >
      {view.icon}
      <span className="hidden sm:inline">{view.label}</span>
    </Button>
  );
}
