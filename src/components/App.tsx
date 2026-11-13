'use client';

import { useEffect, useRef, useState } from 'react';
import { Calculator, ChartLine, Dumbbell, Footprints, History, ListChecks, Utensils, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { refreshProfile, setAccountFromUser } from '@/lib/account';
import { switchUser, useAppState } from '@/lib/store';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { startSync, useSyncStatus } from '@/lib/sync';
import { useRun } from '@/lib/run/tracker';
import type { AppMode, RunEntry, WorkoutSummary } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Loader } from './Loader';
import { NavUser } from './NavUser';
import { ActiveWorkout } from './screens/ActiveWorkout';
import { HistoryScreen } from './screens/History';
import { LibraryScreen } from './screens/Library';
import { Onboarding } from './screens/Onboarding';
import { ProgressScreen } from './screens/Progress';
import { SummaryModal } from './screens/SummaryModal';
import { TodayScreen } from './screens/Today';
import { ActiveRun } from './run/ActiveRun';
import { RunDetail } from './run/RunDetail';
import { RunHistory, RunHome, RunProgress } from './run/RunScreens';
import { FoodCalories, FoodDiary, FoodProgress } from './food/FoodScreens';

type Tab = 'today' | 'history' | 'progress' | 'library' | 'run' | 'runs' | 'run-progress' | 'food' | 'food-progress' | 'food-calc';

/** Running mode: its own three tabs. */
const RUN_TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'run', label: 'Run', icon: Footprints },
  { id: 'runs', label: 'History', icon: History },
  { id: 'run-progress', label: 'Progress', icon: ChartLine },
];

/** Food mode: diary, progress and "Know your calories". */
const FOOD_TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'food-progress', label: 'Progress', icon: ChartLine },
  { id: 'food-calc', label: 'Calories', icon: Calculator },
];

const FIRST_TAB: Record<AppMode, Tab> = { workout: 'today', running: 'run', food: 'food' };

const BASE_TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'today', label: 'Workout', icon: Dumbbell },
  { id: 'history', label: 'History', icon: History },
  { id: 'progress', label: 'Progress', icon: ChartLine },
  { id: 'library', label: 'Exercises', icon: ListChecks },
];

/** Signs the user in (server-verified), loads + syncs their data, then shows the app. */
export function App() {
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const db = supabase();

    (async () => {
      // getUser() asks the Auth server, so a forged/expired cookie can't get in.
      const checked = await db.auth.getUser();
      let user = checked.data.user;
      const offline = typeof navigator !== 'undefined' && !navigator.onLine;
      if (!user && offline) {
        // Offline at the gym: trust the saved session just to open this device's own copy.
        user = (await db.auth.getSession()).data.session?.user ?? null;
      }
      if (!user) {
        // Online and the Auth server said no (signed out elsewhere, blocked or deleted):
        // drop this device's session cookie first, or /login would send us straight back here.
        if (checked.error && !offline) await db.auth.signOut({ scope: 'local' });
        window.location.assign('/login');
        return;
      }
      const { movedGuestData } = switchUser(user.id);
      setAccountFromUser(user);
      void refreshProfile();
      await startSync(user.id);
      if (cancelled) return;
      if (movedGuestData) toast.success('Workouts saved on this device were added to your account');
      setReady(true);
    })();

    const { data } = db.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') window.location.assign('/login');
    });
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  return ready ? <Shell /> : <Loader label="Loading your workouts" text="Loading your workouts…" />;
}

function Shell() {
  // Same shadcn layout as the admin panel: collapsible sidebar on desktop, bottom tabs on phones.
  return (
    <SidebarProvider>
      <ShellInner />
    </SidebarProvider>
  );
}

function ShellInner() {
  const { active, onboarded, settings } = useAppState();
  const mode = settings.mode;
  const running = mode === 'running';
  const eating = mode === 'food';
  // Admins open the admin panel (/admin) from the account menu, so the tabs are the same for everyone.
  const TABS = running ? RUN_TABS : eating ? FOOD_TABS : BASE_TABS;
  useSyncToasts();
  const [tab, setTab] = useState<Tab>(FIRST_TAB[mode]);
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);
  const [savedRun, setSavedRun] = useState<RunEntry | null>(null);
  const { state } = useSidebar();
  const { track } = useRun();

  // Switching mode (account menu) opens that mode's first tab.
  useEffect(() => {
    setTab(FIRST_TAB[mode]);
  }, [mode]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  const showWorkout = mode === 'workout' && tab === 'today' && active;
  const showRun = running && tab === 'run' && !!track;
  const current = TABS.find((t) => t.id === tab);

  return (
    <>
      {/* Desktop sidebar (shadcn Sidebar); phones use the bottom tab bar below */}
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png?v=3" alt="" className="size-8" />
            <span className="wordmark text-lg">
              Rep<b>Up</b>
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu aria-label="Main">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={tab === id}
                      onClick={() => setTab(id)}
                      aria-current={tab === id ? 'page' : undefined}
                      data-tab={id}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-2">
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0">
        {/* Desktop top bar: open/close the sidebar */}
        <header className="hidden h-14 items-center gap-2 border-b px-4 md:flex">
          <SidebarTrigger className="-ml-1" />
          <span className="text-sm font-medium text-muted-foreground">{showWorkout ? 'Workout in progress' : showRun ? `${track?.kind === 'walk' ? 'Walk' : 'Run'} in progress` : current?.label}</span>
        </header>

        <div
          className={cn(
            'mx-auto w-full max-w-3xl px-4 pt-safe pb-[calc(9rem+env(safe-area-inset-bottom))] md:px-8 md:pb-28',
            // Progress shows a 2-column grid of charts on wide screens.
            (tab === 'progress' || tab === 'run-progress') && !showWorkout && 'xl:max-w-6xl',
          )}
        >
          {eating ? (
            tab === 'food-progress' ? (
              <FoodProgress />
            ) : tab === 'food-calc' ? (
              <FoodCalories />
            ) : (
              <FoodDiary onSetGoal={() => setTab('food-calc')} />
            )
          ) : showRun ? (
            <ActiveRun onFinished={setSavedRun} />
          ) : running ? (
            tab === 'runs' ? (
              <RunHistory />
            ) : tab === 'run-progress' ? (
              <RunProgress />
            ) : (
              <RunHome />
            )
          ) : showWorkout ? (
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
        </div>
      </SidebarInset>

      {/* "Continue workout" bar floats above the tab bar (and beside the sidebar on desktop) */}
      <div
        className={cn(
          'pointer-events-none fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] z-20 mx-auto flex w-full max-w-3xl flex-col gap-2 px-3 md:bottom-5 md:px-8',
          state === 'expanded' ? 'md:left-[var(--sidebar-width)]' : 'md:left-0',
        )}
      >
        {mode === 'workout' && active && !showWorkout && <ResumeBar name={active.name.trim() || 'Workout'} onClick={() => setTab('today')} />}
        {running && track && !showRun && (
          <ResumeBar name={track.kind === 'walk' ? 'Walk' : 'Run'} hint={track.status === 'paused' ? 'Paused' : 'In progress'} onClick={() => setTab('run')} />
        )}
      </div>

      {/* Mobile tab bar */}
      <nav
        className={cn('fixed inset-x-0 bottom-0 z-30 grid border-t', TABS.length === 3 ? 'grid-cols-3' : 'grid-cols-4', 'bg-background/90 pb-safe backdrop-blur-lg md:hidden')}
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
      {savedRun && <RunDetail run={savedRun} justSaved onClose={() => setSavedRun(null)} />}
      {!onboarded && <Onboarding />}
    </>
  );
}

function ResumeBar({ name, hint = 'Workout in progress', onClick }: { name: string; hint?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="pointer-events-auto flex w-full items-center gap-3 rounded-xl border bg-popover px-4 py-2.5 text-left shadow-lg"
    >
      <span className="size-2.5 animate-soft-pulse rounded-full bg-success" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{name}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <Button size="sm" asChild>
        <span>Continue</span>
      </Button>
    </button>
  );
}

/** Tell the user when saving to their account stops (offline / error) and when it's fine again. */
function useSyncToasts() {
  const sync = useSyncStatus();
  const hadProblem = useRef(false);
  useEffect(() => {
    if (sync.state === 'offline' && !hadProblem.current) {
      hadProblem.current = true;
      toast('You’re offline — changes are saved on this device and will sync when you’re back', { id: 'sync-status' });
    } else if (sync.state === 'error' && !hadProblem.current) {
      hadProblem.current = true;
      toast.error('Couldn’t save to your account — retrying automatically', { id: 'sync-status' });
    } else if (sync.state === 'idle' && hadProblem.current) {
      hadProblem.current = false;
      toast.success('Back online — everything is saved', { id: 'sync-status' });
    }
  }, [sync.state]);
}
