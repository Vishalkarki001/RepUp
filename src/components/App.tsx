'use client';

import { useEffect, useState } from 'react';
import { ChartLine, Dumbbell, History, ListChecks, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { useAppState } from '@/lib/store';
import type { WorkoutSummary } from '@/lib/types';
import { cn, formatDuration, useNow } from '@/lib/utils';
import { ConfirmHost } from './Confirm';
import { RestTimer } from './RestTimer';
import { ActiveWorkout } from './screens/ActiveWorkout';
import { HistoryScreen } from './screens/History';
import { LibraryScreen } from './screens/Library';
import { Onboarding } from './screens/Onboarding';
import { ProgressScreen } from './screens/Progress';
import { SummaryModal } from './screens/SummaryModal';
import { TodayScreen } from './screens/Today';

type Tab = 'today' | 'history' | 'progress' | 'library';

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'today', label: 'Workout', icon: Dumbbell },
  { id: 'history', label: 'History', icon: History },
  { id: 'progress', label: 'Progress', icon: ChartLine },
  { id: 'library', label: 'Exercises', icon: ListChecks },
];

export function App() {
  const { active, onboarded } = useAppState();
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
    <SidebarProvider className="block min-h-dvh md:pl-60" style={{ '--sidebar-width': '15rem' } as React.CSSProperties}>
      {/* Desktop sidebar (shadcn Sidebar, always expanded); phones use the bottom tab bar below */}
      <Sidebar collapsible="none" className="fixed inset-y-0 left-0 z-30 hidden h-dvh border-r md:flex">
        <SidebarHeader className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <img src="/icon-192.png?v=2" alt="" className="size-8" />
            <span className="wordmark text-xl">
              Rep<b>Up</b>
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu aria-label="Main">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={tab === id}
                      onClick={() => setTab(id)}
                      aria-current={tab === id ? 'page' : undefined}
                      data-tab={id}
                      className="h-9"
                    >
                      <Icon className={cn(tab === id && 'text-brand')} />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="px-4 pb-4 text-xs text-muted-foreground">Data saved on this device</SidebarFooter>
      </Sidebar>

      <main
        className={cn(
          'mx-auto w-full max-w-3xl px-4 pt-safe pb-[calc(9rem+env(safe-area-inset-bottom))] md:px-8 md:pb-28',
          // Progress shows a 2-column grid of charts on wide screens.
          tab === 'progress' && !showWorkout && 'xl:max-w-6xl',
        )}
      >
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

      {/* Rest timer + "continue workout" bar float above the tab bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] z-20 mx-auto flex w-full max-w-3xl flex-col gap-2 px-3 md:bottom-5 md:left-60 md:px-8">
        {active && !showWorkout && (
          <ResumeBar startedAt={active.startedAt} name={active.name} onClick={() => setTab('today')} />
        )}
        <RestTimer />
      </div>

      {/* Mobile tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-background/90 pb-safe backdrop-blur-lg md:hidden"
        aria-label="Main"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}
            data-tab={id}
            className={cn(
              'relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors',
              tab === id && 'text-brand',
            )}
          >
            {tab === id && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
            <Icon className="size-5" strokeWidth={tab === id ? 2.4 : 2} />
            {label}
          </button>
        ))}
      </nav>

      {summary && <SummaryModal summary={summary} onClose={() => setSummary(null)} />}
      {!onboarded && <Onboarding />}
      <ConfirmHost />
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={3500}
        offset={{ top: 'calc(12px + env(safe-area-inset-top, 0px))' }}
        mobileOffset={{ top: 'calc(10px + env(safe-area-inset-top, 0px))', left: 12, right: 12 }}
      />
    </SidebarProvider>
  );
}

function ResumeBar({ startedAt, name, onClick }: { startedAt: number; name: string; onClick: () => void }) {
  const now = useNow(1000);
  return (
    <button
      onClick={onClick}
      className="pointer-events-auto flex w-full items-center gap-3 rounded-xl border bg-popover px-4 py-2.5 text-left shadow-lg"
    >
      <span className="size-2.5 animate-soft-pulse rounded-full bg-success" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{name}</span>
        <span className="block text-xs text-muted-foreground">Workout in progress · {formatDuration(now - startedAt)}</span>
      </span>
      <Button size="sm" asChild>
        <span>Continue</span>
      </Button>
    </button>
  );
}
