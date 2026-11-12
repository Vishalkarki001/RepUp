'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { CircleQuestionMark, Download, Moon, Settings, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/lib/account';
import { promptInstall, useInstall } from '@/lib/install';
import { useAppState } from '@/lib/store';
import { setThemePref, useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { HelpGuide } from './HelpGuide';
import { AccountMenu } from './NavUser';
import { UserAvatar } from './UserAvatar';
import { SettingsModal } from './screens/Settings';
import { SyncIndicator } from './SyncIndicator';

const HELP_SEEN = 'repup:help-seen';
/** The guide opens by itself once per device, so a new user knows what to do. */
let helpChecked = false;

/** Page title + the buttons every screen has: install (when possible), light/dark, help and settings. */
export function ScreenHeader({ eyebrow, title, children }: { eyebrow?: ReactNode; title: string; children?: ReactNode }) {
  const { theme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const account = useAccount();
  const { canPrompt } = useInstall();
  const { onboarded } = useAppState();

  useEffect(() => {
    // wait until the first-run setup is done, so two windows don't open at once
    if (helpChecked || !onboarded) return;
    helpChecked = true;
    try {
      if (localStorage.getItem(HELP_SEEN)) return;
      localStorage.setItem(HELP_SEEN, '1');
    } catch {
      return;
    }
    setHelpOpen(true);
  }, [onboarded]);

  return (
    <header className="flex items-center gap-1 pt-4 pb-1 md:pt-8">
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="text-xs font-medium text-muted-foreground">{eyebrow}</p>}
        <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {children}
      <SyncIndicator />
      {canPrompt && (
        <Button
          variant="outline"
          size="sm"
          className="mx-0.5"
          onClick={async () => {
            if (await promptInstall()) toast.success('RepUp is on your home screen');
          }}
          title="Install RepUp on this device"
        >
          <Download /> Install
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setThemePref(theme === 'dark' ? 'light' : 'dark')}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? <Sun /> : <Moon />}
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setHelpOpen(true)} aria-label="How to use RepUp" title="Help">
        <CircleQuestionMark />
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
      {helpOpen && <HelpGuide onClose={() => setHelpOpen(false)} />}
    </header>
  );
}
