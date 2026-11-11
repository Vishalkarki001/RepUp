import { useEffect, useMemo, useState } from 'react';
import { actions, exerciseMap, planForDay, useAppState } from '@/lib/store';
import { WEEKDAYS, WEEKDAYS_LONG, type Muscle } from '@/lib/types';
import { formatDate, formatVolume, formatW, startOfWeek, useNow, workoutVolume } from '@/lib/utils';
import { EditIcon, PlayIcon, PlusIcon } from '../Icons';
import { ScreenHeader } from '../ScreenHeader';
import { DayPlanEditor } from './DayPlanEditor';

const DAY = 86_400_000;
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon … Sun

export function TodayScreen() {
  const s = useAppState();
  // Re-render every minute so the date, "today" and the week roll over at
  // midnight even if the app stays open (e.g. a PWA left in the background).
  const now = new Date(useNow(60_000));
  const today = now.getDay();
  const [selected, setSelected] = useState(today);
  useEffect(() => setSelected(today), [today]); // new day → jump to it
  const [editing, setEditing] = useState(false);
  const exMap = useMemo(() => exerciseMap(s), [s]);

  const weekStart = startOfWeek(now.getTime());
  const thisWeek = s.workouts.filter((w) => w.startedAt >= weekStart);
  const weekVolume = thisWeek.reduce((a, w) => a + workoutVolume(w), 0);
  const streak = weekStreak(s.workouts.map((w) => w.startedAt));

  const week = DAY_ORDER.map((d, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const start = date.getTime();
    // Next local midnight (not +24 h, which is wrong on daylight-saving days).
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime();
    return {
      d,
      date: date.getDate(),
      trained: s.workouts.some((w) => w.startedAt >= start && w.startedAt < end),
      planned: !!planForDay(s, d),
    };
  });

  const plan = planForDay(s, selected);
  const isToday = selected === today;
  const dayLabel = isToday ? 'Today' : WEEKDAYS_LONG[selected];
  const muscles = plan
    ? [...new Set(plan.items.map((i) => exMap.get(i.exerciseId)?.muscle).filter(Boolean) as Muscle[])]
    : [];
  const totalSets = plan?.items.reduce((a, i) => a + i.sets, 0) ?? 0;
  const lastDone = s.workouts.find((w) => w.day === selected)?.startedAt;

  return (
    <div className="screen">
      <ScreenHeader eyebrow={formatDate(now.getTime(), { weekday: 'long', day: 'numeric', month: 'long' })} title="Workout" />

      <div className="week-strip" role="tablist" aria-label="Pick a day">
        {week.map(({ d, date, trained, planned }) => (
          <button
            key={d}
            role="tab"
            aria-selected={selected === d}
            className={`wday ${selected === d ? 'on' : ''} ${d === today ? 'today' : ''}`}
            onClick={() => setSelected(d)}
          >
            <span className="wd-name">{WEEKDAYS[d]}</span>
            <span className="wd-date">{date}</span>
            <span className={`wd-mark ${trained ? 'done' : planned ? 'planned' : ''}`} aria-hidden />
          </button>
        ))}
      </div>
      <p className="legend muted small">
        <span className="wd-mark planned" /> workout planned <span className="wd-mark done" /> done
      </p>

      {plan ? (
        <section className="card plan-card">
          <div className="plan-head">
            <div className="grow">
              <p className="eyebrow">{dayLabel}</p>
              <h2 className="plan-title">{plan.name || 'Workout'}</h2>
              <p className="muted small">
                {plan.items.length} exercises · {totalSets} sets
                {muscles.length ? ` · ${muscles.join(', ')}` : ''}
              </p>
            </div>
            <button className="btn small soft" onClick={() => setEditing(true)}>
              <EditIcon size={16} /> Edit
            </button>
          </div>

          <ol className="plan-list">
            {plan.items.map((i, n) => (
              <li key={i.exerciseId + n}>
                <span className="num-badge">{n + 1}</span>
                <span className="grow">{exMap.get(i.exerciseId)?.name ?? 'Deleted exercise'}</span>
                <span className="sets-reps">
                  {i.sets} × {i.reps}
                  {i.weight ? <small> · {formatW(i.weight)}</small> : null}
                </span>
              </li>
            ))}
          </ol>

          <button className="btn primary block lg" onClick={() => actions.startPlan(selected)}>
            <PlayIcon /> Start workout
          </button>
          <p className="muted small center">
            {lastDone ? `Last done ${formatDate(lastDone)}` : 'Tap Start, then tick ✓ after each set.'}
          </p>
        </section>
      ) : (
        <section className="card empty-plan">
          <div className="empty-emoji" aria-hidden>
            😴
          </div>
          <h2>{isToday ? 'Rest day today' : `${WEEKDAYS_LONG[selected]} is a rest day`}</h2>
          <p className="muted">No workout planned. Add exercises to make it a gym day.</p>
          <button className="btn primary block" onClick={() => setEditing(true)}>
            <PlusIcon /> Plan {WEEKDAYS_LONG[selected]}&apos;s workout
          </button>
        </section>
      )}

      <button className="btn ghost block" onClick={() => actions.startEmptyWorkout()}>
        <PlusIcon size={16} /> Start a blank workout
      </button>

      <section>
        <h2 className="section-title">This week</h2>
        <div className="stats">
          <div className="stat">
            <strong>{thisWeek.length}</strong>
            <span>workouts</span>
          </div>
          <div className="stat">
            <strong>{formatVolume(weekVolume)}</strong>
            <span>lifted</span>
          </div>
          <div className="stat">
            <strong>{streak}</strong>
            <span>week streak 🔥</span>
          </div>
        </div>
      </section>

      {editing && <DayPlanEditor day={selected} onClose={() => setEditing(false)} />}
    </div>
  );
}

/** Consecutive weeks (ending this or last week) with at least one workout. */
function weekStreak(times: number[]): number {
  const weeks = new Set(times.map(startOfWeek));
  const WEEK = 7 * DAY;
  let cursor = startOfWeek(Date.now());
  if (!weeks.has(cursor)) cursor = startOfWeek(cursor - WEEK / 2);
  let n = 0;
  while (weeks.has(cursor)) {
    n++;
    cursor = startOfWeek(cursor - WEEK / 2);
  }
  return n;
}
