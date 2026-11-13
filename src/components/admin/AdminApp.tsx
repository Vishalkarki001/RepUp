'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Dumbbell, Footprints, LayoutDashboard, Users } from 'lucide-react';
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
import { setAccountFromUser, useAccount } from '@/lib/account';
import { supabase } from '@/lib/supabase/client';
import { EmptyState } from '../common';
import { Loader } from '../Loader';
import { UserAvatar } from '../UserAvatar';
import { adminApi } from './api';
import { AdminDashboard } from './Dashboard';
import { AdminUsers } from './Users';
import { AdminRuns } from './Runs';
import { AdminWorkouts } from './Workouts';

export type Section = 'dashboard' | 'users' | 'workouts' | 'runs';

const NAV: { id: Section; label: string; icon: typeof Users }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'runs', label: 'Runs', icon: Footprints },
];

const TITLES: Record<Section, string> = { dashboard: 'Dashboard', users: 'Users', workouts: 'Workouts', runs: 'Runs' };

function sectionFromHash(): Section {
  const h = typeof window === 'undefined' ? '' : window.location.hash.slice(1);
  return h === 'users' || h === 'workouts' || h === 'runs' ? h : 'dashboard';
}

/**
 * The admin panel (/admin). Signed-in check, then "is this an admin?" asked
 * of the database. Non-admins see a short "not available" message.
 */
export function AdminApp() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'denied' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const db = supabase();
      const { data, error } = await db.auth.getUser();
      if (!data.user) {
        if (error) await db.auth.signOut({ scope: 'local' });
        window.location.assign('/login?next=/admin');
        return;
      }
      setAccountFromUser(data.user);
      const res = await adminApi.isAdmin();
      if (cancelled) return;
      if (res.error) {
        setMessage(res.error);
        setStatus('error');
      } else setStatus(res.data ? 'ready' : 'denied');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') return <Loader label="Opening admin" text="Checking admin access…" />;
  if (status !== 'ready')
    return (
      <div className="mx-auto flex min-h-dvh max-w-md items-center px-4">
        <EmptyState
          emoji="🔒"
          title={status === 'denied' ? 'Admins only' : 'Couldn’t open the admin panel'}
          action={
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft /> Back to the app
              </Link>
            </Button>
          }
        >
          {status === 'denied' ? 'Your account doesn’t have admin access.' : message}
        </EmptyState>
      </div>
    );

  return <AdminLayout />;
}

/** The panel itself (sidebar + sections), shown once admin access is confirmed. */
export function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminShell />
    </SidebarProvider>
  );
}

function AdminShell() {
  const [section, setSection] = useState<Section>(sectionFromHash);
  /** Workouts filtered to one person (opened from their profile). */
  const [workoutsFor, setWorkoutsFor] = useState<{ id: string; label: string } | null>(null);
  const [runsFor, setRunsFor] = useState<{ id: string; label: string } | null>(null);
  const { isMobile, setOpenMobile } = useSidebar();
  const account = useAccount();

  useEffect(() => {
    const onHash = () => setSection(sectionFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback(
    (s: Section) => {
      setSection(s);
      if (s !== 'workouts') setWorkoutsFor(null);
      if (s !== 'runs') setRunsFor(null);
      history.replaceState(null, '', s === 'dashboard' ? '/admin' : `/admin#${s}`);
      window.scrollTo({ top: 0 });
      if (isMobile) setOpenMobile(false);
    },
    [isMobile, setOpenMobile],
  );

  const openWorkoutsFor = useCallback(
    (user: { id: string; label: string }) => {
      setWorkoutsFor(user);
      go('workouts');
    },
    [go],
  );
  const openRunsFor = useCallback(
    (user: { id: string; label: string }) => {
      setRunsFor(user);
      go('runs');
    },
    [go],
  );

  return (
    <>
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
            <SidebarGroupLabel>Manage</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu aria-label="Admin">
                {NAV.map(({ id, label, icon: Icon }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton isActive={section === id} onClick={() => go(id)} aria-current={section === id ? 'page' : undefined}>
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-2 p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/">
                  <ArrowLeft />
                  <span>Back to the app</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {account && (
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
              <UserAvatar account={account} className="size-7" />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium">{account.name || account.email.split('@')[0]}</p>
                <p className="truncate text-xs text-muted-foreground">{account.email}</p>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur-lg">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-base font-semibold">{TITLES[section]}</h1>
        </header>
        <div className="mx-auto w-full max-w-6xl min-w-0 p-4 md:p-6">
          {section === 'dashboard' && <AdminDashboard onGo={go} />}
          {section === 'users' && <AdminUsers onOpenWorkouts={openWorkoutsFor} onOpenRuns={openRunsFor} />}
          {section === 'workouts' && <AdminWorkouts user={workoutsFor} onClearUser={() => setWorkoutsFor(null)} />}
          {section === 'runs' && <AdminRuns user={runsFor} onClearUser={() => setRunsFor(null)} />}
        </div>
      </SidebarInset>
    </>
  );
}
