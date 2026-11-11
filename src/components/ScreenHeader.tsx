import { useState, type ReactNode } from 'react';
import { setThemePref, useTheme } from '@/lib/theme';
import { GearIcon, MoonIcon, SunIcon } from './Icons';
import { SettingsModal } from './screens/Settings';

/** Page title + the two buttons every screen has: light/dark switch and settings. */
export function ScreenHeader({ eyebrow, title, children }: { eyebrow?: ReactNode; title: string; children?: ReactNode }) {
  const { theme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="screen-head">
      <div className="grow">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
      {children}
      <button
        className="icon-btn"
        onClick={() => setThemePref(theme === 'dark' ? 'light' : 'dark')}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
      <button className="icon-btn" onClick={() => setSettingsOpen(true)} aria-label="Settings" title="Settings">
        <GearIcon />
      </button>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </header>
  );
}
