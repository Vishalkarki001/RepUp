'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { EmptyState, SectionTitle, Stat, StatGrid } from '../common';
import { ScreenHeader } from '../ScreenHeader';

interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  provider: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  last_seen_at: string | null;
  email_confirmed: boolean;
  workouts: number;
  last_workout_at: string | null;
}

const WEEK = 7 * 86_400_000;

function ago(iso: string | null): string {
  if (!iso) return 'never';
  const ms = Date.now() - Date.parse(iso);
  const m = Math.round(ms / 60_000);
  if (m < 2) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d === 1 ? '' : 's'} ago`;
  return formatDate(Date.parse(iso), { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Admin-only: every registered account. Data comes from the admin_users() database function, which refuses non-admins. */
export function AdminScreen() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase().rpc('admin_users');
    setLoading(false);
    if (err) {
      setError(err.code === '42501' ? 'Only admins can see this page.' : err.message);
      return;
    }
    setError(null);
    setUsers((data ?? []) as AdminUser[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const list = users ?? [];
    const since = Date.now() - WEEK;
    const lastActive = (u: AdminUser) => Math.max(Date.parse(u.last_seen_at ?? '') || 0, Date.parse(u.last_sign_in_at ?? '') || 0);
    return {
      total: list.length,
      newThisWeek: list.filter((u) => Date.parse(u.created_at) >= since).length,
      activeThisWeek: list.filter((u) => lastActive(u) >= since).length,
      workouts: list.reduce((a, u) => a + Number(u.workouts || 0), 0),
    };
  }, [users]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (users ?? []).filter((u) => !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q));
  }, [users, query]);

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader eyebrow="Only admins can see this" title="Admin">
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} aria-label="Refresh">
          <RefreshCw className={loading ? 'animate-spin' : undefined} /> Refresh
        </Button>
      </ScreenHeader>

      {error ? (
        <EmptyState emoji="🔒" title="Not available">
          {error}
        </EmptyState>
      ) : (
        <>
          <StatGrid cols={4}>
            <Stat value={users ? stats.total : '–'} label="registered users" />
            <Stat value={users ? stats.newThisWeek : '–'} label="new this week" />
            <Stat value={users ? stats.activeThisWeek : '–'} label="active this week" />
            <Stat value={users ? stats.workouts : '–'} label="workouts logged" />
          </StatGrid>

          <section className="flex flex-col gap-2">
            <SectionTitle>Users</SectionTitle>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search by email or name" value={query} onChange={(e) => setQuery(e.target.value)} />
            </InputGroup>

            <Card className="gap-0 py-0">
              {!users ? (
                <div className="flex flex-col gap-3 p-4">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : shown.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">No users match.</p>
              ) : (
                <ItemGroup className="divide-y">
                  {shown.map((u) => (
                    <Item key={u.id} className="rounded-none px-4 py-3">
                      <ItemMedia>
                        <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground uppercase">
                          {(u.full_name || u.email || '?').slice(0, 1)}
                        </span>
                      </ItemMedia>
                      <ItemContent className="min-w-0 gap-1">
                        <ItemTitle className="w-full flex-wrap">
                          <span className="truncate">{u.email ?? '(no email)'}</span>
                          {u.role === 'admin' && (
                            <Badge className="gap-1">
                              <ShieldAlert className="size-3" /> Admin
                            </Badge>
                          )}
                          <Badge variant="outline" className="capitalize">
                            {u.provider}
                          </Badge>
                          {!u.email_confirmed && <Badge variant="secondary">email not verified</Badge>}
                        </ItemTitle>
                        <ItemDescription className="text-xs">
                          {u.full_name ? `${u.full_name} · ` : ''}Joined {formatDate(Date.parse(u.created_at), { day: 'numeric', month: 'short', year: 'numeric' })} · Last active{' '}
                          {ago(u.last_seen_at ?? u.last_sign_in_at)}
                        </ItemDescription>
                      </ItemContent>
                      <div className="shrink-0 text-right">
                        <div className="text-base font-semibold tabular">{u.workouts}</div>
                        <div className="text-[11px] text-muted-foreground">workouts</div>
                      </div>
                    </Item>
                  ))}
                </ItemGroup>
              )}
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
