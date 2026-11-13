import { useState } from 'react';
import { Loader2, LogOut, Pencil, RefreshCw, Trash2, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { deleteAccount, useAccount } from '@/lib/account';
import { actions, useAppState } from '@/lib/store';
import { syncNow, useSyncStatus } from '@/lib/sync';
import { setThemePref, useTheme, type ThemePref } from '@/lib/theme';
import { logOutWithCheck } from '../account-actions';
import { confirmDialog } from '../Confirm';
import { Modal } from '../Modal';
import { ProfileModal } from '../ProfileModal';
import { UserAvatar } from '../UserAvatar';

const THEMES: { id: ThemePref; label: string }[] = [
  { id: 'light', label: '☀️ Light' },
  { id: 'dark', label: '🌙 Dark' },
  { id: 'system', label: 'Auto' },
];


export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings } = useAppState();
  const { pref } = useTheme();

  return (
    <Modal title="Settings" onClose={onClose}>
      <AccountSection />
      <FieldGroup className="gap-6">
        <FieldSet className="gap-2">
          <FieldLegend variant="label" className="mb-0">
            Theme
          </FieldLegend>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            className="w-full"
            aria-label="Theme"
            value={pref}
            onValueChange={(v) => v && setThemePref(v as ThemePref)}
          >
            {THEMES.map((t) => (
              <ToggleGroupItem key={t.id} value={t.id} className="h-10 flex-1 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
                {t.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <FieldDescription className="text-xs">Auto follows your phone&apos;s setting.</FieldDescription>
        </FieldSet>

        <FieldSet className="gap-2">
          <FieldLegend variant="label" className="mb-0">
            Weight unit
          </FieldLegend>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            className="w-full"
            aria-label="Weight unit"
            value={settings.unit}
            onValueChange={(v) => {
              if (v !== 'kg' && v !== 'lb') return;
              actions.updateSettings({ unit: v });
              toast.success(`Weights now shown in ${v}`);
            }}
          >
            {(['kg', 'lb'] as const).map((u) => (
              <ToggleGroupItem key={u} value={u} className="h-10 flex-1 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
                {u === 'kg' ? 'Kilograms (kg)' : 'Pounds (lb)'}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <FieldDescription className="text-xs">Pick once. Switching later does not convert numbers you already saved.</FieldDescription>
        </FieldSet>

        <FieldSet className="gap-1">
          <FieldLegend variant="label" className="mb-0">
            Install on your phone
          </FieldLegend>
          <FieldDescription className="text-xs">
            Android (Chrome): menu ⋮ → <b className="font-medium text-foreground">Install app</b>. iPhone (Safari): Share →{' '}
            <b className="font-medium text-foreground">Add to Home Screen</b>.
          </FieldDescription>
        </FieldSet>
      </FieldGroup>

      <Separator />

      <Button
        variant="destructive"
        className="h-10 w-full"
        onClick={async () => {
          const ok = await confirmDialog({
            title: 'Delete everything?',
            message:
              'All workouts, plans, body weights and settings in your account will be deleted (your login stays). Want a copy first? Open a workout and tap Download PDF. This cannot be undone.',
            confirmLabel: 'Delete everything',
            danger: true,
          });
          if (!ok) return;
          actions.resetAll();
          onClose();
          toast('All data deleted');
        }}
      >
        <Trash2 /> Delete all my workout data
      </Button>
    </Modal>
  );
}

/** Who is signed in, sync status, log out and delete account. */
function AccountSection() {
  const account = useAccount();
  const sync = useSyncStatus();
  const [busy, setBusy] = useState<null | 'sync' | 'logout' | 'delete'>(null);
  const [editing, setEditing] = useState(false);
  if (!account) return null;

  const status =
    sync.state === 'syncing'
      ? 'Syncing…'
      : sync.state === 'offline'
        ? 'Offline — changes are saved on this device and will sync when you’re back online.'
        : sync.state === 'error'
          ? 'Couldn’t sync just now. We’ll keep trying.'
          : sync.lastSyncedAt
            ? 'All changes saved to your account.'
            : 'Connected.';

  const logOut = async () => {
    setBusy('logout');
    await logOutWithCheck();
    setBusy(null);
  };

  const remove = async () => {
    const ok = await confirmDialog({
      title: 'Delete your account?',
      message: `This permanently deletes ${account.email} and every workout, plan and setting in it. This cannot be undone.`,
      confirmLabel: 'Delete my account',
      danger: true,
    });
    if (!ok) return;
    setBusy('delete');
    const err = await deleteAccount();
    if (err) {
      setBusy(null);
      toast.error(`Couldn’t delete the account: ${err}`);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-3">
        <UserAvatar account={account} className="size-10" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{account.name || account.email}</p>
          <p className="truncate text-xs text-muted-foreground">
            {account.name ? `${account.email} · ` : ''}
            {account.provider === 'google' ? 'Google account' : 'Email account'}
            {account.role === 'admin' ? ' · Admin' : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-9 shrink-0" onClick={() => setEditing(true)}>
          <Pencil /> Edit
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{status}</p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="h-10"
          disabled={busy !== null}
          onClick={async () => {
            setBusy('sync');
            await syncNow();
            setBusy(null);
          }}
        >
          {busy === 'sync' ? <Loader2 className="animate-spin" /> : <RefreshCw />} Sync now
        </Button>
        <Button variant="outline" className="h-10" disabled={busy !== null} onClick={logOut}>
          {busy === 'logout' ? <Loader2 className="animate-spin" /> : <LogOut />} Log out
        </Button>
      </div>
      <Button variant="ghost" size="sm" className="self-start text-destructive hover:text-destructive" disabled={busy !== null} onClick={remove}>
        {busy === 'delete' ? <Loader2 className="animate-spin" /> : <UserX />} Delete my account
      </Button>
      {editing && <ProfileModal onClose={() => setEditing(false)} />}
    </section>
  );
}
