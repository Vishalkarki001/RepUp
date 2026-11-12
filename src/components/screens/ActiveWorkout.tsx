import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Ellipsis, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel, FieldTitle } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { compareSet, suggestTarget, type SetTarget } from '@/lib/progression';
import { actions, exerciseMap, lastSessionFor, useAppState } from '@/lib/store';
import type { Exercise, SetEntry, Workout, WorkoutExercise, WorkoutSummary } from '@/lib/types';
import { cn, formatDate, formatKg, formatVolume, newSet, unitLabel, useWakeLock, workoutVolume } from '@/lib/utils';
import { EmptyState } from '../common';
import { confirmDialog } from '../Confirm';
import { ExercisePicker } from '../ExercisePicker';
import { PlateCalculator } from '../PlateCalculator';
import { Modal } from '../Modal';
import { Stepper } from '../Stepper';
import { ExerciseHistoryModal } from './ExerciseHistory';

interface Props {
  onFinished: (s: WorkoutSummary) => void;
}

export function ActiveWorkout({ onFinished }: Props) {
  const s = useAppState();
  const w = s.active!;
  useWakeLock(true); // keep the screen on at the gym
  const exMap = useMemo(() => exerciseMap(s), [s]);
  const [picking, setPicking] = useState(false);
  const [optionsFor, setOptionsFor] = useState<string | null>(null);
  const [historyFor, setHistoryFor] = useState<string | null>(null);

  const doneSets = w.exercises.reduce((a, e) => a + e.sets.filter((x) => x.done).length, 0);
  const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0);

  const finish = async () => {
    const pending = totalSets - doneSets;
    if (!doneSets) {
      toast.error('Tick at least one set ✓ before finishing.');
      return;
    }
    if (
      pending > 0 &&
      !(await confirmDialog({
        title: 'Finish workout?',
        message: `${pending} set${pending > 1 ? 's are' : ' is'} not ticked and won’t be saved.`,
        confirmLabel: 'Finish',
        cancelLabel: 'Keep going',
      }))
    )
      return;
    const summary = actions.finishWorkout();
    if (summary) onFinished(summary);
  };

  const cancel = async () => {
    const ok = await confirmDialog({
      title: 'Discard this workout?',
      message: 'Nothing from this session will be saved.',
      confirmLabel: 'Discard',
      danger: true,
    });
    if (!ok) return;
    const backup = w;
    actions.cancelWorkout();
    toast('Workout discarded', { duration: 6000, action: { label: 'Undo', onClick: () => actions.restoreActive(backup) } });
  };

  const optionsEx = w.exercises.find((e) => e.id === optionsFor);

  return (
    <div className="flex flex-col gap-4">
      <header className="sticky top-0 z-10 -mx-4 -mt-[env(safe-area-inset-top,0px)] flex items-center gap-3 border-b bg-background/90 px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-3 backdrop-blur-lg md:-mx-8 md:px-8">
        <div className="min-w-0 flex-1">
          <Input
            className="-mx-1 h-auto truncate rounded-md border-transparent bg-transparent px-1 py-0 text-xl font-semibold tracking-tight shadow-none focus-visible:bg-muted md:text-xl dark:bg-transparent"
            value={w.name}
            onChange={(e) => actions.updateActive((x) => ({ ...x, name: e.target.value }))}
            aria-label="Workout name"
          />
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground tabular">
            {doneSets}/{totalSets} sets · {formatVolume(workoutVolume(w))}
          </p>
        </div>
        <Button size="lg" className="h-10 shrink-0 px-4" onClick={finish}>
          Finish
        </Button>
      </header>

      {w.exercises.length === 0 && (
        <EmptyState emoji="🏋️" title="No exercises yet">
          Add the exercises you are doing today. Last time&apos;s weight & reps will show automatically.
        </EmptyState>
      )}

      {w.exercises.map((we) => {
        const ex = exMap.get(we.exerciseId);
        if (!ex) return null;
        return (
          <ExerciseCard
            key={we.id}
            we={we}
            ex={ex}
            onOptions={() => setOptionsFor(we.id)}
            onHistory={() => setHistoryFor(we.exerciseId)}
          />
        );
      })}

      <Button variant="outline" size="lg" className="h-11 w-full" onClick={() => setPicking(true)}>
        <Plus /> Add exercise
      </Button>

      <Textarea
        rows={2}
        placeholder="Workout notes (how you felt, sleep, energy…)"
        value={w.note ?? ''}
        onChange={(e) => actions.updateActive((x) => ({ ...x, note: e.target.value }))}
        aria-label="Workout notes"
      />

      <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={cancel}>
        Discard workout
      </Button>

      {picking && (
        <ExercisePicker
          onClose={() => setPicking(false)}
          onPick={(ids) => {
            actions.addToActive(ids);
            setPicking(false);
          }}
        />
      )}
      {optionsEx && exMap.get(optionsEx.exerciseId) && (
        <ExerciseOptions we={optionsEx} ex={exMap.get(optionsEx.exerciseId)!} workout={w} onClose={() => setOptionsFor(null)} />
      )}
      {historyFor && <ExerciseHistoryModal exerciseId={historyFor} onClose={() => setHistoryFor(null)} />}
    </div>
  );
}

/* ---------------------------------------------------------------- */

function updateExercise(id: string, fn: (e: WorkoutExercise) => WorkoutExercise) {
  actions.updateActive((w) => ({ ...w, exercises: w.exercises.map((e) => (e.id === id ? fn(e) : e)) }));
}

function updateSet(weId: string, setId: string, patch: Partial<SetEntry>) {
  updateExercise(weId, (e) => ({ ...e, sets: e.sets.map((x) => (x.id === setId ? { ...x, ...patch } : x)) }));
}

function repLabel(we: WorkoutExercise): string {
  return we.repMin === we.repMax ? String(we.repMax) : `${we.repMin}–${we.repMax}`;
}

function parseNum(v: string): number | null {
  if (v.trim() === '') return null;
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Set table columns: set no · previous · kg · reps · ✓ (narrower on tiny phones). */
const GRID =
  'grid grid-cols-[1.75rem_minmax(0,1fr)_3.75rem_3rem_2.75rem] items-center gap-1.5 min-[360px]:grid-cols-[2rem_minmax(0,1fr)_4.5rem_3.5rem_2.75rem] min-[360px]:gap-2';

const NUM_INPUT =
  'h-11 rounded-md bg-background px-1 text-center text-base font-semibold tabular placeholder:font-normal placeholder:text-muted-foreground/70 md:text-base';

/** Text input that keeps the raw draft while typing (so "62." isn't lost). */
function NumInput({
  value,
  onValue,
  ...rest
}: { value: number | null; onValue: (n: number | null) => void } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
>) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <Input
      {...rest}
      type="text"
      enterKeyHint="next"
      autoComplete="off"
      value={draft ?? (value ?? '')}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const v = e.target.value.replace(/[^0-9.,]/g, '');
        setDraft(v);
        onValue(parseNum(v));
      }}
      onBlur={() => setDraft(null)}
    />
  );
}

function ExerciseCard({
  we,
  ex,
  onOptions,
  onHistory,
}: {
  we: WorkoutExercise;
  ex: Exercise;
  onOptions: () => void;
  onHistory: () => void;
}) {
  const s = useAppState();
  const last = useMemo(() => lastSessionFor(s, we.exerciseId), [s.workouts, we.exerciseId]);
  const target = useMemo(
    () => suggestTarget(last?.sets ?? null, { repMin: we.repMin, repMax: we.repMax }, ex.equipment),
    [last, we.repMin, we.repMax, ex.equipment],
  );
  const [needInput, setNeedInput] = useState<string | null>(null);
  const [plates, setPlates] = useState(false);

  const prevWorking = last?.sets.filter((x) => !x.warmup) ?? [];
  const prevWarmup = last?.sets.filter((x) => x.warmup) ?? [];

  // Index of each set among its kind (warm-up / working).
  let wi = 0;
  let wu = 0;
  const rows = we.sets.map((set, i) => {
    const kindIndex = set.warmup ? wu++ : wi++;
    const prev = set.warmup ? prevWarmup[kindIndex] : prevWorking[kindIndex];
    const above = we.sets[i - 1];
    let hint: SetTarget | null = null;
    if (!set.warmup && target) hint = target.forSet(kindIndex);
    else if (prev) hint = { weight: prev.weight ?? 0, reps: prev.reps ?? 0 };
    else if (above && !above.warmup === !set.warmup && (above.weight != null || above.reps != null))
      hint = { weight: above.weight ?? 0, reps: above.reps ?? 0 };
    return { set, kindIndex, prev, hint };
  });

  const toggleDone = (set: SetEntry, hint: SetTarget | null) => {
    if (set.done) {
      updateSet(we.id, set.id, { done: false });
      return;
    }
    const weight = set.weight ?? hint?.weight ?? 0;
    const reps = set.reps ?? hint?.reps ?? null;
    if (!reps) {
      setNeedInput(set.id);
      setTimeout(() => setNeedInput(null), 1200);
      return;
    }
    updateSet(we.id, set.id, { weight, reps, done: true });
  };

  const fillTargets = () => {
    if (!target) return;
    let k = 0;
    updateExercise(we.id, (e) => ({
      ...e,
      sets: e.sets.map((x) => {
        if (x.warmup) return x;
        const t = target.forSet(k++);
        return x.done ? x : { ...x, weight: t.weight, reps: t.reps };
      }),
    }));
  };

  const allDone = we.sets.length > 0 && we.sets.every((x) => x.done);

  return (
    <Card size="sm" className={cn('gap-3 px-3 sm:px-4', allDone && 'ring-success/40')}>
      <div className="flex items-start gap-1.5">
        <Button
          variant="ghost"
          className="-ml-1 h-auto min-w-0 flex-1 flex-col items-start gap-0 rounded-md px-1 py-0.5 text-left font-normal whitespace-normal hover:bg-muted/60"
          onClick={onHistory}
        >
          <h3 className="w-full truncate text-base font-semibold text-brand">{ex.name}</h3>
          <span className="block w-full truncate text-xs text-muted-foreground">
            {ex.muscle} · goal {repLabel(we)} reps · tap for history
          </span>
        </Button>
        {ex.equipment === 'Barbell' && (
          <Button variant="secondary" size="sm" onClick={() => setPlates(true)} title="Which plates to load">
            Plates
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" className="-mr-1 text-muted-foreground" onClick={onOptions} aria-label="Exercise options">
          <Ellipsis />
        </Button>
      </div>

      {ex.note && <p className="rounded-md bg-muted px-2.5 py-1.5 text-xs">📌 {ex.note}</p>}

      {last ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Last time · {formatDate(last.date)}</span>
          <div className="flex flex-wrap gap-1">
            {last.sets.map((x) => (
              <Badge
                key={x.id}
                variant={x.warmup ? 'secondary' : 'outline'}
                className={cn('font-medium tabular', x.warmup && 'text-muted-foreground')}
              >
                {x.warmup && 'W '}
                {formatKg(x.weight ?? 0)}×{x.reps}
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">First time — pick a weight you can lift for {repLabel(we)} reps.</p>
      )}

      {target && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
            target.kind === 'increase' ? 'bg-success-soft text-success' : 'bg-accent text-accent-foreground',
          )}
        >
          <span aria-hidden>{target.kind === 'increase' ? '⬆️' : '🎯'}</span>
          <span className="min-w-0 flex-1 font-medium">{target.message}</span>
          <Button variant="outline" size="sm" className="shrink-0" onClick={fillTargets}>
            Fill
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-1" role="table">
        <div
          className={cn(GRID, 'px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase')}
          role="row"
        >
          <span className="text-center">Set</span>
          <span>Previous</span>
          <span className="text-center">{unitLabel()}</span>
          <span className="text-center">Reps</span>
          <span aria-label="Done" />
        </div>
        {rows.map(({ set, kindIndex, prev, hint }) => {
          const cmp = compareSet(set, prev);
          return (
            <div
              key={set.id}
              className={cn(GRID, 'rounded-lg px-1 py-1 transition-colors', set.done && 'bg-success-soft')}
              role="row"
            >
              <Button
                variant="secondary"
                size="sm"
                className={cn(
                  'h-9 w-full px-0 text-xs font-semibold tabular',
                  set.warmup && 'bg-warning-soft text-warning hover:bg-warning-soft',
                )}
                title="Tap to mark as warm-up"
                aria-label={set.warmup ? 'Warm-up set — tap to make it a working set' : `Set ${kindIndex + 1} — tap to mark as warm-up`}
                onClick={() => updateSet(we.id, set.id, { warmup: !set.warmup })}
              >
                {set.warmup ? 'W' : kindIndex + 1}
              </Button>
              <span className="truncate text-xs text-muted-foreground tabular">
                {prev ? `${formatKg(prev.weight ?? 0)}×${prev.reps}` : '—'}
                {cmp === 'up' && <b className="ml-0.5 text-success">▲</b>}
                {cmp === 'down' && <b className="ml-0.5 text-destructive">▼</b>}
              </span>
              <NumInput
                className={NUM_INPUT}
                inputMode="decimal"
                placeholder={hint ? formatKg(hint.weight) : '0'}
                value={set.weight}
                onValue={(n) => updateSet(we.id, set.id, { weight: n, done: false })}
                aria-label="Weight"
              />
              <NumInput
                className={cn(NUM_INPUT, needInput === set.id && 'animate-shake border-destructive ring-3 ring-destructive/20')}
                inputMode="numeric"
                placeholder={hint ? String(hint.reps) : '0'}
                value={set.reps}
                onValue={(n) => updateSet(we.id, set.id, { reps: n == null ? null : Math.round(n), done: false })}
                aria-label="Reps"
              />
              <Button
                variant="outline"
                size="icon-lg"
                className={cn(
                  'size-11 rounded-md bg-muted text-muted-foreground active:scale-95',
                  set.done && 'border-transparent bg-success text-white hover:bg-success/90 hover:text-white dark:bg-success dark:hover:bg-success/90',
                )}
                onClick={() => toggleDone(set, hint)}
                aria-label={set.done ? 'Mark set not done' : 'Mark set done'}
                aria-pressed={set.done}
              >
                <Check className="size-5" strokeWidth={set.done ? 3 : 2.25} />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="h-9 flex-1"
          onClick={() => updateExercise(we.id, (e) => ({ ...e, sets: [...e.sets, newSet()] }))}
        >
          <Plus /> Add set
        </Button>
        <Button
          variant="outline"
          className="h-9"
          disabled={we.sets.length <= 1}
          onClick={() => updateExercise(we.id, (e) => ({ ...e, sets: e.sets.slice(0, -1) }))}
        >
          <Minus /> Remove set
        </Button>
      </div>
      {plates && (
        <PlateCalculator
          initial={(() => {
            const next = rows.find((r) => !r.set.done) ?? rows[rows.length - 1];
            return next?.set.weight ?? next?.hint?.weight ?? null;
          })()}
          onClose={() => setPlates(false)}
        />
      )}
    </Card>
  );
}

/* ---------------------------------------------------------------- */

function ExerciseOptions({
  we,
  ex,
  workout,
  onClose,
}: {
  we: WorkoutExercise;
  ex: Exercise;
  workout: Workout;
  onClose: () => void;
}) {
  const idx = workout.exercises.findIndex((e) => e.id === we.id);
  const [note, setNote] = useState(ex.note ?? '');

  const move = (dir: -1 | 1) => {
    actions.updateActive((w) => {
      const list = [...w.exercises];
      const j = idx + dir;
      if (j < 0 || j >= list.length) return w;
      [list[idx], list[j]] = [list[j], list[idx]];
      return { ...w, exercises: list };
    });
    onClose();
  };

  const setReps = (reps: number) => updateExercise(we.id, (e) => ({ ...e, repMin: reps, repMax: reps }));

  return (
    <Modal title={ex.name} onClose={onClose}>
      <Field>
        <FieldTitle>Goal reps per set</FieldTitle>
        <FieldDescription className="text-xs">When every set hits this, the app tells you to add weight.</FieldDescription>
        <Stepper value={we.repMax} onChange={setReps} label="reps" />
      </Field>

      <Field>
        <FieldLabel htmlFor={`note-${ex.id}`}>Sticky note for this exercise</FieldLabel>
        <Input
          id={`note-${ex.id}`}
          className="h-10"
          placeholder="e.g. seat height 4, grip width…"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            actions.updateExercise(ex.id, { note: e.target.value.trim() || undefined });
          }}
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-10" disabled={idx === 0} onClick={() => move(-1)}>
          <ArrowUp /> Move up
        </Button>
        <Button variant="outline" className="h-10" disabled={idx === workout.exercises.length - 1} onClick={() => move(1)}>
          <ArrowDown /> Move down
        </Button>
      </div>
      <Button
        variant="ghost"
        className="h-10 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => {
          actions.updateActive((w) => ({ ...w, exercises: w.exercises.filter((e) => e.id !== we.id) }));
          onClose();
        }}
      >
        Remove from this workout
      </Button>
    </Modal>
  );
}
