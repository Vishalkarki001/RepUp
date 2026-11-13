'use client';

import { useCallback, useEffect, useState } from 'react';
import { Dumbbell, Footprints, RefreshCw, ShieldCheck, UserPlus, Utensils } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Section } from './AdminApp';
import { adminApi, ago, displayName, type AdminActivity, type AdminStats } from './api';

const chartConfig = {
  signups: { label: 'New users', color: 'var(--chart-2)' },
  workouts: { label: 'Workouts', color: 'var(--chart-1)' },
  runs: { label: 'Runs', color: 'var(--success)' },
  food: { label: 'People logging food', color: 'var(--warning)' },
} satisfies ChartConfig;

/** Overview: totals, the last 30 days, and what happened recently. */
export function AdminDashboard({ onGo }: { onGo: (s: Section) => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<AdminActivity[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, a] = await Promise.all([adminApi.stats(), adminApi.activity(30)]);
    setLoading(false);
    setError(s.error ?? a.error);
    if (s.data) setStats(s.data);
    if (a.data) setActivity(a.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const tiles: { label: string; value?: number | string; hint?: string; go?: Section }[] = [
    { label: 'Total users', value: stats?.users, hint: stats ? `${stats.admins} admin${stats.admins === 1 ? '' : 's'}` : undefined, go: 'users' },
    { label: 'New this week', value: stats?.new_7d, hint: 'signed up in the last 7 days', go: 'users' },
    { label: 'Active this week', value: stats?.active_7d, hint: 'opened the app in the last 7 days', go: 'users' },
    { label: 'Workouts this week', value: stats?.workouts_7d, hint: stats ? `${stats.workouts.toLocaleString('en-IN')} in total` : undefined, go: 'workouts' },
    { label: 'Runs this week', value: stats?.runs_7d, hint: stats ? `${(stats.runs ?? 0).toLocaleString('en-IN')} in total` : undefined, go: 'runs' },
    { label: 'Km run this week', value: stats ? Number(stats.run_km_7d ?? 0).toLocaleString('en-IN') : undefined, hint: stats ? `${Number(stats.run_km ?? 0).toLocaleString('en-IN')} km in total` : undefined, go: 'runs' },
    {
      label: 'Logging food this week',
      value: stats ? (stats.food_users_7d ?? 0) : undefined,
      hint: stats ? `${(stats.food_7d ?? 0).toLocaleString('en-IN')} foods this week · ${(stats.food_logs ?? 0).toLocaleString('en-IN')} in total` : undefined,
      go: 'food',
    },
  ];

  const daily = (stats?.daily ?? []).map((d) => ({
    ...d,
    label: new Date(d.day + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }));

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Everything happening in RepUp, at a glance.</p>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn(loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {tiles.map((t) => (
          <Card
            key={t.label}
            // 7 tiles: the last one fills the row on phones (2 across).
            className="cursor-pointer gap-1 py-4 transition-colors last:col-span-2 hover:bg-muted/40 md:last:col-span-1"
            onClick={() => t.go && onGo(t.go)}
          >
            <CardHeader className="px-4">
              <CardDescription>{t.label}</CardDescription>
              <CardTitle className="text-3xl tabular">{t.value == null ? <Skeleton className="h-8 w-16" /> : typeof t.value === 'number' ? t.value.toLocaleString('en-IN') : t.value}</CardTitle>
            </CardHeader>
            {t.hint && <CardContent className="px-4 text-xs text-muted-foreground">{t.hint}</CardContent>}
          </Card>
        ))}
      </div>

      {stats && stats.blocked > 0 && (
        <p className="text-sm text-muted-foreground">
          {stats.blocked} blocked account{stats.blocked === 1 ? '' : 's'}.{' '}
          <button className="font-medium text-foreground underline underline-offset-4" onClick={() => onGo('users')}>
            See users
          </button>
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Last 30 days</CardTitle>
          <CardDescription>New users, workouts, runs and people logging food per day (India time)</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {stats ? (
            <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
              <BarChart data={daily} margin={{ left: 0, right: 8, top: 8 }} accessibilityLayer>
                <CartesianGrid vertical={false} strokeDasharray="3 4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} fontSize={11} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} fontSize={11} />
                <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="workouts" fill="var(--color-workouts)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="runs" fill="var(--color-runs)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="food" fill="var(--color-food)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="signups" fill="var(--color-signups)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <Skeleton className="h-[240px] w-full" />
          )}
        </CardContent>
      </Card>

      <Card className="gap-0 pb-0">
        <CardHeader className="border-b pb-4">
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Sign-ups, workouts, runs, food and admin actions</CardDescription>
          <CardAction>
            <Button variant="ghost" size="sm" onClick={() => onGo('workouts')}>
              All workouts
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          {activity === null ? (
            <div className="flex flex-col gap-3 p-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Nothing yet.</p>
          ) : (
            <ItemGroup className="gap-0 divide-y">
              {activity.map((a, i) => (
                <Item key={`${a.kind}-${a.at}-${i}`} size="sm" className="rounded-none px-4">
                  <ItemMedia
                    variant="icon"
                    className={cn(
                      'size-8 rounded-md',
                      a.kind === 'signup' && 'bg-success-soft text-success',
                      a.kind === 'workout' && 'bg-accent text-accent-foreground',
                      a.kind === 'run' && 'bg-success-soft text-success',
                      a.kind === 'food' && 'bg-warning-soft text-warning',
                      a.kind === 'admin' && 'bg-destructive/10 text-destructive',
                    )}
                  >
                    {a.kind === 'signup' ? (
                      <UserPlus />
                    ) : a.kind === 'workout' ? (
                      <Dumbbell />
                    ) : a.kind === 'run' ? (
                      <Footprints />
                    ) : a.kind === 'food' ? (
                      <Utensils />
                    ) : (
                      <ShieldCheck />
                    )}
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="w-full truncate">{activityText(a)}</ItemTitle>
                    <ItemDescription className="truncate text-xs">{a.user_email}</ItemDescription>
                  </ItemContent>
                  <span className="shrink-0 text-xs text-muted-foreground tabular">{ago(a.at)}</span>
                </Item>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function activityText(a: AdminActivity): string {
  const who = displayName(a);
  if (a.kind === 'signup') return `${who} joined${a.detail === 'google' ? ' with Google' : ''}`;
  if (a.kind === 'workout') return `${who} logged “${a.detail || 'Workout'}”`;
  if (a.kind === 'run') return `${who} did a ${a.detail || 'run'}`;
  if (a.kind === 'food') return `${who} logged ${a.detail || 'food'}`;
  return `Admin: ${a.detail ?? ''}`;
}
