'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown, Dumbbell, Footprints, LogOut, RefreshCw, Settings, ShieldCheck, UserPen, UserPlus, Utensils, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useAccount, type Account } from '@/lib/account';
import { useRun } from '@/lib/run/tracker';
import { actions, useAppState } from '@/lib/store';
import { syncNow } from '@/lib/sync';
import type { AppMode } from '@/lib/types';
import { logOutWithCheck } from './account-actions';
import { ProfileModal } from './ProfileModal';
import { SettingsModal } from './screens/Settings';
import { UserAvatar } from './UserAvatar';

const MODES: { id: AppMode; label: string; icon: LucideIcon }[] = [
  { id: 'workout', label: 'Workout mode', icon: Dumbbell },
  { id: 'running', label: 'Running mode', icon: Footprints },
  { id: 'food', label: 'Food mode', icon: Utensils },
];

const INVITE_TEXT = 'I track my gym workouts with RepUp. Free, simple, shows what you lifted last time:';

/** Share RepUp with a gym friend: the phone's share sheet, else WhatsApp. */
async function inviteFriend() {
  const url = `${window.location.origin}/`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'RepUp', text: INVITE_TEXT, url });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return; // closed the share sheet
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${INVITE_TEXT} ${url}`)}`, '_blank', 'noopener');
}

function Who({ account }: { account: Account }) {
  return (
    <>
      <UserAvatar account={account} className="size-8 rounded-lg" />
      <div className="grid min-w-0 flex-1 text-left leading-tight">
        <span className="truncate text-sm font-semibold">{account.name || account.email.split('@')[0]}</span>
        <span className="truncate text-xs text-muted-foreground">{account.email}</span>
      </div>
    </>
  );
}

/**
 * The account menu (Edit profile, Settings, Sync now, Log out) around any trigger.
 * Used by the desktop sidebar and by the phone header.
 */
export function AccountMenu({
  children,
  side = 'bottom',
  align = 'end',
}: {
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}) {
  const account = useAccount();
  const router = useRouter();
  const [open, setOpen] = useState<null | 'profile' | 'settings'>(null);
  const { settings } = useAppState();
  const { track } = useRun();
  if (!account) return null;
  const running = settings.mode === 'running';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 min-w-56 rounded-lg" side={side} align={align} sideOffset={8}>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1.5 py-1.5">
              <Who account={account} />
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* Only for the admin account. */}
          {account.role === 'admin' && (
            <>
              <DropdownMenuItem variant="destructive" className="font-medium" onSelect={() => router.push('/admin')}>
                <ShieldCheck /> Admin dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {/* The other two modes. */}
          <DropdownMenuGroup>
            {MODES.filter((m) => m.id !== settings.mode).map(({ id, label, icon: Icon }) => (
              <DropdownMenuItem
                key={id}
                className="font-medium"
                disabled={running && !!track}
                onSelect={() => {
                  actions.updateSettings({ mode: id });
                  toast.success(label);
                }}
              >
                <Icon />
                {label}
                {running && track && <span className="ml-auto text-xs text-muted-foreground">finish your run first</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setOpen('profile')}>
              <UserPen /> Edit profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpen('settings')}>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void syncNow()}>
              <RefreshCw /> Sync now
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void inviteFriend()}>
              <UserPlus /> Invite a gym friend
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => void logOutWithCheck()}>
            <LogOut /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {open === 'profile' && <ProfileModal onClose={() => setOpen(null)} />}
      {open === 'settings' && <SettingsModal onClose={() => setOpen(null)} />}
    </>
  );
}

/** Bottom of the desktop sidebar: photo + name + email; click for the account menu. */
export function NavUser() {
  const account = useAccount();
  if (!account) return null;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <AccountMenu side="right" align="end">
          <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" aria-label="Account menu">
            <Who account={account} />
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
          </SidebarMenuButton>
        </AccountMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
