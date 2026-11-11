import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { actions, exerciseMap, useAppState } from '@/lib/store';
import type { Exercise, Workout } from '@/lib/types';
import {
  formatDate,
  formatDuration,
  formatKg,
  formatVolume,
  formatW,
  newSet,
  unitLabel,
  workoutSetCount,
  workoutVolume,
} from '@/lib/utils';
import { confirmDialog } from '../Confirm';
import { DownIcon, EditIcon, LeftIcon, PlusIcon, RightIcon, UpIcon, XIcon } from '../Icons';
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
    <div className="screen">
      <ScreenHeader eyebrow={`${s.workouts.length} workouts saved`} title="History" />

      {s.workouts.length > 0 && <MonthCalendar workouts={s.workouts} onOpen={setOpenId} />}

      {!s.workouts.length && (
        <div className="card empty-plan">
          <div className="empty-emoji" aria-hidden>
            🗓️
          </div>
          <h2>No workouts yet</h2>
          <p className="muted">Finish your first workout and it will appear here.</p>
        </div>
      )}

      {groups.map(([month, list]) => (
        <section key={month}>
          <h2 className="section-title">{month}</h2>
          {list.map((w) => (
            <button key={w.id} className="card history-card" onClick={() => setOpenId(w.id)}>
              <div className="row between">
                <h3>{w.name}</h3>
                <span className="muted small">{formatDate(w.startedAt)}</span>
              </div>
              <p className="muted small">
                ⏱ {formatDuration((w.finishedAt ?? w.startedAt) - w.startedAt)} · {workoutSetCount(w)} sets ·{' '}
                {formatVolume(workoutVolume(w))}
              </p>
              <ul className="ex-preview">
                {w.exercises.map((e) => {
                  const working = e.sets.filter((x) => !x.warmup);
                  const best = working.reduce<(typeof working)[number] | null>(
                    (a, b) => (!a || (b.weight ?? 0) > (a.weight ?? 0) ? b : a),
                    null,
                  );
                  return (
                    <li key={e.id}>
                      <span>
                        {working.length} × {name(e.exerciseId)}
                      </span>
                      {best && (
                        <span className="muted">
                          {formatKg(best.weight ?? 0)}×{best.reps}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </button>
          ))}
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
  const lead = (month.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  const count = workouts.filter((w) => w.startedAt >= first && w.startedAt < new Date(month.getFullYear(), month.getMonth() + 1, 1).getTime()).length;
  const isThisMonth = month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth();
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));

  return (
    <section className="card calendar">
      <div className="card-head">
        <div>
          <h2 className="card-title">{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h2>
          <p className="muted small">
            {count} workout{count === 1 ? '' : 's'} {isThisMonth ? 'so far this month' : 'this month'}
          </p>
        </div>
        <div className="row">
          <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month">
            <LeftIcon />
          </button>
          <button className="icon-btn" onClick={() => shift(1)} disabled={isThisMonth} aria-label="Next month">
            <RightIcon />
          </button>
        </div>
      </div>
      <div className="cal-grid" role="grid">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="cal-head">
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const list = byDay.get(dayKey(d.getTime())) ?? [];
          const isToday = dayKey(d.getTime()) === dayKey(Date.now());
          const future = d.getTime() > Date.now() && !isToday;
          return (
            <button
              key={i}
              className={`cal-day ${list.length ? 'trained' : ''} ${isToday ? 'today' : ''}`}
              disabled={!list.length}
              onClick={() => list[0] && onOpen(list[0].id)}
              aria-label={`${formatDate(d.getTime(), { day: 'numeric', month: 'long' })}${list.length ? `: ${list.map((w) => w.name).join(', ')}` : ''}`}
              style={future ? { opacity: 0.35 } : undefined}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function WorkoutDetail({
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
      onClose={close}
      footer={
        draft ? (
          <div className="row gap">
            <button className="btn" onClick={() => setDraft(null)}>
              Cancel
            </button>
            <button className="btn primary grow" onClick={save}>
              Save changes
            </button>
          </div>
        ) : (
          <div className="row gap wrap">
            <button className="btn primary grow" disabled={!canRepeat} onClick={onRepeat}>
              Do this workout again
            </button>
            <button className="btn soft" onClick={() => setDraft(structuredClone(workout))}>
              <EditIcon size={16} /> Edit
            </button>
            <button
              className="btn danger-text"
              onClick={() => {
                const backup = workout;
                actions.deleteWorkout(workout.id);
                onClose();
                toast('Workout deleted', { duration: 6000, action: { label: 'Undo', onClick: () => actions.restoreWorkout(backup) } });
              }}
            >
              Delete
            </button>
          </div>
        )
      }
    >
      {draft ? (
        <label className="field">
          <span>Workout name</span>
          <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </label>
      ) : (
        <p className="muted small">
          {formatDate(workout.startedAt, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
          {new Date(workout.startedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} ·{' '}
          {formatDuration((workout.finishedAt ?? workout.startedAt) - workout.startedAt)}
        </p>
      )}

      {w.exercises.map((e, ei) => {
        let n = 0;
        return draft ? (
          <div key={e.id} className="plan-item">
            <div className="row gap">
              <strong className="grow">{name(e.exerciseId)}</strong>
              <button
                className="icon-btn sm"
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
                <UpIcon />
              </button>
              <button
                className="icon-btn sm"
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
                <DownIcon />
              </button>
              <button className="icon-btn sm" aria-label="Remove exercise" onClick={() => editEx(e.id, () => null)}>
                <XIcon size={16} />
              </button>
            </div>
            {e.sets.map((x, si) => (
              <div key={x.id} className="edit-set">
                <span className={`set-no static ${x.warmup ? 'warm-no' : ''}`}>{x.warmup ? 'W' : ++n}</span>
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
                <button
                  className="icon-btn sm"
                  aria-label="Delete set"
                  onClick={() => editEx(e.id, (ex) => ({ ...ex, sets: ex.sets.filter((y) => y.id !== x.id) }))}
                >
                  <XIcon size={16} />
                </button>
              </div>
            ))}
            <button
              className="btn small soft"
              onClick={() =>
                editEx(e.id, (ex) => {
                  const last = ex.sets[ex.sets.length - 1];
                  return { ...ex, sets: [...ex.sets, { ...newSet(), weight: last?.weight ?? null, reps: last?.reps ?? null, done: true }] };
                })
              }
            >
              <PlusIcon size={14} /> Add set
            </button>
          </div>
        ) : (
          <div key={e.id} className="detail-ex">
            <h4>{name(e.exerciseId)}</h4>
            <ol className="detail-sets">
              {e.sets.map((x) => (
                <li key={x.id} className={x.warmup ? 'warm' : ''}>
                  <span className="set-no static">{x.warmup ? 'W' : ++n}</span>
                  <span>
                    {formatW(x.weight ?? 0)} × {x.reps}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        );
      })}

      {draft ? (
        <label className="field">
          <span>Notes</span>
          <textarea className="input" rows={2} value={draft.note ?? ''} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
        </label>
      ) : (
        workout.note && <p className="ex-note">📝 {workout.note}</p>
      )}
      {!draft && <p className="muted small">Made a mistake? Tap Edit to fix weights, reps or sets.</p>}
    </Modal>
  );
}

