'use client';

import { useId, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Item, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { actions, exerciseHistory, useAppState } from '@/lib/store';
import { cn, formatDate, formatKg, formatVolume, formatW } from '@/lib/utils';
import { LineChart } from '../Charts';
import { SectionTitle, Stat, StatGrid } from '../common';
import { confirmDialog } from '../Confirm';
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
    return <p className="py-6 text-center text-sm text-muted-foreground">No sessions logged yet for this exercise.</p>;
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
    <div className="flex flex-col gap-4">
      <StatGrid>
        <Stat value={bodyweight ? maxReps : formatW(maxWeight)} label={bodyweight ? 'best reps' : 'heaviest ever'} />
        <Stat
          value={
            <span
              className={cn(
                'inline-flex items-center gap-1',
                change > 0 && 'text-success',
                change < 0 && 'text-destructive',
              )}
            >
              {change > 0 ? <ArrowUp className="size-4 shrink-0" /> : change < 0 ? <ArrowDown className="size-4 shrink-0" /> : null}
              {change > 0 ? '+' : ''}
              {bodyweight ? change : formatW(change)}
            </span>
          }
          label={`${change > 0 ? 'stronger' : 'change'} since first time`}
        />
        <Stat value={sessions.length} label="sessions" />
      </StatGrid>

      <div className="flex flex-col gap-2">
        {metrics.length > 1 && (
          <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
            <TabsList className="w-full" aria-label="What to show">
              {metrics.map((m) => (
                <TabsTrigger key={m} value={m} className="text-xs sm:text-sm">
                  {METRIC_LABEL[m]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        <p className="text-xs text-muted-foreground">{METRIC_HELP[metric]} Tap the chart to see each session.</p>
      </div>
      <LineChart points={points} fmt={fmt} label={`${METRIC_LABEL[metric]} per session`} />

      <div className="flex flex-col gap-2">
        <SectionTitle>Sessions</SectionTitle>
        <ItemGroup className="gap-2">
          {list.slice(0, showAll ? undefined : 4).map((x, i) => (
            <Item key={x.workoutId + i} role="listitem" variant="outline" size="sm" className="bg-card">
              <ItemContent className="min-w-0 gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <ItemTitle className="truncate">
                    {formatDate(x.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </ItemTitle>
                  {!bodyweight && <span className="shrink-0 text-xs text-muted-foreground tabular">{formatVolume(x.volume)}</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {x.sets.map((set) => (
                    <Badge key={set.id} variant="secondary" className="font-normal tabular">
                      {formatKg(set.weight ?? 0)}×{set.reps}
                    </Badge>
                  ))}
                </div>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
        {list.length > 4 && (
          <Button variant="ghost" size="sm" className="self-center text-muted-foreground" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Show less' : `Show all ${list.length} sessions`}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ExerciseHistoryModal({ exerciseId, onClose }: { exerciseId: string; onClose: () => void }) {
  const s = useAppState();
  const ex = s.exercises.find((e) => e.id === exerciseId);
  const [note, setNote] = useState(ex?.note ?? '');
  const noteId = useId();
  if (!ex) return null;

  return (
    <Modal
      title={ex.name}
      description={
        <>
          {ex.muscle} · {ex.equipment}
          {ex.custom ? ' · yours' : ''}
        </>
      }
      onClose={onClose}
    >
      <Field>
        <FieldLabel htmlFor={noteId}>Sticky note</FieldLabel>
        <Input
          id={noteId}
          placeholder="e.g. seat height 4, grip width…"
          value={note}
          onChange={(e) => {
            // Saved on every keystroke so closing the sheet never loses it.
            setNote(e.target.value);
            actions.updateExercise(ex.id, { note: e.target.value.trim() || undefined });
          }}
        />
      </Field>
      <ExerciseStats exerciseId={exerciseId} />
      {ex.custom && (
        <Button
          variant="ghost"
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
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
          <Trash2 /> Delete exercise
        </Button>
      )}
    </Modal>
  );
}
