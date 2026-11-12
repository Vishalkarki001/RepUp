'use client';

import { useId, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Item, ItemContent, ItemGroup } from '@/components/ui/item';
import { Textarea } from '@/components/ui/textarea';
import { actions, exerciseMap, useAppState } from '@/lib/store';
import type { Exercise, Workout } from '@/lib/types';
import {
  cn,
  formatDate,
  formatKg,
  formatVolume,
  formatW,
  newSet,
  unitLabel,
  workoutSetCount,
  workoutVolume,
} from '@/lib/utils';
import { EmptyState, NumBadge, SectionTitle } from '../common';
import { confirmDialog } from '../Confirm';
import { Modal } from '../Modal';
import { NumberField } from '../NumberField';
import { ScreenHeader } from '../ScreenHeader';

const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export function HistoryScreen({ onStarted }: { onStarted: () => void }) {
  const s = useAppState();
  const exMap = useMemo(() => exerciseMap(s), [s]);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = s.workouts.find((w) => w.id === openId) ?? null;

  const groups = useMemo(() => {
    const map = new Map<string, Workout[]>();
    for (const w of s.workouts) {
      const key = new Date(w.startedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      map.set(key, [...(map.get(key) ?? []), w]);
    }
    return [...map.entries()];
  }, [s.workouts]);

  const name = (id: string) => exMap.get(id)?.name ?? 'Deleted exercise';

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader eyebrow={`${s.workouts.length} workouts saved`} title="History" />

      {s.workouts.length > 0 && <MonthCalendar workouts={s.workouts} onOpen={setOpenId} />}

      {!s.workouts.length && (
        <EmptyState emoji="🗓️" title="No workouts yet">
          Finish your first workout and it will appear here.
        </EmptyState>
      )}

      {groups.map(([month, list]) => (
        <section key={month} className="flex flex-col gap-2">
          <SectionTitle>{month}</SectionTitle>
          <ItemGroup role={undefined} className="gap-2">
            {list.map((w) => (
              <Item
                key={w.id}
                asChild
                variant="outline"
                className="items-start bg-card px-4 py-3 text-left hover:bg-muted/50"
              >
                <button onClick={() => setOpenId(w.id)}>
                  <ItemContent className="min-w-0 gap-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="truncate text-sm font-semibold">{w.name}</h3>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatDate(w.startedAt)}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground tabular">
                      {workoutSetCount(w)} {workoutSetCount(w) === 1 ? 'set' : 'sets'} ·{' '}
                      {formatVolume(workoutVolume(w))}
                    </p>
                    {w.exercises.length > 0 && (
                      <ul className="mt-2.5 flex flex-col gap-1 border-t pt-2.5">
                        {w.exercises.map((e) => {
                          const working = e.sets.filter((x) => !x.warmup);
                          const best = working.reduce<(typeof working)[number] | null>(
                            (a, b) => (!a || (b.weight ?? 0) > (a.weight ?? 0) ? b : a),
                            null,
                          );
                          return (
                            <li key={e.id} className="flex items-baseline justify-between gap-3 text-sm">
                              <span className="min-w-0 truncate">
                                <span className="text-muted-foreground tabular">{working.length} ×</span> {name(e.exerciseId)}
                              </span>
                              {best && (
                                <span className="shrink-0 text-xs text-muted-foreground tabular">
                                  {formatKg(best.weight ?? 0)}×{best.reps}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </ItemContent>
                </button>
              </Item>
            ))}
          </ItemGroup>
        </section>
      ))}

      {open && (
        <WorkoutDetail
          key={open.id}
          workout={open}
          exMap={exMap}
          canRepeat={!s.active}
          onClose={() => setOpenId(null)}
          onRepeat={() => {
            actions.repeatWorkout(open.id);
            setOpenId(null);
            onStarted();
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */

function MonthCalendar({ workouts, onOpen }: { workouts: Workout[]; onOpen: (id: string) => void }) {
  const now = new Date();
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));

  const byDay = useMemo(() => {
    const m = new Map<string, Workout[]>();
    for (const w of workouts) m.set(dayKey(w.startedAt), [...(m.get(dayKey(w.startedAt)) ?? []), w]);
    return m;
  }, [workouts]);

  const first = month.getTime();
  const count = workouts.filter((w) => w.startedAt >= first && w.startedAt < new Date(month.getFullYear(), month.getMonth() + 1, 1).getTime()).length;
  const isThisMonth = month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth();
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));

  const workoutsOn = (d: Date) => byDay.get(dayKey(d.getTime())) ?? [];
  const isToday = (d: Date) => dayKey(d.getTime()) === dayKey(Date.now());
  const isFuture = (d: Date) => d.getTime() > Date.now() && !isToday(d);

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center gap-3 border-b px-4 py-3 [.border-b]:pb-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h2>
          <p className="text-xs text-muted-foreground">
            {count} workout{count === 1 ? '' : 's'} {isThisMonth ? 'so far this month' : 'this month'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => shift(-1)} aria-label="Previous month">
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => shift(1)} disabled={isThisMonth} aria-label="Next month">
            <ChevronRight />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 py-3 sm:px-4">
        <Calendar
          month={month}
          onMonthChange={(m) => setMonth(new Date(m.getFullYear(), m.getMonth(), 1))}
          endMonth={new Date(now.getFullYear(), now.getMonth(), 1)}
          weekStartsOn={1}
          showOutsideDays={false}
          hideNavigation
          className="w-full p-0 [--cell-size:--spacing(9)]"
          formatters={{ formatWeekdayName: (d) => d.toLocaleDateString('en-IN', { weekday: 'narrow' }) }}
          labels={{
            labelDayButton: (d) => {
              const list = workoutsOn(d);
              return `${formatDate(d.getTime(), { day: 'numeric', month: 'long' })}${list.length ? `: ${list.map((w) => w.name).join(', ')}` : ''}`;
            },
          }}
          disabled={(d) => !workoutsOn(d).length}
          modifiers={{ trained: (d) => workoutsOn(d).length > 0, future: isFuture }}
          modifiersClassNames={{
            trained:
              '[&>button]:bg-primary [&>button]:font-semibold [&>button]:text-primary-foreground [&>button]:hover:bg-primary/85 [&>button]:hover:text-primary-foreground',
            future: 'opacity-35',
          }}
          classNames={{
            root: 'w-full',
            months: 'relative flex flex-col',
            month: 'flex w-full flex-col',
            month_caption: 'hidden',
            nav: 'hidden',
            month_grid: 'w-full border-collapse',
            weekdays: 'flex',
            weekday: 'flex-1 pb-1 text-center text-[11px] font-medium text-muted-foreground select-none',
            week: 'mt-1 flex w-full',
            day: 'flex flex-1 items-center justify-center p-0 text-center select-none [&>button]:size-(--cell-size) [&>button]:min-w-0 [&>button]:rounded-full [&>button]:text-sm [&>button]:tabular-nums',
            today: '[&>button]:ring-2 [&>button]:ring-primary/50',
            disabled: "text-muted-foreground [&>button]:disabled:opacity-100",
            hidden: 'invisible',
          }}
          onDayClick={(d) => {
            const list = workoutsOn(d);
            if (list[0]) onOpen(list[0].id);
          }}
        />
      </CardContent>
    </Card>
  );
}

/* ---------------------------------------------------------------- */

export function WorkoutDetail({
  workout,
  exMap,
  canRepeat,
  onClose,
  onRepeat,
}: {
  workout: Workout;
  exMap: Map<string, Exercise>;
  canRepeat: boolean;
  onClose: () => void;
  onRepeat: () => void;
}) {
  const [draft, setDraft] = useState<Workout | null>(null);
  const name = (id: string) => exMap.get(id)?.name ?? 'Deleted exercise';
  const w = draft ?? workout;
  const id = useId();

  const editEx = (exId: string, fn: (e: Workout['exercises'][number]) => Workout['exercises'][number] | null) =>
    setDraft((d) => {
      if (!d) return d;
      const exercises = d.exercises.map((e) => (e.id === exId ? fn(e) : e)).filter((e) => e !== null);
      return { ...d, exercises };
    });

  const save = async () => {
    if (!draft) return;
    const left = draft.exercises.reduce((a, e) => a + e.sets.filter((x) => (x.reps ?? 0) > 0).length, 0);
    if (!left) {
      const ok = await confirmDialog({
        title: 'Delete this workout?',
        message: 'No sets are left, so saving will remove the whole workout.',
        confirmLabel: 'Delete workout',
        danger: true,
      });
      if (!ok) return;
      const backup = workout;
      actions.updateWorkout(draft);
      onClose();
      toast('Workout deleted', { duration: 6000, action: { label: 'Undo', onClick: () => actions.restoreWorkout(backup) } });
      return;
    }
    actions.updateWorkout(draft);
    setDraft(null);
    toast.success('Workout updated');
  };

  const close = async () => {
    if (draft && !(await confirmDialog({ title: 'Discard your changes?', confirmLabel: 'Discard', cancelLabel: 'Keep editing', danger: true })))
      return;
    onClose();
  };

  return (
    <Modal
      title={draft ? 'Edit workout' : workout.name}
      description={
        draft ? undefined : (
          <>
            {formatDate(workout.startedAt, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
            {new Date(workout.startedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
          </>
        )
      }
      wide={!!draft}
      onClose={close}
      footer={
        draft ? (
          <div className="flex gap-2">
            <Button variant="outline" className="h-10" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button className="h-10 flex-1" onClick={save}>
              Save changes
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button className="h-10 flex-1 basis-full sm:basis-0" disabled={!canRepeat} onClick={onRepeat}>
              <RotateCcw /> Do this workout again
            </Button>
            <Button variant="outline" className="h-10 flex-1 sm:flex-none" onClick={() => setDraft(structuredClone(workout))}>
              <Pencil /> Edit
            </Button>
            <Button
              variant="ghost"
              className="h-10 flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none"
              onClick={() => {
                const backup = workout;
                actions.deleteWorkout(workout.id);
                onClose();
                toast('Workout deleted', { duration: 6000, action: { label: 'Undo', onClick: () => actions.restoreWorkout(backup) } });
              }}
            >
              <Trash2 /> Delete
            </Button>
          </div>
        )
      }
    >
      {draft && (
        <Field>
          <FieldLabel htmlFor={`${id}-name`}>Workout name</FieldLabel>
          <Input id={`${id}-name`} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </Field>
      )}

      {w.exercises.map((e, ei) => {
        let n = 0;
        return draft ? (
          <div key={e.id} className="flex flex-col gap-2.5 rounded-lg border bg-card p-3">
            <div className="flex items-center gap-1">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{name(e.exerciseId)}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={ei === 0}
                aria-label="Move up"
                onClick={() =>
                  setDraft((d) => {
                    if (!d) return d;
                    const l = [...d.exercises];
                    [l[ei - 1], l[ei]] = [l[ei], l[ei - 1]];
                    return { ...d, exercises: l };
                  })
                }
              >
                <ChevronUp />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={ei === w.exercises.length - 1}
                aria-label="Move down"
                onClick={() =>
                  setDraft((d) => {
                    if (!d) return d;
                    const l = [...d.exercises];
                    [l[ei + 1], l[ei]] = [l[ei], l[ei + 1]];
                    return { ...d, exercises: l };
                  })
                }
              >
                <ChevronDown />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove exercise"
                onClick={() => editEx(e.id, () => null)}
              >
                <X />
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {e.sets.map((x, si) => (
                <div key={x.id} className="grid grid-cols-[1.75rem_1fr_1fr_2rem] items-end gap-2">
                  <NumBadge className={cn('mb-1 size-7', x.warmup && 'bg-warning-soft text-warning')}>{x.warmup ? 'W' : ++n}</NumBadge>
                  <NumberField
                    label={unitLabel()}
                    hideLabel={si > 0}
                    decimal
                    value={x.weight}
                    onValue={(v) => editEx(e.id, (ex) => ({ ...ex, sets: ex.sets.map((y) => (y.id === x.id ? { ...y, weight: v } : y)) }))}
                  />
                  <NumberField
                    label="Reps"
                    hideLabel={si > 0}
                    value={x.reps}
                    onValue={(v) => editEx(e.id, (ex) => ({ ...ex, sets: ex.sets.map((y) => (y.id === x.id ? { ...y, reps: v } : y)) }))}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="mb-0.5 text-muted-foreground hover:text-destructive"
                    aria-label="Delete set"
                    onClick={() => editEx(e.id, (ex) => ({ ...ex, sets: ex.sets.filter((y) => y.id !== x.id) }))}
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              onClick={() =>
                editEx(e.id, (ex) => {
                  const last = ex.sets[ex.sets.length - 1];
                  return { ...ex, sets: [...ex.sets, { ...newSet(), weight: last?.weight ?? null, reps: last?.reps ?? null, done: true }] };
                })
              }
            >
              <Plus /> Add set
            </Button>
          </div>
        ) : (
          <div key={e.id} className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">{name(e.exerciseId)}</h4>
            <ol className="flex flex-col divide-y rounded-lg border">
              {e.sets.map((x) => (
                <li key={x.id} className={cn('flex items-center gap-3 px-3 py-2 text-sm', x.warmup && 'text-muted-foreground')}>
                  <NumBadge className={cn(x.warmup && 'bg-warning-soft text-warning')}>{x.warmup ? 'W' : ++n}</NumBadge>
                  <span className="tabular">
                    {formatW(x.weight ?? 0)} × {x.reps}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        );
      })}

      {draft ? (
        <Field>
          <FieldLabel htmlFor={`${id}-notes`}>Notes</FieldLabel>
          <Textarea id={`${id}-notes`} rows={2} value={draft.note ?? ''} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
        </Field>
      ) : (
        workout.note && <p className="rounded-lg bg-muted px-3 py-2 text-sm">📝 {workout.note}</p>
      )}
      {!draft && <p className="text-xs text-muted-foreground">Made a mistake? Tap Edit to fix weights, reps or sets.</p>}
    </Modal>
  );
}
