import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { actions, exerciseHistory, useAppState } from '@/lib/store';
import { formatDate, formatKg, formatVolume, formatW } from '@/lib/utils';
import { LineChart } from '../Charts';
import { confirmDialog } from '../Confirm';
import { ArrowDownIcon, ArrowUpIcon } from '../Icons';
import { Modal } from '../Modal';

type Metric = 'weight' | '1rm' | 'volume' | 'reps';

const METRIC_LABEL: Record<Metric, string> = {
  weight: 'Heaviest',
  '1rm': 'Est. max',
  volume: 'Volume',
  reps: 'Reps',
};
const METRIC_HELP: Record<Metric, string> = {
  weight: 'Heaviest weight you lifted in each session.',
  '1rm': 'Estimated weight you could lift once — goes up when you add weight or reps.',
  volume: 'Total weight moved: weight × reps, all sets added up.',
  reps: 'Most reps in one set.',
};

/** Stats, chart and session list for one exercise. */
export function ExerciseStats({ exerciseId }: { exerciseId: string }) {
  const s = useAppState();
  const sessions = useMemo(() => exerciseHistory(s, exerciseId), [s, exerciseId]);
  const bodyweight = sessions.length > 0 && sessions.every((x) => x.maxWeight === 0);
  const [metric, setMetric] = useState<Metric>(bodyweight ? 'reps' : 'weight');
  const [showAll, setShowAll] = useState(false);

  if (!sessions.length) {
    return <p className="muted center">No sessions logged yet for this exercise.</p>;
  }

  const value = (x: (typeof sessions)[number]) =>
    metric === '1rm' ? x.best1RM : metric === 'weight' ? x.maxWeight : metric === 'volume' ? x.volume : x.maxReps;
  const fmt = (v: number) => (metric === 'reps' ? `${Math.round(v)}` : metric === 'volume' ? formatVolume(v) : formatW(v));
  const points = sessions.slice(-24).map((x) => ({
    label: formatDate(x.date, { day: 'numeric', month: 'short' }),
    detail: `${formatDate(x.date, { weekday: 'short', day: 'numeric', month: 'short' })} · ${x.sets.map((y) => `${formatKg(y.weight ?? 0)}×${y.reps}`).join(', ')}`,
    value: value(x),
  }));

  const maxWeight = Math.max(...sessions.map((x) => x.maxWeight));
  const maxReps = Math.max(...sessions.map((x) => x.maxReps));
  const first = sessions[0];
  const last = sessions[sessions.length - 1];
  const change = bodyweight ? last.maxReps - first.maxReps : last.maxWeight - first.maxWeight;
  const metrics = (Object.keys(METRIC_LABEL) as Metric[]).filter((m) => (bodyweight ? m === 'reps' : m !== 'reps'));
  const list = [...sessions].reverse();

  return (
    <div className="ex-stats">
      <div className="stats">
        <div className="stat">
          <strong>{bodyweight ? maxReps : formatW(maxWeight)}</strong>
          <span>{bodyweight ? 'best reps' : 'heaviest ever'}</span>
        </div>
        <div className="stat">
          <strong className={`delta ${change > 0 ? 'up' : change < 0 ? 'down' : ''}`}>
            {change > 0 ? <ArrowUpIcon /> : change < 0 ? <ArrowDownIcon /> : null}
            {change > 0 ? '+' : ''}
            {bodyweight ? change : formatW(change)}
          </strong>
          <span>{change > 0 ? 'stronger' : 'change'} since first time</span>
        </div>
        <div className="stat">
          <strong>{sessions.length}</strong>
          <span>sessions</span>
        </div>
      </div>

      {metrics.length > 1 && (
        <div className="segmented" role="radiogroup" aria-label="What to show">
          {metrics.map((m) => (
            <button key={m} role="radio" aria-checked={metric === m} className={metric === m ? 'on' : ''} onClick={() => setMetric(m)}>
              {METRIC_LABEL[m]}
            </button>
          ))}
        </div>
      )}
      <p className="muted small">{METRIC_HELP[metric]} Tap the chart to see each session.</p>
      <LineChart points={points} fmt={fmt} label={`${METRIC_LABEL[metric]} per session`} />

      <h3 className="sub-title">Sessions</h3>
      <ul className="session-list">
        {list.slice(0, showAll ? undefined : 4).map((x, i) => (
          <li key={x.workoutId + i}>
            <div className="row between">
              <strong>{formatDate(x.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong>
              {!bodyweight && <span className="muted small">{formatVolume(x.volume)}</span>}
            </div>
            <div className="last-sets">
              {x.sets.map((set) => (
                <span key={set.id} className="pill">
                  {formatKg(set.weight ?? 0)}×{set.reps}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {list.length > 4 && (
        <button className="btn ghost small" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Show less' : `Show all ${list.length} sessions`}
        </button>
      )}
    </div>
  );
}

export function ExerciseHistoryModal({ exerciseId, onClose }: { exerciseId: string; onClose: () => void }) {
  const s = useAppState();
  const ex = s.exercises.find((e) => e.id === exerciseId);
  const [note, setNote] = useState(ex?.note ?? '');
  if (!ex) return null;

  return (
    <Modal title={ex.name} onClose={onClose}>
      <p className="muted small">
        {ex.muscle} · {ex.equipment}
        {ex.custom ? ' · yours' : ''}
      </p>
      <label className="field">
        <span>Sticky note</span>
        <input
          className="input"
          placeholder="e.g. seat height 4, grip width…"
          value={note}
          onChange={(e) => {
            // Saved on every keystroke so closing the sheet never loses it.
            setNote(e.target.value);
            actions.updateExercise(ex.id, { note: e.target.value.trim() || undefined });
          }}
        />
      </label>
      <ExerciseStats exerciseId={exerciseId} />
      {ex.custom && (
        <button
          className="btn danger-text block"
          onClick={async () => {
            const ok = await confirmDialog({
              title: `Delete “${ex.name}”?`,
              message: 'It is removed from your weekly plans. Past workouts keep their numbers but show it as “Deleted exercise”.',
              confirmLabel: 'Delete',
              danger: true,
            });
            if (!ok) return;
            actions.deleteExercise(ex.id);
            onClose();
            toast(`“${ex.name}” deleted`);
          }}
        >
          Delete exercise
        </button>
      )}
    </Modal>
  );
}
