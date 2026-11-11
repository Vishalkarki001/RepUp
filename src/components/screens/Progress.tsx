import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { actions, exerciseMap, useAppState } from '@/lib/store';
import { MUSCLES, type Muscle } from '@/lib/types';
import { formatDate, formatKg, formatVolume, formatW, startOfWeek, todayISO, unitLabel, workoutVolume } from '@/lib/utils';
import { BarChart, LineChart } from '../Charts';
import { XIcon } from '../Icons';
import { ScreenHeader } from '../ScreenHeader';
import { ExerciseStats } from './ExerciseHistory';

const WEEK = 7 * 86_400_000;
const SET_GOAL = 10;

export function ProgressScreen() {
  const s = useAppState();
  const exMap = useMemo(() => exerciseMap(s), [s]);

  // Exercises with history, most frequent first.
  const logged = useMemo(() => {
    const count = new Map<string, number>();
    for (const w of s.workouts) for (const e of w.exercises) count.set(e.exerciseId, (count.get(e.exerciseId) ?? 0) + 1);
    return [...count.entries()].filter(([id]) => exMap.has(id)).sort((a, b) => b[1] - a[1]);
  }, [s.workouts, exMap]);

  const [selected, setSelected] = useState('');
  const exerciseId = selected && exMap.has(selected) ? selected : (logged[0]?.[0] ?? '');

  const thisWeek = startOfWeek(Date.now());
  const weekly = Array.from({ length: 8 }, (_, i) => {
    const start = startOfWeek(thisWeek - (7 - i) * WEEK + WEEK / 2);
    const n = s.workouts.filter((w) => startOfWeek(w.startedAt) === start).length;
    return {
      label: i === 7 ? 'This wk' : formatDate(start, { day: 'numeric', month: 'short' }),
      value: n,
      detail: `${n} workout${n === 1 ? '' : 's'} · week of ${formatDate(start, { day: 'numeric', month: 'short' })}`,
    };
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = s.workouts.filter((w) => w.startedAt >= monthStart.getTime()).length;
  const totalVolume = s.workouts.reduce((a, w) => a + workoutVolume(w), 0);
  const avgPerWeek = weekly.reduce((a, w) => a + w.value, 0) / weekly.length;

  // Working sets per muscle group this week.
  const muscleSets = useMemo(() => {
    const out = new Map<Muscle, number>(MUSCLES.map((m) => [m, 0]));
    for (const w of s.workouts) {
      if (w.startedAt < thisWeek) continue;
      for (const e of w.exercises) {
        const m = exMap.get(e.exerciseId)?.muscle;
        if (m) out.set(m, (out.get(m) ?? 0) + e.sets.filter((x) => x.done && !x.warmup).length);
      }
    }
    return [...out.entries()].filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  }, [s.workouts, exMap, thisWeek]);
  const maxSets = Math.max(SET_GOAL * 1.6, ...muscleSets.map(([, n]) => n));

  return (
    <div className="screen wide">
      <ScreenHeader eyebrow="See how you’re improving" title="Progress" />

      <div className="stats four">
        <div className="stat">
          <strong>{s.workouts.length}</strong>
          <span>workouts in total</span>
        </div>
        <div className="stat">
          <strong>{thisMonth}</strong>
          <span>this month</span>
        </div>
        <div className="stat">
          <strong>{formatVolume(totalVolume)}</strong>
          <span>lifted in total</span>
        </div>
        <div className="stat">
          <strong>{formatKg(avgPerWeek)}</strong>
          <span>workouts / week (avg)</span>
        </div>
      </div>

      {!s.workouts.length && (
        <div className="card empty-plan">
          <div className="empty-emoji" aria-hidden>
            📈
          </div>
          <h2>Your charts will appear here</h2>
          <p className="muted">Finish your first workout and come back to see your progress.</p>
        </div>
      )}

      <div className="progress-grid">
        {logged.length > 0 && (
          <section className="card span-2">
            <div className="card-head">
              <h2 className="card-title">Exercise progress</h2>
              <select className="input compact" value={exerciseId} onChange={(e) => setSelected(e.target.value)} aria-label="Exercise">
                {logged.map(([id, n]) => (
                  <option key={id} value={id}>
                    {exMap.get(id)?.name} ({n}×)
                  </option>
                ))}
              </select>
            </div>
            {exerciseId && <ExerciseStats key={exerciseId} exerciseId={exerciseId} />}
          </section>
        )}

        {s.workouts.length > 0 && (
          <section className="card">
            <div className="card-head">
              <h2 className="card-title">Workouts per week</h2>
            </div>
            <BarChart points={weekly} label="Workouts per week, last 8 weeks" />
          </section>
        )}

        {s.workouts.length > 0 && (
          <section className="card">
            <div className="card-head">
              <h2 className="card-title">Sets per muscle · this week</h2>
            </div>
            {muscleSets.length ? (
              <>
                <ul className="hbars">
                  {muscleSets.map(([m, n]) => (
                    <li key={m}>
                      <span>{m}</span>
                      <div className="hbar" role="img" aria-label={`${m}: ${n} sets`}>
                        <i style={{ width: `${(n / maxSets) * 100}%` }} />
                        <b className="hbar-goal" style={{ left: `${(SET_GOAL / maxSets) * 100}%` }} />
                      </div>
                      <strong>
                        {n}
                        {n >= SET_GOAL && <span className="goal-ok"> ✓</span>}
                      </strong>
                    </li>
                  ))}
                </ul>
                <p className="muted small">Dashed line = {SET_GOAL} sets a week, a good target for each muscle. ✓ = reached.</p>
              </>
            ) : (
              <p className="muted">No sets logged yet this week.</p>
            )}
          </section>
        )}

        <BodyWeightCard />
      </div>
    </div>
  );
}

function BodyWeightCard() {
  const { bodyWeights } = useAppState();
  const [kg, setKg] = useState('');
  const [date, setDate] = useState(todayISO());
  const [showAll, setShowAll] = useState(false);

  const add = () => {
    const n = Number(kg.replace(',', '.'));
    const max = unitLabel() === 'lb' ? 900 : 400;
    if (!Number.isFinite(n) || n <= 0 || n > max) {
      toast.error(`Enter your weight in ${unitLabel()}, e.g. ${unitLabel() === 'lb' ? 165 : 75}`);
      return;
    }
    actions.addBodyWeight(Math.round(n * 10) / 10, date);
    setKg('');
    toast.success(`Saved ${formatW(Math.round(n * 10) / 10)}`);
  };

  const points = [...bodyWeights]
    .reverse()
    .slice(-30)
    .map((b) => ({
      label: formatDate(b.date, { day: 'numeric', month: 'short' }),
      detail: formatDate(b.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
      value: b.kg,
    }));
  const change = bodyWeights.length > 1 ? bodyWeights[0].kg - bodyWeights[bodyWeights.length - 1].kg : 0;

  return (
    <section className="card">
      <div className="card-head">
        <h2 className="card-title">Body weight</h2>
        {bodyWeights.length > 0 && (
          <span className="muted small">
            Now <strong className="text">{formatW(bodyWeights[0].kg)}</strong>
            {change !== 0 && ` (${change > 0 ? '+' : ''}${formatW(change)})`}
          </span>
        )}
      </div>
      <div className="bw-form">
        <input
          className="input"
          inputMode="decimal"
          placeholder={`Weight in ${unitLabel()}`}
          value={kg}
          onChange={(e) => setKg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          aria-label="Body weight"
        />
        <input className="input" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
        <button className="btn primary" onClick={add}>
          Save
        </button>
      </div>
      {points.length > 1 && <LineChart points={points} fmt={formatW} label="Body weight over time" height={180} />}
      {bodyWeights.length > 0 && (
        <ul className="bw-list">
          {bodyWeights.slice(0, showAll ? undefined : 4).map((b) => (
            <li key={b.id}>
              <span>{formatDate(b.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <strong>{formatW(b.kg)}</strong>
              <button className="icon-btn sm" onClick={() => actions.deleteBodyWeight(b.id)} aria-label="Delete entry">
                <XIcon size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {bodyWeights.length > 4 && (
        <button className="btn ghost small" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Show less' : `Show all ${bodyWeights.length}`}
        </button>
      )}
    </section>
  );
}
