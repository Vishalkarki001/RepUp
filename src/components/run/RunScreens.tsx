'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPinOff, PenLine, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ItemGroup } from '@/components/ui/item';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatDuration, formatKm, formatPace, paceSecPerKm } from '@/lib/run/core';
import { clearRunProblem, startRun, useRun } from '@/lib/run/tracker';
import { actions, useAppState } from '@/lib/store';
import { WEEKDAYS, WEEKDAYS_LONG, type RunEntry, type RunKind } from '@/lib/types';
import { cn, formatDate, startOfWeek, todayISO, useNow } from '@/lib/utils';
import { BarChart, LineChart } from '../Charts';
import { EmptyState, SectionTitle, Stat, StatGrid } from '../common';
import { NumberField } from '../NumberField';
import { ScreenHeader } from '../ScreenHeader';
import { ManualRun } from './ManualRun';
import { RunDetail } from './RunDetail';
import { RunRow } from './RunParts';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon … Sun
const KIND_KEY = 'repup:run-kind';

const sum = (runs: RunEntry[], f: (r: RunEntry) => number) => runs.reduce((a, r) => a + f(r), 0);

/* ------------------------------------------------------------------ */
/* Run tab: start a run, add one by hand, this week                     */
/* ------------------------------------------------------------------ */

export function RunHome() {
  const { runs, bodyWeights, settings } = useAppState();
  const { problem } = useRun();
  const now = new Date(useNow(60_000));
  const [kind, setKind] = useState<RunKind>(() => {
    try {
      return localStorage.getItem(KIND_KEY) === 'walk' ? 'walk' : 'run';
    } catch {
      return 'run';
    }
  });
  const [weight, setWeight] = useState<number | null>(null);
  const [manual, setManual] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const todayDay = now.getDay();
  const [selected, setSelected] = useState(todayDay);
  useEffect(() => setSelected(todayDay), [todayDay]); // new day → jump to it

  const weekStart = startOfWeek(now.getTime());
  const thisWeek = runs.filter((r) => r.startedAt >= weekStart);
  const days = DAY_ORDER.map((d, i) => {
    const start = new Date(weekStart);
    start.setDate(start.getDate() + i);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1).getTime();
    const list = runs.filter((r) => r.startedAt >= start.getTime() && r.startedAt < end);
    return { d, date: start.getDate(), list, km: sum(list, (r) => r.distanceM), isToday: d === todayDay };
  });
  const day = days.find((x) => x.d === selected) ?? days[0];
  const open = runs.find((r) => r.id === openId);

  const start = () => {
    try {
      localStorage.setItem(KIND_KEY, kind);
    } catch {
      /* ignore */
    }
    if (!bodyWeights.length && weight && weight > 20 && weight < 400) actions.addBodyWeight(weight, todayISO());
    void startRun(kind);
  };

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader eyebrow={formatDate(now.getTime(), { weekday: 'long', day: 'numeric', month: 'long' })} title="Run" />

      {/* Tap a day to see its runs (same as the workout week) */}
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={1.5}
        value={String(selected)}
        onValueChange={(v) => v && setSelected(Number(v))}
        aria-label="Pick a day"
        className="grid w-full grid-cols-7"
      >
        {days.map(({ d, date, km, isToday }) => (
          <ToggleGroupItem
            key={d}
            value={String(d)}
            aria-label={`${WEEKDAYS_LONG[d]} ${date}${km ? `, ${formatKm(km)} km` : ''}`}
            className={cn(
              'h-auto min-w-0 flex-col gap-0.5 rounded-lg bg-card px-0 py-2 active:scale-95',
              isToday && 'border-primary/50',
              'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
            )}
          >
            <span className={cn('text-[11px] font-medium text-muted-foreground', selected === d && 'text-primary-foreground/80', isToday && selected !== d && 'text-brand')}>
              {WEEKDAYS[d]}
            </span>
            <span className="text-base font-semibold tabular">{date}</span>
            <span className={cn('size-1.5 rounded-full', km ? (selected === d ? 'bg-primary-foreground' : 'bg-success') : 'bg-transparent')} />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {day.list.length > 0 ? (
        <section className="flex flex-col gap-2">
          <SectionTitle>
            {day.isToday ? 'Today' : WEEKDAYS_LONG[day.d]} · {formatKm(day.km)} km
          </SectionTitle>
          <Card className="gap-0 overflow-hidden py-0">
            <ItemGroup className="gap-0 divide-y">
              {day.list.map((r) => (
                <RunRow key={r.id} run={r} onOpen={() => setOpenId(r.id)} />
              ))}
            </ItemGroup>
          </Card>
        </section>
      ) : (
        !day.isToday && <p className="-mt-2 text-center text-sm text-muted-foreground">No run on {WEEKDAYS_LONG[day.d]}.</p>
      )}

      {problem && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <MapPinOff className="mt-0.5 size-4 shrink-0" />
          <p className="flex-1">
            {problem === 'denied'
              ? 'Location is blocked for RepUp. Allow location in your browser or phone settings, then try again. Or add the run by hand.'
              : 'This browser can’t share your location. Try Chrome or Safari, or add the run by hand.'}
          </p>
          <button type="button" onClick={clearRunProblem} aria-label="Dismiss" className="rounded p-0.5 hover:bg-destructive/10">
            <X className="size-4" />
          </button>
        </div>
      )}

      <Card className="gap-4 px-4 py-5">
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={0}
          className="w-full"
          value={kind}
          onValueChange={(v) => v && setKind(v as RunKind)}
          aria-label="Run or walk"
        >
          <ToggleGroupItem value="run" className="h-10 flex-1 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
            🏃 Run
          </ToggleGroupItem>
          <ToggleGroupItem value="walk" className="h-10 flex-1 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
            🚶 Walk
          </ToggleGroupItem>
        </ToggleGroup>

        {!bodyWeights.length && (
          <NumberField
            label={`Your body weight (${settings.unit}), for calories. Optional`}
            value={weight}
            onValue={setWeight}
            decimal
            placeholder={settings.unit === 'lb' ? '160' : '70'}
          />
        )}

        <Button size="lg" className="h-14 text-base" onClick={start}>
          <Play className="fill-current" /> Start {kind === 'walk' ? 'walk' : 'run'}
        </Button>
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          Keep the screen on and RepUp open while you {kind === 'walk' ? 'walk' : 'run'}. Phone in your hand or an armband. Location
          is only used for this.
        </p>
      </Card>

      <Button variant="outline" className="w-full border-dashed text-muted-foreground" onClick={() => setManual(true)}>
        <PenLine /> Add a run by hand
      </Button>

      <section className="flex flex-col gap-2">
        <SectionTitle>This week</SectionTitle>
        <StatGrid>
          <Stat value={`${formatKm(sum(thisWeek, (r) => r.distanceM))}`} label="km" />
          <Stat value={thisWeek.length} label={thisWeek.length === 1 ? 'run' : 'runs'} />
          <Stat value={formatDuration(sum(thisWeek, (r) => r.durationS))} label="time" />
        </StatGrid>
      </section>

      {manual && <ManualRun initialKind={kind} onClose={() => setManual(false)} />}
      {open && <RunDetail key={open.id} run={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* History: every run, by month                                         */
/* ------------------------------------------------------------------ */

export function RunHistory() {
  const { runs } = useAppState();
  const [openId, setOpenId] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const open = runs.find((r) => r.id === openId);

  const months = useMemo(() => {
    const m = new Map<string, RunEntry[]>();
    for (const r of runs) {
      const key = new Date(r.startedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      m.set(key, [...(m.get(key) ?? []), r]);
    }
    return [...m.entries()];
  }, [runs]);

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader eyebrow={`${runs.length} ${runs.length === 1 ? 'run' : 'runs'} saved`} title="History" />
      {runs.length === 0 ? (
        <EmptyState
          emoji="🏃"
          title="No runs yet"
          action={
            <Button variant="outline" className="w-full" onClick={() => setManual(true)}>
              <PenLine /> Add a run by hand
            </Button>
          }
        >
          Start one from the Run tab, or add one you already did.
        </EmptyState>
      ) : (
        months.map(([month, list]) => (
          <section key={month} className="flex flex-col gap-2">
            <SectionTitle>
              {month} · {formatKm(sum(list, (r) => r.distanceM))} km
            </SectionTitle>
            <Card className="gap-0 overflow-hidden py-0">
              <ItemGroup className="gap-0 divide-y">
                {list.map((r) => (
                  <RunRow key={r.id} run={r} onOpen={() => setOpenId(r.id)} />
                ))}
              </ItemGroup>
            </Card>
          </section>
        ))
      )}
      {manual && <ManualRun onClose={() => setManual(false)} />}
      {open && <RunDetail key={open.id} run={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Progress: totals, weekly km, pace over time                          */
/* ------------------------------------------------------------------ */

export function RunProgress() {
  const { runs } = useAppState();
  const now = useNow(60_000);

  const stats = useMemo(() => {
    const longest = runs.reduce((a, r) => Math.max(a, r.distanceM), 0);
    const paced = runs.filter((r) => r.kind === 'run' && r.distanceM >= 1000);
    const best = paced.length ? Math.min(...paced.map((r) => r.durationS / (r.distanceM / 1000))) : null;
    const monthStart = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime();
    const month = runs.filter((r) => r.startedAt >= monthStart);
    const thisWeek = startOfWeek(now);
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const start = new Date(thisWeek);
      start.setDate(start.getDate() - 7 * (7 - i));
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const km = sum(runs.filter((r) => r.startedAt >= start.getTime() && r.startedAt < end.getTime()), (r) => r.distanceM) / 1000;
      // Short "28/9" labels so 8 weeks fit on a phone.
      const label = `${start.getDate()}/${start.getMonth() + 1}`;
      const long = start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return { label, value: Math.round(km * 10) / 10, detail: `Week of ${long}` };
    });
    const paceLine = [...paced]
      .reverse()
      .slice(-12)
      .map((r) => ({
        label: formatDate(r.startedAt, { day: 'numeric', month: 'short' }),
        value: Math.round(r.durationS / (r.distanceM / 1000)),
        detail: `${formatKm(r.distanceM)} km`,
      }));
    return { longest, best, month, weeks, paceLine };
  }, [runs, now]);

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader eyebrow="Running" title="Progress" />
      {runs.length === 0 ? (
        <EmptyState emoji="📈" title="Nothing to show yet">
          Your distance, pace and weekly kilometres appear here after your first run.
        </EmptyState>
      ) : (
        <>
          <StatGrid cols={4}>
            <Stat value={formatKm(sum(runs, (r) => r.distanceM))} label="km in total" />
            <Stat value={runs.length} label="runs & walks" />
            <Stat value={`${formatKm(stats.longest)} km`} label="longest" />
            <Stat value={formatPace(stats.best)} label="best pace /km (runs ≥ 1 km)" />
          </StatGrid>

          <Card className="gap-3 px-4 py-4">
            <div>
              <p className="font-semibold">Kilometres per week</p>
              <p className="text-xs text-muted-foreground">
                This month: {formatKm(sum(stats.month, (r) => r.distanceM))} km in {stats.month.length}{' '}
                {stats.month.length === 1 ? 'session' : 'sessions'}
              </p>
            </div>
            <BarChart points={stats.weeks} fmt={(v) => `${v}`} label="Kilometres per week, last 8 weeks" />
          </Card>

          {stats.paceLine.length >= 2 && (
            <Card className="gap-3 px-4 py-4">
              <div>
                <p className="font-semibold">Pace</p>
                <p className="text-xs text-muted-foreground">Minutes per km on each run. Lower is faster.</p>
              </div>
              <LineChart points={stats.paceLine} fmt={(v) => formatPace(v)} label="Pace per run" />
            </Card>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Average pace: {formatPace(paceSecPerKm(sum(runs, (r) => r.distanceM), sum(runs, (r) => r.durationS)))} /km
          </p>
        </>
      )}
    </div>
  );
}
