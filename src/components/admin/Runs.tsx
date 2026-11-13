'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDuration, formatKm, formatPace, paceSecPerKm, weatherLabel } from '@/lib/run/core';
import { cn } from '@/lib/utils';
import { KindIcon } from '../run/RunParts';
import { adminApi, dateTime, displayName, shortDate, type AdminRun } from './api';

const PAGE = 50;

/** Every run and walk (newest first). Can be narrowed to one person or searched. */
export function AdminRuns({ user, onClearUser }: { user: { id: string; label: string } | null; onClearUser: () => void }) {
  const [rows, setRows] = useState<AdminRun[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<AdminRun | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(
    async (append = false, before: string | null = null) => {
      setLoading(true);
      const res = await adminApi.runs({ user: user?.id ?? null, search, before, limit: PAGE });
      setLoading(false);
      setError(res.error);
      if (!res.data) return;
      setRows((prev) => (append && prev ? [...prev, ...res.data!] : res.data));
      setMore(res.data.length === PAGE);
    },
    [user?.id, search],
  );

  useEffect(() => {
    setRows(null);
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="h-9 sm:max-w-xs">
          <InputGroupInput
            placeholder={user ? 'Search their runs' : 'Search name, email or note'}
            aria-label="Search runs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        {user && (
          <Badge variant="secondary" className="h-7 gap-1 pr-1 text-sm font-normal">
            {user.label}
            <button type="button" onClick={onClearUser} className="rounded-sm p-0.5 hover:bg-muted" aria-label="Show everyone’s runs">
              <X className="size-3.5" />
            </button>
          </Badge>
        )}
        <Button variant="outline" size="sm" className="sm:ml-auto" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn(loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <Card className="gap-0 overflow-hidden py-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Run</TableHead>
              <TableHead className="hidden w-36 md:table-cell">Date</TableHead>
              <TableHead className="hidden w-20 text-right sm:table-cell">Time</TableHead>
              <TableHead className="w-24 pr-4 text-right">Distance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows === null
              ? [0, 1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4} className="px-4">
                      <Skeleton className="h-9 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : rows.map((r) => (
                  <TableRow key={`${r.user_id}-${r.id}`} className="cursor-pointer" onClick={() => setOpen(r)}>
                    <TableCell className="pl-4">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground [&_svg]:size-4">
                          <KindIcon kind={r.kind} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {r.kind === 'walk' ? 'Walk' : 'Run'}
                            {r.source === 'manual' && <span className="font-normal text-muted-foreground"> · by hand</span>}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {displayName(r)} · <span className="md:hidden">{shortDate(r.started_at)}</span>
                            <span className="hidden md:inline">{r.user_email}</span>
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{shortDate(r.started_at)}</TableCell>
                    <TableCell className="hidden text-right tabular sm:table-cell">{formatDuration(r.duration_s)}</TableCell>
                    <TableCell className="pr-4 text-right font-semibold tabular">{formatKm(r.distance_m)} km</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {rows && rows.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No runs found.</p>}
      </Card>

      {rows && more && (
        <Button variant="outline" className="self-center" disabled={loading} onClick={() => void load(true, rows[rows.length - 1].started_at)}>
          {loading && <Loader2 className="animate-spin" />} Load more
        </Button>
      )}

      <RunSheet run={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function RunSheet({ run, onClose }: { run: AdminRun | null; onClose: () => void }) {
  if (!run) return <Sheet open={false} />;
  const pace = paceSecPerKm(run.distance_m, run.duration_s);
  const weather = weatherLabel(run.weather_code);
  const splits = run.splits ?? [];
  const fastest = splits.length > 1 ? Math.min(...splits) : null;
  const facts: [string, string][] = [
    ['Distance', `${formatKm(run.distance_m)} km`],
    ['Moving time', formatDuration(run.duration_s)],
    ['Avg pace', `${formatPace(pace)} /km`],
    ['Calories', `~${run.calories} kcal`],
    ['Steps', run.steps === null ? '–' : `${run.steps_source === 'sensor' ? '' : '~'}${run.steps.toLocaleString('en-IN')}`],
    ['Weather', weather && run.temp_c !== null ? `${weather.emoji} ${Math.round(Number(run.temp_c))}°C` : '–'],
    ['Tracked with', run.source === 'manual' ? 'Added by hand' : 'GPS'],
    ['GPS gaps', run.gap_s >= 30 ? formatDuration(run.gap_s) : 'None'],
  ];

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="pr-8">
            {formatKm(run.distance_m)} km {run.kind === 'walk' ? 'walk' : 'run'}
          </SheetTitle>
          <SheetDescription>{dateTime(run.started_at)}</SheetDescription>
          <p className="min-w-0 text-sm">
            <span className="font-medium">{displayName(run)}</span>{' '}
            <span className="break-all text-muted-foreground">· {run.user_email}</span>
          </p>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="font-medium break-words tabular">{v}</dd>
              </div>
            ))}
          </dl>

          {splits.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Splits</p>
              <ol className="flex flex-col divide-y rounded-lg border">
                {splits.map((sec, i) => (
                  <li key={i} className="flex items-center justify-between px-3 py-2 text-sm tabular">
                    <span className="text-muted-foreground">Km {i + 1}</span>
                    <span className={cn('font-semibold', sec === fastest && 'text-success')}>{formatPace(sec)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {run.note && <p className="rounded-lg bg-muted px-3 py-2 text-sm">📝 {run.note}</p>}
          <p className="text-xs text-muted-foreground">The route map is private to the runner and isn’t shown here.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
