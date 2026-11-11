import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useAppState } from '@/lib/store';
import type { WorkoutSummary } from '@/lib/types';
import { useTheme } from '@/lib/theme';
import { formatDuration, useNow } from '@/lib/utils';
import { ConfirmHost } from './Confirm';
import { ChartIcon, DumbbellIcon, HistoryIcon, ListIcon } from './Icons';
import { RestTimer } from './RestTimer';
import { ActiveWorkout } from './screens/ActiveWorkout';
import { HistoryScreen } from './screens/History';
import { LibraryScreen } from './screens/Library';
import { Onboarding } from './screens/Onboarding';
import { ProgressScreen } from './screens/Progress';
import { SummaryModal } from './screens/SummaryModal';
import { TodayScreen } from './screens/Today';

type Tab = 'today' | 'history' | 'progress' | 'library';

const TABS: { id: Tab; label: string; icon: (p: { size?: number }) => React.ReactElement }[] = [
  { id: 'today', label: 'Workout', icon: DumbbellIcon },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'progress', label: 'Progress', icon: ChartIcon },
  { id: 'library', label: 'Exercises', icon: ListIcon },
];

export function App() {
  const { active, onboarded } = useAppState();
  const { theme } = useTheme();
  const [tab, setTab] = useState<Tab>('today');
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  const showWorkout = tab === 'today' && active;

  return (
    <div className="app">
      <nav className="tabbar" aria-label="Main">
        <div className="brand">
          <span className="brand-logo" aria-hidden />
          <span className="wordmark">
            Rep<b>Up</b>
          </span>
        </div>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`tab ${tab === id ? 'on' : ''}`}
            onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <main className="main">
        {showWorkout ? (
          <ActiveWorkout onFinished={setSummary} />
        ) : tab === 'today' ? (
          <TodayScreen />
        ) : tab === 'history' ? (
          <HistoryScreen onStarted={() => setTab('today')} />
        ) : tab === 'progress' ? (
          <ProgressScreen />
        ) : (
          <LibraryScreen />
        )}
      </main>

      <div className="floating">
        {active && !showWorkout && (
          <ResumeBar startedAt={active.startedAt} name={active.name} onClick={() => setTab('today')} />
        )}
        <RestTimer />
      </div>

      {summary && <SummaryModal summary={summary} onClose={() => setSummary(null)} />}
      {!onboarded && <Onboarding />}
      <ConfirmHost />
      <Toaster
        theme={theme}
        position="top-center"
        richColors
        closeButton
        duration={3500}
        offset={{ top: 'calc(12px + env(safe-area-inset-top, 0px))' }}
        mobileOffset={{ top: 'calc(10px + env(safe-area-inset-top, 0px))', left: 12, right: 12 }}
        toastOptions={{ className: 'toast' }}
      />
    </div>
  );
}

function ResumeBar({ startedAt, name, onClick }: { startedAt: number; name: string; onClick: () => void }) {
  const now = useNow(1000);
  return (
    <button className="resume-bar" onClick={onClick}>
      <span className="pulse" />
      <span className="grow">
        <strong>{name}</strong>
        <small>Workout in progress · {formatDuration(now - startedAt)}</small>
      </span>
      <span className="btn small primary">Continue</span>
    </button>
  );
}
