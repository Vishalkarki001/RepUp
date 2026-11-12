'use client';

import { useState } from 'react';
import { ChevronsUpDown, LogOut, RefreshCw, Settings, UserPen } from 'lucide-react';
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
import { useAccount } from '@/lib/account';
import { syncNow } from '@/lib/sync';
import { logOutWithCheck } from './account-actions';
import { ProfileModal } from './ProfileModal';
import { SettingsModal } from './screens/Settings';
import { UserAvatar } from './UserAvatar';

/** Bottom of the desktop sidebar: photo + name + email; click for profile, settings, sync and log out. */
export function NavUser() {
  const account = useAccount();
  const [open, setOpen] = useState<null | 'profile' | 'settings'>(null);
  if (!account) return null;
  const name = account.name || account.email.split('@')[0];

  const who = (
    <>
      <UserAvatar account={account} className="size-8 rounded-lg" />
      <div className="grid min-w-0 flex-1 text-left leading-tight">
        <span className="truncate text-sm font-semibold">{name}</span>
        <span className="truncate text-xs text-muted-foreground">{account.email}</span>
      </div>
    </>
  );

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" aria-label="Account menu">
                {who}
                <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 min-w-56 rounded-lg" side="right" align="end" sideOffset={8}>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1.5 py-1.5">{who}</div>
              </DropdownMenuLabel>
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
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => void logOutWithCheck()}>
                <LogOut /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {open === 'profile' && <ProfileModal onClose={() => setOpen(null)} />}
      {open === 'settings' && <SettingsModal onClose={() => setOpen(null)} />}
    </>
  );
}
