'use client';

import { useEffect, useMemo, useState } from 'react';
import { Pencil, Play, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { actions, exerciseMap, planForDay, useAppState } from '@/lib/store';
import { WEEKDAYS, WEEKDAYS_LONG, type Muscle } from '@/lib/types';
import { cn, formatDate, formatVolume, formatW, startOfWeek, useNow, workoutVolume } from '@/lib/utils';
import { EmptyState, NumBadge, SectionTitle, Stat, StatGrid } from '../common';
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
    <div className="flex flex-col gap-5">
      <ScreenHeader eyebrow={formatDate(now.getTime(), { weekday: 'long', day: 'numeric', month: 'long' })} title="Workout" />

      {/* Week strip: tap any day to see / edit its plan */}
      <div>
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={1.5}
          value={String(selected)}
          onValueChange={(v) => v && setSelected(Number(v))}
          aria-label="Pick a day"
          className="grid w-full grid-cols-7"
        >
          {week.map(({ d, date, trained, planned }) => {
            const on = selected === d;
            return (
              <ToggleGroupItem
                key={d}
                value={String(d)}
                aria-label={`${WEEKDAYS_LONG[d]} ${date}${trained ? ', done' : planned ? ', workout planned' : ''}`}
                data-day={WEEKDAYS[d]}
                className={cn(
                  'h-auto min-w-0 flex-col gap-0.5 rounded-lg bg-card px-0 py-2 active:scale-95',
                  d === today && 'border-primary/50',
                  'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
                )}
              >
                <span className={cn('text-[11px] font-medium text-muted-foreground', on && 'text-primary-foreground/80', d === today && !on && 'text-brand')}>
                  {WEEKDAYS[d]}
                </span>
                <span className="text-base font-semibold tabular">{date}</span>
                <span
                  aria-hidden
                  className={cn(
                    'size-1.5 rounded-full',
                    trained ? 'bg-success' : planned ? (on ? 'bg-primary-foreground' : 'bg-primary') : 'bg-transparent',
                  )}
                />
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" /> planned
          <span className="ml-2 size-1.5 rounded-full bg-success" /> done
        </p>
      </div>

      {plan ? (
        <Card data-plan-card className="gap-0 py-0">
          <CardHeader className="flex flex-row items-start gap-3 border-b px-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-brand">{dayLabel}</p>
              <h2 data-plan-title className="mt-0.5 truncate text-xl font-semibold tracking-tight">
                {plan.name || 'Workout'}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {plan.items.length} {plan.items.length === 1 ? 'exercise' : 'exercises'} · {totalSets} {totalSets === 1 ? 'set' : 'sets'}
              </p>
              {muscles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {muscles.map((m) => (
                    <Badge key={m} variant="secondary" className="font-normal">
                      {m}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil /> Edit
            </Button>
          </CardHeader>

          <CardContent className="px-0">
            <ol className="divide-y" data-plan-list>
              {plan.items.map((i, n) => (
                <li key={i.exerciseId + n} className="flex items-center gap-3 px-4 py-2.5">
                  <NumBadge>{n + 1}</NumBadge>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{exMap.get(i.exerciseId)?.name ?? 'Deleted exercise'}</span>
                  <span className="shrink-0 text-sm font-semibold tabular">
                    {i.sets} × {i.reps}
                    {i.weight ? <span className="font-normal text-muted-foreground"> · {formatW(i.weight)}</span> : null}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>

          <CardFooter className="flex-col gap-2 border-t px-4 py-4">
            <Button size="lg" className="h-11 w-full text-base" onClick={() => actions.startPlan(selected)}>
              <Play className="fill-current" /> Start workout
            </Button>
            <p className="text-xs text-muted-foreground">
              {lastDone ? `Last done ${formatDate(lastDone)}` : 'Tap Start, then tick ✓ after each set.'}
            </p>
          </CardFooter>
        </Card>
      ) : (
        <EmptyState
          emoji="😴"
          title={isToday ? 'Rest day today' : `${WEEKDAYS_LONG[selected]} is a rest day`}
          action={
            <Button className="w-full" onClick={() => setEditing(true)}>
              <Plus /> Plan {WEEKDAYS_LONG[selected]}&apos;s workout
            </Button>
          }
        >
          No workout planned. Add exercises to make it a gym day.
        </EmptyState>
      )}

      <Button variant="outline" className="w-full border-dashed text-muted-foreground" onClick={() => actions.startEmptyWorkout()}>
        <Plus /> Start a blank workout
      </Button>

      <section className="flex flex-col gap-2">
        <SectionTitle>This week</SectionTitle>
        <StatGrid>
          <Stat value={thisWeek.length} label="workouts" />
          <Stat value={formatVolume(weekVolume)} label="lifted" />
          <Stat value={streak} label="week streak 🔥" />
        </StatGrid>
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
