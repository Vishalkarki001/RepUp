'use client';

import { useState, type ReactNode } from 'react';
import { Moon, Settings, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setThemePref, useTheme } from '@/lib/theme';
import { SettingsModal } from './screens/Settings';
import { SyncIndicator } from './SyncIndicator';

/** Page title + the two buttons every screen has: light/dark switch and settings. */
export function ScreenHeader({ eyebrow, title, children }: { eyebrow?: ReactNode; title: string; children?: ReactNode }) {
  const { theme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} aria-label="Settings" title="Settings">
        <Settings />
      </Button>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </header>
  );
}
