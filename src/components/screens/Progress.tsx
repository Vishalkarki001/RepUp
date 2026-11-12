'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Item, ItemActions, ItemContent, ItemGroup } from '@/components/ui/item';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { actions, exerciseMap, useAppState } from '@/lib/store';
import { MUSCLES, type Muscle } from '@/lib/types';
import { formatDate, formatKg, formatVolume, formatW, startOfWeek, todayISO, unitLabel, workoutVolume } from '@/lib/utils';
import { BarChart, LineChart } from '../Charts';
import { EmptyState, Stat, StatGrid } from '../common';
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
    <div className="flex flex-col gap-5">
      <ScreenHeader eyebrow="See how you’re improving" title="Progress" />

      <StatGrid cols={4}>
        <Stat value={s.workouts.length} label="workouts in total" />
        <Stat value={thisMonth} label="this month" />
        <Stat value={formatVolume(totalVolume)} label="lifted in total" />
        <Stat value={formatKg(avgPerWeek)} label="workouts / week (avg)" />
      </StatGrid>

      {!s.workouts.length && (
        <EmptyState emoji="📈" title="Your charts will appear here">
          Finish your first workout and come back to see your progress.
        </EmptyState>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {logged.length > 0 && (
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle>Exercise progress</CardTitle>
              <Select value={exerciseId} onValueChange={setSelected}>
                <SelectTrigger size="sm" className="max-w-full min-w-0 sm:max-w-72" aria-label="Exercise">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {logged.map(([id, n]) => (
                    <SelectItem key={id} value={id}>
                      {exMap.get(id)?.name} ({n}×)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>{exerciseId && <ExerciseStats key={exerciseId} exerciseId={exerciseId} />}</CardContent>
          </Card>
        )}

        {s.workouts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Workouts per week</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart points={weekly} label="Workouts per week, last 8 weeks" />
            </CardContent>
          </Card>
        )}

        {s.workouts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sets per muscle · this week</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {muscleSets.length ? (
                <>
                  <ul className="flex flex-col gap-3">
                    {muscleSets.map(([m, n]) => (
                      <li key={m} className="grid grid-cols-[5.5rem_1fr_2.75rem] items-center gap-3 text-sm">
                        <span className="truncate text-muted-foreground">{m}</span>
                        <div className="relative">
                          <Progress value={(n / maxSets) * 100} className="h-2.5" aria-label={`${m}: ${n} sets this week`} />
                          {/* goal marker */}
                          <div
                            aria-hidden
                            className="pointer-events-none absolute -inset-y-1 border-l-2 border-dashed border-muted-foreground"
                            style={{ left: `${(SET_GOAL / maxSets) * 100}%` }}
                          />
                        </div>
                        <span className="text-right font-semibold tabular">
                          {n}
                          {n >= SET_GOAL && <span className="text-success"> ✓</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    Dashed line = {SET_GOAL} sets a week, a good target for each muscle. ✓ = reached.
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No sets logged yet this week.</p>
              )}
            </CardContent>
          </Card>
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
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-baseline justify-between gap-2">
        <CardTitle>Body weight</CardTitle>
        {bodyWeights.length > 0 && (
          <span className="text-xs text-muted-foreground">
            Now <strong className="font-semibold text-foreground tabular">{formatW(bodyWeights[0].kg)}</strong>
            {change !== 0 && ` (${change > 0 ? '+' : ''}${formatW(change)})`}
          </span>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_auto_auto]">
          <Input
            className="col-span-2 h-9 sm:col-span-1"
            inputMode="decimal"
            placeholder={`Weight in ${unitLabel()}`}
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            aria-label="Body weight"
          />
          <Input
            className="h-9 min-w-0"
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Date"
          />
          <Button className="h-9" onClick={add}>
            Save
          </Button>
        </div>
        {points.length > 1 && <LineChart points={points} fmt={formatW} label="Body weight over time" height={180} />}
        {bodyWeights.length > 0 && (
          <ItemGroup className="gap-0 divide-y rounded-lg border">
            {bodyWeights.slice(0, showAll ? undefined : 4).map((b) => (
              <Item key={b.id} role="listitem" size="xs" className="flex-nowrap rounded-none px-3">
                <ItemContent className="min-w-0">
                  <span className="truncate text-sm text-muted-foreground">
                    {formatDate(b.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </ItemContent>
                <ItemActions className="gap-1">
                  <span className="text-sm font-semibold tabular">{formatW(b.kg)}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => actions.deleteBodyWeight(b.id)}
                    aria-label="Delete entry"
                  >
                    <X />
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}
        {bodyWeights.length > 4 && (
          <Button variant="ghost" size="sm" className="self-center text-muted-foreground" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Show less' : `Show all ${bodyWeights.length}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
