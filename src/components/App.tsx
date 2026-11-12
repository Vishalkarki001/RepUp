'use client';

import { useEffect, useRef, useState } from 'react';
import { ChartLine, Dumbbell, History, ListChecks, ShieldCheck, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
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
import { refreshProfile, setAccountFromUser, useAccount } from '@/lib/account';
import { switchUser, useAppState } from '@/lib/store';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { startSync, useSyncStatus } from '@/lib/sync';
import type { WorkoutSummary } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Loader } from './Loader';
import { NavUser } from './NavUser';
import { AdminScreen } from './screens/Admin';
import { ActiveWorkout } from './screens/ActiveWorkout';
import { HistoryScreen } from './screens/History';
import { LibraryScreen } from './screens/Library';
import { Onboarding } from './screens/Onboarding';
import { ProgressScreen } from './screens/Progress';
import { SummaryModal } from './screens/SummaryModal';
import { TodayScreen } from './screens/Today';

type Tab = 'today' | 'history' | 'progress' | 'library' | 'admin';

const BASE_TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'today', label: 'Workout', icon: Dumbbell },
  { id: 'history', label: 'History', icon: History },
  { id: 'progress', label: 'Progress', icon: ChartLine },
  { id: 'library', label: 'Exercises', icon: ListChecks },
];
const ADMIN_TAB = { id: 'admin' as Tab, label: 'Admin', icon: ShieldCheck };

/** Signs the user in (server-verified), loads + syncs their data, then shows the app. */
export function App() {
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const db = supabase();

    (async () => {
      // getUser() asks the Auth server, so a forged/expired cookie can't get in.
      let user = (await db.auth.getUser()).data.user;
      if (!user && typeof navigator !== 'undefined' && !navigator.onLine) {
        // Offline at the gym: trust the saved session just to open this device's own copy.
        user = (await db.auth.getSession()).data.session?.user ?? null;
      }
      if (!user) {
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
  const { active, onboarded } = useAppState();
  const account = useAccount();
  const TABS = account?.role === 'admin' ? [...BASE_TABS, ADMIN_TAB] : BASE_TABS;
  useSyncToasts();
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
            <img src="/icon-192.png?v=3" alt="" className="size-8" />
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
        <SidebarFooter className="p-2">
          <NavUser />
        </SidebarFooter>
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
        ) : tab === 'admin' && account?.role === 'admin' ? (
          <AdminScreen />
        ) : (
          <LibraryScreen />
        )}
      </main>

      {/* "Continue workout" bar floats above the tab bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] z-20 mx-auto flex w-full max-w-3xl flex-col gap-2 px-3 md:bottom-5 md:left-60 md:px-8">
        {active && !showWorkout && (
          <ResumeBar name={active.name.trim() || 'Workout'} onClick={() => setTab('today')} />
        )}
      </div>

      {/* Mobile tab bar */}
      <nav
        className={cn('fixed inset-x-0 bottom-0 z-30 grid border-t', TABS.length === 5 ? 'grid-cols-5' : 'grid-cols-4', 'bg-background/90 pb-safe backdrop-blur-lg md:hidden')}
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
    </SidebarProvider>
  );
}

function ResumeBar({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="pointer-events-auto flex w-full items-center gap-3 rounded-xl border bg-popover px-4 py-2.5 text-left shadow-lg"
    >
      <span className="size-2.5 animate-soft-pulse rounded-full bg-success" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{name}</span>
        <span className="block text-xs text-muted-foreground">Workout in progress</span>
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
