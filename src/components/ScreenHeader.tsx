'use client';

import { useState, type ReactNode } from 'react';
import { Moon, Settings, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/lib/account';
import { setThemePref, useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { AccountMenu } from './NavUser';
import { UserAvatar } from './UserAvatar';
import { SettingsModal } from './screens/Settings';
import { SyncIndicator } from './SyncIndicator';

/** Page title + the two buttons every screen has: light/dark switch and settings. */
export function ScreenHeader({ eyebrow, title, children }: { eyebrow?: ReactNode; title: string; children?: ReactNode }) {
  const { theme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const account = useAccount();

  return (
    <header className="flex items-center gap-1 pt-4 pb-1 md:pt-8">
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="text-xs font-medium text-muted-foreground">{eyebrow}</p>}
        <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {children}
      <SyncIndicator />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setThemePref(theme === 'dark' ? 'light' : 'dark')}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? <Sun /> : <Moon />}
      </Button>
      {/* Desktop (and signed-out): gear. Phones: your photo opens the account menu. */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(account && 'max-md:hidden')}
        onClick={() => setSettingsOpen(true)}
        aria-label="Settings"
        title="Settings"
      >
        <Settings />
      </Button>
      {account && (
        <AccountMenu side="bottom" align="end">
          <Button variant="ghost" size="icon" className="ml-0.5 rounded-full md:hidden" aria-label="Account menu">
            <UserAvatar account={account} className="size-8" />
          </Button>
        </AccountMenu>
      )}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </header>
  );
}
