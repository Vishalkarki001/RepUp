'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { downloadWorkoutPdf } from '@/lib/exportPdf';
import type { Workout } from '@/lib/types';
import { cn, formatKg, setUnit, unitLabel } from '@/lib/utils';
import { NumBadge } from '../common';
import { adminApi, dateTime, displayName, exerciseLabel, shortDate, workoutTotals, type AdminWorkout } from './api';

const PAGE = 50;

/** Every logged workout (newest first). Can be narrowed to one person or searched. */
export function AdminWorkouts({ user, onClearUser }: { user: { id: string; label: string } | null; onClearUser: () => void }) {
  const [rows, setRows] = useState<AdminWorkout[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<AdminWorkout | null>(null);

  // Search after the admin stops typing for a moment.
  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(
    async (append = false, before: string | null = null) => {
      setLoading(true);
      const res = await adminApi.workouts({ user: user?.id ?? null, search, before, limit: PAGE });
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
            placeholder={user ? 'Search their workouts' : 'Search workout, name or email'}
            aria-label="Search workouts"
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
            <button type="button" onClick={onClearUser} className="rounded-sm p-0.5 hover:bg-muted" aria-label="Show everyone’s workouts">
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
              <TableHead className="pl-4">Workout</TableHead>
              <TableHead className="hidden w-36 md:table-cell">Date</TableHead>
              <TableHead className="hidden w-16 text-right sm:table-cell">Sets</TableHead>
              <TableHead className="w-28 pr-4 text-right">Lifted</TableHead>
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
              : rows.map((w) => {
                  const t = workoutTotals(w);
                  return (
                    <TableRow key={`${w.user_id}-${w.id}`} className="cursor-pointer" onClick={() => setOpen(w)}>
                      <TableCell className="pl-4">
                        <p className="truncate font-medium">{w.name || 'Workout'}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {displayName(w)} · <span className="md:hidden">{shortDate(w.started_at)}</span>
                          <span className="hidden md:inline">{w.user_email}</span>
                        </p>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{shortDate(w.started_at)}</TableCell>
                      <TableCell className="hidden text-right tabular sm:table-cell">{t.sets}</TableCell>
                      <TableCell className="pr-4 text-right font-semibold tabular">
                        {Math.round(t.volume).toLocaleString('en-IN')} {w.unit}
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
        {rows && rows.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No workouts found.</p>}
      </Card>

      {rows && more && (
        <Button variant="outline" className="self-center" disabled={loading} onClick={() => void load(true, rows[rows.length - 1].started_at)}>
          {loading && <Loader2 className="animate-spin" />} Load more
        </Button>
      )}

      <WorkoutSheet workout={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function WorkoutSheet({ workout, onClose }: { workout: AdminWorkout | null; onClose: () => void }) {
  const [exporting, setExporting] = useState(false);
  if (!workout) return <Sheet open={false} />;
  const t = workoutTotals(workout);

  const exportPdf = async () => {
    setExporting(true);
    try {
      const w = {
        id: workout.id,
        name: workout.name,
        startedAt: Date.parse(workout.started_at),
        finishedAt: workout.finished_at ? Date.parse(workout.finished_at) : undefined,
        exercises: workout.exercises,
        note: workout.note ?? undefined,
      } as unknown as Workout;
      // The PDF uses that person's unit, then the admin's own unit comes back.
      const mine = unitLabel();
      setUnit(workout.unit);
      try {
        await downloadWorkoutPdf(w, (id) => exerciseLabel(workout, id));
      } finally {
        setUnit(mine);
      }
    } catch {
      toast.error('Couldn’t make the PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="pr-8">{workout.name || 'Workout'}</SheetTitle>
          <SheetDescription>{dateTime(workout.started_at)}</SheetDescription>
          <p className="min-w-0 text-sm">
            <span className="font-medium">{displayName(workout)}</span>{' '}
            <span className="break-all text-muted-foreground">· {workout.user_email}</span>
          </p>
          <p className="text-xs text-muted-foreground tabular">
            {t.exercises} exercises · {t.sets} sets · {Math.round(t.volume).toLocaleString('en-IN')} {workout.unit} lifted
          </p>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {workout.exercises.map((e, i) => {
            let n = 0;
            return (
              <div key={e.id ?? i} className="flex flex-col gap-2">
                <h4 className="text-sm font-semibold">{exerciseLabel(workout, e.exerciseId)}</h4>
                <ol className="flex flex-col divide-y rounded-lg border">
                  {(e.sets ?? []).map((s, j) => (
                    <li key={s.id ?? j} className={cn('flex items-center gap-3 px-3 py-2 text-sm', s.warmup && 'text-muted-foreground')}>
                      <NumBadge className={cn(s.warmup && 'bg-warning-soft text-warning')}>{s.warmup ? 'W' : ++n}</NumBadge>
                      <span className="tabular">
                        {(s.weight ?? 0) > 0 ? `${formatKg(s.weight ?? 0)} ${workout.unit} × ${s.reps ?? 0}` : `${s.reps ?? 0} reps`}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
          {workout.note && <p className="rounded-lg bg-muted px-3 py-2 text-sm">📝 {workout.note}</p>}
        </div>

        <SheetFooter className="border-t">
          <Button variant="outline" disabled={exporting} onClick={exportPdf}>
            {exporting ? <Loader2 className="animate-spin" /> : <Download />} Download PDF
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
