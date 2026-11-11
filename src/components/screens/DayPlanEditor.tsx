import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { actions, exerciseMap, planForDay, useAppState } from '@/lib/store';
import { unitLabel } from '@/lib/utils';
import { WEEKDAYS, WEEKDAYS_LONG, type PlanItem } from '@/lib/types';
import { ExercisePicker } from '../ExercisePicker';
import { DownIcon, PlusIcon, UpIcon, XIcon } from '../Icons';
import { Modal } from '../Modal';
import { NumberField } from '../NumberField';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Edit what to train on one weekday: a name + exercises with sets × reps. */
export function DayPlanEditor({ day, onClose }: { day: number; onClose: () => void }) {
  const s = useAppState();
  const exMap = useMemo(() => exerciseMap(s), [s]);
  const existing = planForDay(s, day);
  const [name, setName] = useState(existing?.name ?? '');
  const [items, setItems] = useState<PlanItem[]>(existing?.items ?? []);
  const [picking, setPicking] = useState(false);

  const otherDays = DAY_ORDER.filter((d) => d !== day)
    .map((d) => planForDay(s, d))
    .filter((p) => p !== null);

  const patch = (i: number, p: Partial<PlanItem>) => setItems((l) => l.map((x, j) => (j === i ? { ...x, ...p } : x)));

  const move = (i: number, dir: -1 | 1) =>
    setItems((l) => {
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const copy = [...l];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const save = () => {
    const clean = items.map((x) => ({
      ...x,
      sets: Math.max(1, x.sets || 3),
      reps: Math.max(1, x.reps || s.settings.defaultReps),
      weight: x.weight && x.weight > 0 ? Math.round(x.weight * 100) / 100 : null,
    }));
    actions.savePlan({ day, name: name.trim() || 'Workout', items: clean });
    toast.success(`${WEEKDAYS_LONG[day]}’s workout saved`);
    onClose();
  };

  const makeRestDay = () => {
    const before = existing;
    actions.savePlan({ day, name: '', items: [] });
    onClose();
    toast(`${WEEKDAYS_LONG[day]} is now a rest day`, {
      duration: 6000,
      action: before ? { label: 'Undo', onClick: () => actions.savePlan(before) } : undefined,
    });
  };

  return (
    <Modal
      title={`${WEEKDAYS_LONG[day]}'s workout`}
      onClose={onClose}
      footer={
        <div className="row gap">
          {existing && (
            <button className="btn danger-text" onClick={makeRestDay}>
              Rest day
            </button>
          )}
          <button className="btn primary grow" onClick={save} disabled={!items.length}>
            {items.length ? 'Save' : 'Add an exercise first'}
          </button>
        </div>
      }
    >
      <label className="field">
        <span>Workout name</span>
        <input
          className="input"
          placeholder="e.g. Chest day, Legs, Push"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
        />
      </label>

      <div className="field">
        <span>Exercises</span>
        {items.length === 0 && <p className="muted small">No exercises yet. Tap “Add exercise” below.</p>}
        {items.map((it, i) => (
          <div key={it.exerciseId + i} className="plan-item">
            <div className="row gap">
              <span className="num-badge">{i + 1}</span>
              <strong className="grow">{exMap.get(it.exerciseId)?.name ?? 'Deleted exercise'}</strong>
              <button className="icon-btn sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                <UpIcon />
              </button>
              <button className="icon-btn sm" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">
                <DownIcon />
              </button>
              <button className="icon-btn sm" onClick={() => setItems((l) => l.filter((_, j) => j !== i))} aria-label="Remove">
                <XIcon size={16} />
              </button>
            </div>
            <div className="plan-fields">
              <NumberField label="Sets" value={it.sets || null} onValue={(n) => patch(i, { sets: Math.min(20, n ?? 0) })} />
              <NumberField label="Reps" value={it.reps || null} onValue={(n) => patch(i, { reps: Math.min(999, n ?? 0) })} />
              <NumberField
                label={unitLabel() === 'kg' ? 'Kg' : 'Lb'}
                decimal
                placeholder="—"
                value={it.weight ?? null}
                onValue={(n) => patch(i, { weight: n })}
              />
            </div>
          </div>
        ))}
        <button className="btn soft block lg add-ex" onClick={() => setPicking(true)}>
          <PlusIcon /> Add exercise
        </button>
        {items.length > 0 && <p className="muted small">Weight is optional — leave it empty if you’re not sure yet.</p>}
      </div>

      {items.length === 0 && otherDays.length > 0 && (
        <div className="field">
          <span>Or copy another day</span>
          <div className="chips wrap">
            {otherDays.map((p) => (
              <button
                key={p.day}
                className="chip"
                onClick={() => {
                  setName(p.name);
                  setItems(p.items.map((x) => ({ ...x })));
                }}
              >
                {WEEKDAYS[p.day]} · {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {picking && (
        <ExercisePicker
          onClose={() => setPicking(false)}
          onPick={(ids) => {
            const reps = s.settings.defaultReps;
            setItems((l) => [...l, ...ids.map((exerciseId) => ({ exerciseId, sets: 3, reps }))]);
            setPicking(false);
          }}
        />
      )}
    </Modal>
  );
}
