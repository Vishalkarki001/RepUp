'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Share2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { addDays } from '@/lib/food/core';
import { formatDuration, formatPace } from '@/lib/run/core';
import { shareCard } from '@/lib/shareCard';
import { exerciseMap, useAppState } from '@/lib/store';
import { cn, formatVolume, formatW } from '@/lib/utils';
import { localDate, mondayOf, reportWeekStart, weekLabel, weekReport, weekSummaryLine } from '@/lib/weekly';
import { cardForWeek } from '@/lib/weeklyCard';
import { EmptyState, SectionTitle, Stat, StatGrid } from './common';
import { Modal } from './Modal';

const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');

/** "+1 vs last week" / "same as last week" / "−2 vs last week". */
function vsLast(now: number, last: number, unit = ''): string {
  const d = Math.round((now - last) * 10) / 10;
  if (d === 0) return 'same as last week';
  return `${d > 0 ? '+' : '−'}${Math.abs(d)}${unit} vs last week`;
}

/**
 * "Your week": Monday–Sunday in numbers for gym, running, food and weight.
 * Opens from the Sunday 7 pm notification, the "Your week is ready" bar or the
 * account menu. Only the parts someone used are shown.
 */
export function WeeklyReportSheet({ onClose }: { onClose: () => void }) {
  const s = useAppState();
  const exMap = useMemo(() => exerciseMap(s), [s]);
  const [start, setStart] = useState(() => reportWeekStart(new Date()));
  const [sharing, setSharing] = useState(false);
  const latest = mondayOf(localDate(Date.now()));
  const r = useMemo(() => weekReport(s, start), [s, start]);
  const name = (id: string) => exMap.get(id)?.name ?? 'Exercise';

  const share = async () => {
    setSharing(true);
    try {
      await shareCard(cardForWeek(r, name), 'repup-week.png');
    } catch {
      toast.error('Couldn’t make the picture. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal
      title="Your week"
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <Button size="lg" variant="outline" className="h-11 text-base" disabled={r.empty || sharing} onClick={() => void share()}>
            {sharing ? <Loader2 className="animate-spin" /> : <Share2 />} Share
          </Button>
          <Button size="lg" className="h-11 flex-1 text-base" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      {/* Week picker */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="icon" aria-label="Previous week" onClick={() => setStart(addDays(start, -7))}>
          <ChevronLeft />
        </Button>
        <div className="text-center">
          <p className="text-base font-semibold">{weekLabel(start)}</p>
          {start === latest && <p className="text-xs text-muted-foreground">This week so far</p>}
        </div>
        <Button variant="ghost" size="icon" aria-label="Next week" disabled={start >= latest} onClick={() => setStart(addDays(start, 7))}>
          <ChevronRight />
        </Button>
      </div>

      {r.empty ? (
        <EmptyState emoji="📭" title="Nothing logged this week">
          A workout, a run or one meal is enough to start. Your next report comes Sunday evening.
        </EmptyState>
      ) : (
        <>
          <p className="rounded-lg bg-accent/60 px-3 py-2.5 text-center text-sm font-medium text-accent-foreground">{weekSummaryLine(r)}</p>

          {r.gym && (
            <section className="flex flex-col gap-2">
              <SectionTitle>Gym</SectionTitle>
              <StatGrid>
                <Stat value={r.gym.days} label={`${r.gym.days === 1 ? 'day' : 'days'} · ${vsLast(r.gym.days, r.gym.lastWeekDays)}`} />
                <Stat value={r.gym.sets} label="sets" />
                <Stat value={formatVolume(r.gym.volume)} label="lifted" />
              </StatGrid>
              {r.gym.bests.length > 0 && (
                <div className="rounded-lg border border-warning/30 bg-warning-soft p-3.5">
                  <h4 className="text-sm font-semibold text-warning">🏆 New personal {r.gym.bests.length === 1 ? 'best' : 'bests'}</h4>
                  <ul className="mt-1.5 flex flex-col">
                    {r.gym.bests.slice(0, 5).map((b) => (
                      <li key={b.exerciseId} className="flex items-center justify-between gap-3 py-1 text-sm">
                        <span className="min-w-0 truncate">{name(b.exerciseId)}</span>
                        <span className="shrink-0 font-semibold tabular">{b.weight > 0 ? `${formatW(b.weight)} × ${b.reps}` : `${b.reps} reps`}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {r.run && (
            <section className="flex flex-col gap-2">
              <SectionTitle>Running</SectionTitle>
              <StatGrid>
                <Stat value={r.run.km.toFixed(1)} label={`km · ${vsLast(r.run.km, r.run.lastWeekKm, ' km')}`} />
                <Stat value={r.run.runs} label={r.run.runs === 1 ? 'run' : 'runs'} />
                <Stat value={formatDuration(r.run.seconds)} label="time" />
              </StatGrid>
              <p className="text-sm text-muted-foreground">
                Longest {r.run.longestKm.toFixed(1)} km{r.run.bestPace ? ` · best pace ${formatPace(r.run.bestPace)} /km` : ''}
              </p>
            </section>
          )}

          {r.food && (
            <section className="flex flex-col gap-2">
              <SectionTitle>Food</SectionTitle>
              <StatGrid>
                <Stat value={`${r.food.daysLogged}/7`} label="days logged" />
                <Stat value={fmt(r.food.avgKcal)} label={r.food.targetKcal ? `kcal a day (target ${fmt(r.food.targetKcal)})` : 'kcal a day'} />
                <Stat
                  value={r.food.targetProtein ? `${r.food.proteinDays}/${r.food.daysLogged}` : `${fmt(r.food.avgProtein)} g`}
                  label={r.food.targetProtein ? 'days protein hit' : 'protein a day'}
                />
              </StatGrid>
            </section>
          )}

          {r.weight && (
            <section className="flex flex-col gap-2">
              <SectionTitle>Weight</SectionTitle>
              <div className="flex items-center justify-between rounded-lg border bg-card px-3.5 py-3">
                <span className="text-lg font-semibold tabular">{r.weight.to} kg</span>
                {r.weight.from !== null && (
                  <span className={cn('text-sm tabular', r.weight.to === r.weight.from ? 'text-muted-foreground' : 'font-medium')}>
                    {r.weight.to === r.weight.from ? 'Same as before' : `${r.weight.to > r.weight.from ? '+' : '−'}${Math.abs(Math.round((r.weight.to - r.weight.from) * 10) / 10)} kg this week`}
                  </span>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </Modal>
  );
}

const SEEN_KEY = 'repup:week-seen';

/**
 * "Your week is ready" above the tab bar, from Sunday 6 pm to Tuesday night,
 * until opened or closed. Only when there's something in the report.
 */
export function WeekReadyBar({ onOpen }: { onOpen: () => void }) {
  const s = useAppState();
  const [hidden, setHidden] = useState(false);
  const now = new Date();
  const start = reportWeekStart(now);
  const fresh = now.getDay() === 0 ? now.getHours() >= 18 : now.getDay() <= 2; // Sun evening, Mon, Tue
  let seen = false;
  try {
    seen = localStorage.getItem(SEEN_KEY) === start;
  } catch {
    /* private mode */
  }
  const r = useMemo(() => weekReport(s, start), [s, start]);
  if (hidden || seen || !fresh || r.empty) return null;
  const markSeen = () => {
    try {
      localStorage.setItem(SEEN_KEY, start);
    } catch {
      /* private mode */
    }
    setHidden(true);
  };
  return (
    <div className="pointer-events-auto flex w-full items-center gap-1 rounded-xl border bg-popover py-1.5 pr-1.5 pl-4 shadow-lg">
      <button
        className="flex min-w-0 flex-1 items-center gap-3 py-1 text-left"
        onClick={() => {
          markSeen();
          onOpen();
        }}
      >
        <span className="text-xl leading-none" aria-hidden>
          📊
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">Your week is ready</span>
          <span className="block truncate text-xs text-muted-foreground">{weekSummaryLine(r)}</span>
        </span>
        <Button size="sm" asChild>
          <span>See it</span>
        </Button>
      </button>
      <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground" aria-label="Hide" onClick={markSeen}>
        <X />
      </Button>
    </div>
  );
}
