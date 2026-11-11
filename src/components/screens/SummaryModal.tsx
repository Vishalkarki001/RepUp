import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { actions, exerciseMap, useAppState } from '@/lib/store';
import { WEEKDAYS_LONG, type DayPlan, type WorkoutSummary } from '@/lib/types';
import { formatDuration, formatVolume, formatW, workoutSetCount, workoutVolume } from '@/lib/utils';
import { CheckIcon } from '../Icons';
import { Modal } from '../Modal';

export function SummaryModal({ summary, onClose }: { summary: WorkoutSummary; onClose: () => void }) {
  const s = useAppState();
  const exMap = useMemo(() => exerciseMap(s), [s]);
  const { workout, prs, planUpdate } = summary;

  return (
    <Modal
      title="Workout complete 💪"
      onClose={onClose}
      footer={
        <button className="btn primary block lg" onClick={onClose}>
          Done
        </button>
      }
    >
      <h3 className="center">{workout.name}</h3>
      <div className="stats">
        <div className="stat">
          <strong>{formatDuration((workout.finishedAt ?? Date.now()) - workout.startedAt)}</strong>
          <span>duration</span>
        </div>
        <div className="stat">
          <strong>{workoutSetCount(workout)}</strong>
          <span>sets</span>
        </div>
        <div className="stat">
          <strong>{formatVolume(workoutVolume(workout))}</strong>
          <span>volume</span>
        </div>
      </div>

      {prs.length > 0 ? (
        <div className="pr-box">
          <h4>🏆 New personal records</h4>
          <ul>
            {prs.map((p, i) => (
              <li key={p.exerciseId + i}>
                <span>{exMap.get(p.exerciseId)?.name}</span>
                <strong>{p.weight > 0 ? `${formatW(p.weight)} × ${p.reps}` : `${p.reps} reps`}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="muted center">Saved. Next time you&apos;ll see today&apos;s numbers and a new target for each exercise.</p>
      )}

      {planUpdate && <PlanUpdateCard update={planUpdate} />}
    </Modal>
  );
}

/** Offers to copy today's changes (new/removed exercises, sets, reps) into the weekday plan. */
function PlanUpdateCard({ update }: { update: DayPlan }) {
  const s = useAppState();
  const exMap = useMemo(() => exerciseMap(s), [s]);
  const [saved, setSaved] = useState(false);
  // Snapshot of the plan before saving, so the change list stays visible afterwards.
  const [before] = useState(() => s.plans.find((p) => p.day === update.day));
  const old = new Map((before?.items ?? []).map((i) => [i.exerciseId, i]));
  const removed = (before?.items ?? []).filter((i) => !update.items.some((x) => x.exerciseId === i.exerciseId));
  const day = WEEKDAYS_LONG[update.day];

  return (
    <div className="plan-update">
      <h4>{before ? `You changed ${day}’s workout` : `Make this ${day}’s workout?`}</h4>
      <p className="muted small">
        {before ? `Save the changes so next ${day} starts like today:` : `Next ${day} will start with these exercises:`}
      </p>
      <ul>
        {update.items.map((i, n) => {
          const o = old.get(i.exerciseId);
          const tag = !o ? 'new' : o.sets !== i.sets || o.reps !== i.reps ? 'changed' : '';
          return (
            <li key={i.exerciseId + n}>
              <span className="grow">{exMap.get(i.exerciseId)?.name ?? 'Exercise'}</span>
              {tag && <span className={`tag ${tag}`}>{tag}</span>}
              <strong>
                {i.sets} × {i.reps}
              </strong>
            </li>
          );
        })}
        {removed.map((i) => (
          <li key={i.exerciseId} className="removed">
            <span className="grow">{exMap.get(i.exerciseId)?.name ?? 'Exercise'}</span>
            <span className="tag removed">removed</span>
          </li>
        ))}
      </ul>
      <button
        className={`btn block ${saved ? '' : 'soft'}`}
        disabled={saved}
        onClick={() => {
          actions.savePlan(update);
          setSaved(true);
          toast.success(`Next ${day} will start like today`);
        }}
      >
        {saved ? (
          <>
            <CheckIcon size={16} /> {day}’s plan updated
          </>
        ) : (
          `Update ${day}’s plan`
        )}
      </button>
    </div>
  );
}
