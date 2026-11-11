import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { compareSet, suggestTarget, type SetTarget } from '@/lib/progression';
import { actions, exerciseMap, lastSessionFor, useAppState } from '@/lib/store';
import type { Exercise, SetEntry, Workout, WorkoutExercise, WorkoutSummary } from '@/lib/types';
import { formatDate, formatDuration, formatKg, formatVolume, newSet, unitLabel, unlockAudio, useNow, useWakeLock, workoutVolume } from '@/lib/utils';
import { confirmDialog } from '../Confirm';
import { ExercisePicker } from '../ExercisePicker';
import { PlateCalculator } from '../PlateCalculator';
import { CheckIcon, PlusIcon } from '../Icons';
import { Modal } from '../Modal';
import { Stepper } from '../Stepper';
import { ExerciseHistoryModal } from './ExerciseHistory';

interface Props {
  onFinished: (s: WorkoutSummary) => void;
}

export function ActiveWorkout({ onFinished }: Props) {
  const s = useAppState();
  const w = s.active!;
  const now = useNow(1000);
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
    <div className="screen workout">
      <header className="workout-head">
        <div className="grow">
          <input
            className="title-input"
            value={w.name}
            onChange={(e) => actions.updateActive((x) => ({ ...x, name: e.target.value }))}
            aria-label="Workout name"
          />
          <p className="muted small">
            ⏱ {formatDuration(now - w.startedAt)} · {doneSets}/{totalSets} sets · {formatVolume(workoutVolume(w))}
          </p>
        </div>
        <button className="btn primary" onClick={finish}>
          Finish
        </button>
      </header>

      {w.exercises.length === 0 && (
        <div className="card empty-card">
          <p>Add the exercises you are doing today. Last time&apos;s weight & reps will show automatically.</p>
        </div>
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

      <button className="btn soft block lg" onClick={() => setPicking(true)}>
        <PlusIcon /> Add exercise
      </button>

      <textarea
        className="input"
        rows={2}
        placeholder="Workout notes (how you felt, sleep, energy…)"
        value={w.note ?? ''}
        onChange={(e) => actions.updateActive((x) => ({ ...x, note: e.target.value }))}
      />

      <button className="btn danger-text block" onClick={cancel}>
        Discard workout
      </button>

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
    <input
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
    unlockAudio();
    updateSet(we.id, set.id, { weight, reps, done: true });
    actions.startRest();
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
    <section className={`card ex-card ${allDone ? 'complete' : ''}`}>
      <div className="ex-head">
        <button className="ex-title" onClick={onHistory}>
          <h3>{ex.name}</h3>
          <span className="muted small">
            {ex.muscle} · goal {repLabel(we)} reps · tap for history
          </span>
        </button>
        {ex.equipment === 'Barbell' && (
          <button className="btn small soft" onClick={() => setPlates(true)} title="Which plates to load">
            Plates
          </button>
        )}
        <button className="icon-btn" onClick={onOptions} aria-label="Exercise options">
          ⋯
        </button>
      </div>

      {ex.note && <p className="ex-note">📌 {ex.note}</p>}

      {last ? (
        <div className="last-time">
          <span className="muted small">Last time · {formatDate(last.date)}</span>
          <div className="last-sets">
            {last.sets.map((x) => (
              <span key={x.id} className={`pill ${x.warmup ? 'warm' : ''}`}>
                {x.warmup && 'W '}
                {formatKg(x.weight ?? 0)}×{x.reps}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="muted small first-time">First time — pick a weight you can lift for {repLabel(we)} reps.</p>
      )}

      {target && (
        <div className={`target ${target.kind}`}>
          <span>{target.kind === 'increase' ? '⬆️' : '🎯'}</span>
          <span className="grow">{target.message}</span>
          <button className="btn small" onClick={fillTargets}>
            Fill
          </button>
        </div>
      )}

      <div className="set-table" role="table">
        <div className="set-row head" role="row">
          <span>Set</span>
          <span>Previous</span>
          <span>{unitLabel()}</span>
          <span>Reps</span>
          <span aria-label="Done" />
        </div>
        {rows.map(({ set, kindIndex, prev, hint }) => {
          const cmp = compareSet(set, prev);
          return (
            <div key={set.id} className={`set-row ${set.done ? 'done' : ''} ${set.warmup ? 'warm' : ''}`} role="row">
              <button
                className="set-no"
                title="Tap to mark as warm-up"
                onClick={() => updateSet(we.id, set.id, { warmup: !set.warmup })}
              >
                {set.warmup ? 'W' : kindIndex + 1}
              </button>
              <span className="prev">
                {prev ? `${formatKg(prev.weight ?? 0)}×${prev.reps}` : '—'}
                {cmp === 'up' && <b className="up">▲</b>}
                {cmp === 'down' && <b className="down">▼</b>}
              </span>
              <NumInput
                className="num"
                inputMode="decimal"
                placeholder={hint ? formatKg(hint.weight) : '0'}
                value={set.weight}
                onValue={(n) => updateSet(we.id, set.id, { weight: n, done: false })}
                aria-label="Weight"
              />
              <NumInput
                className={`num ${needInput === set.id ? 'need' : ''}`}
                inputMode="numeric"
                placeholder={hint ? String(hint.reps) : '0'}
                value={set.reps}
                onValue={(n) => updateSet(we.id, set.id, { reps: n == null ? null : Math.round(n), done: false })}
                aria-label="Reps"
              />
              <button
                className={`check ${set.done ? 'on' : ''}`}
                onClick={() => toggleDone(set, hint)}
                aria-label={set.done ? 'Mark set not done' : 'Mark set done'}
              >
                <CheckIcon />
              </button>
            </div>
          );
        })}
      </div>

      <div className="row gap">
        <button
          className="btn small grow"
          onClick={() => updateExercise(we.id, (e) => ({ ...e, sets: [...e.sets, newSet()] }))}
        >
          <PlusIcon size={16} /> Add set
        </button>
        <button
          className="btn small"
          disabled={we.sets.length <= 1}
          onClick={() => updateExercise(we.id, (e) => ({ ...e, sets: e.sets.slice(0, -1) }))}
        >
          − Remove set
        </button>
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
    </section>
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
      <div className="field">
        <span>Goal reps per set (when every set hits this, the app tells you to add weight)</span>
        <Stepper value={we.repMax} onChange={setReps} label="reps" />
      </div>

      <label className="field">
        <span>Sticky note for this exercise</span>
        <input
          className="input"
          placeholder="e.g. seat height 4, grip width…"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            actions.updateExercise(ex.id, { note: e.target.value.trim() || undefined });
          }}
        />
      </label>

      <div className="row gap">
        <button className="btn grow" disabled={idx === 0} onClick={() => move(-1)}>
          ↑ Move up
        </button>
        <button className="btn grow" disabled={idx === workout.exercises.length - 1} onClick={() => move(1)}>
          ↓ Move down
        </button>
      </div>
      <button
        className="btn danger-text block"
        onClick={() => {
          actions.updateActive((w) => ({ ...w, exercises: w.exercises.filter((e) => e.id !== we.id) }));
          onClose();
        }}
      >
        Remove from this workout
      </button>
    </Modal>
  );
}
