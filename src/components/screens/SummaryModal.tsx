import { useMemo, useState } from 'react';
import { Check, CloudAlert, CloudCheck, CloudOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item';
import { useAccount } from '@/lib/account';
import { actions, exerciseMap, useAppState } from '@/lib/store';
import { useSyncStatus } from '@/lib/sync';
import { WEEKDAYS_LONG, type DayPlan, type WorkoutSummary } from '@/lib/types';
import { cn, formatDuration, formatVolume, formatW, workoutSetCount, workoutVolume } from '@/lib/utils';
import { Stat, StatGrid } from '../common';
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
        <Button size="lg" className="h-11 w-full text-base" onClick={onClose}>
          Done
        </Button>
      }
    >
      <h3 className="truncate text-center text-lg font-semibold tracking-tight">{workout.name}</h3>
      <StatGrid>
        <Stat value={formatDuration((workout.finishedAt ?? Date.now()) - workout.startedAt)} label="duration" />
        <Stat value={workoutSetCount(workout)} label={workoutSetCount(workout) === 1 ? 'set' : 'sets'} />
        <Stat value={formatVolume(workoutVolume(workout))} label="volume" />
      </StatGrid>
      <SaveStatus />

      {prs.length > 0 ? (
        <div className="rounded-lg border border-warning/30 bg-warning-soft p-3.5">
          <h4 className="text-sm font-semibold text-warning">🏆 New personal records</h4>
          <ItemGroup className="mt-1.5 gap-0">
            {prs.map((p, i) => (
              <Item key={p.exerciseId + i} role="listitem" size="xs" className="flex-nowrap px-0 py-1.5">
                <ItemContent className="min-w-0">
                  <ItemTitle className="w-full truncate font-normal">{exMap.get(p.exerciseId)?.name}</ItemTitle>
                </ItemContent>
                <ItemActions className="shrink-0 text-sm font-semibold tabular">
                  {p.weight > 0 ? `${formatW(p.weight)} × ${p.reps}` : `${p.reps} reps`}
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Saved. Next time you&apos;ll see today&apos;s numbers and a new target for each exercise.
        </p>
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
    <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-accent p-3.5">
      <div>
        <h4 className="text-sm font-semibold text-accent-foreground">
          {before ? `You changed ${day}’s workout` : `Make this ${day}’s workout?`}
        </h4>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {before ? `Save the changes so next ${day} starts like today:` : `Next ${day} will start with these exercises:`}
        </p>
      </div>
      <ItemGroup className="gap-0 divide-y divide-primary/10 rounded-md border border-primary/10 bg-background/60">
        {update.items.map((i, n) => {
          const o = old.get(i.exerciseId);
          const tag = !o ? 'new' : o.sets !== i.sets || o.reps !== i.reps ? 'changed' : '';
          return (
            <Item key={i.exerciseId + n} role="listitem" size="xs" className="flex-nowrap rounded-none px-3">
              <ItemContent className="min-w-0">
                <ItemTitle className="w-full truncate font-normal">{exMap.get(i.exerciseId)?.name ?? 'Exercise'}</ItemTitle>
              </ItemContent>
              <ItemActions className="shrink-0">
                {tag && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'h-4.5 px-1.5 text-[10px] uppercase',
                      tag === 'new' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning',
                    )}
                  >
                    {tag}
                  </Badge>
                )}
                <strong className="text-sm font-semibold tabular">
                  {i.sets} × {i.reps}
                </strong>
              </ItemActions>
            </Item>
          );
        })}
        {removed.map((i) => (
          <Item key={i.exerciseId} role="listitem" size="xs" className="flex-nowrap rounded-none px-3 text-muted-foreground">
            <ItemContent className="min-w-0">
              <ItemTitle className="w-full truncate font-normal line-through">{exMap.get(i.exerciseId)?.name ?? 'Exercise'}</ItemTitle>
            </ItemContent>
            <ItemActions className="shrink-0">
              <Badge variant="secondary" className="h-4.5 px-1.5 text-[10px] text-muted-foreground uppercase">
                removed
              </Badge>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
      <Button
        variant={saved ? 'outline' : 'default'}
        className="h-10 w-full"
        disabled={saved}
        onClick={() => {
          actions.savePlan(update);
          setSaved(true);
          toast.success(`Next ${day} will start like today`);
        }}
      >
        {saved ? (
          <>
            <Check /> {day}’s plan updated
          </>
        ) : (
          `Update ${day}’s plan`
        )}
      </Button>
    </div>
  );
}

/** "Saving to your account…" → "Saved to your account" under the workout stats. */
function SaveStatus() {
  const account = useAccount();
  const sync = useSyncStatus();
  if (!account) return null;
  const v =
    sync.state === 'syncing'
      ? { icon: <Loader2 className="size-4 animate-spin" />, text: 'Saving to your account…', tone: 'text-muted-foreground' }
      : sync.state === 'offline'
        ? { icon: <CloudOff className="size-4" />, text: 'Saved on this device — it will sync when you’re back online', tone: 'text-warning' }
        : sync.state === 'error'
          ? { icon: <CloudAlert className="size-4" />, text: 'Not saved to your account yet — retrying', tone: 'text-destructive' }
          : { icon: <CloudCheck className="size-4" />, text: 'Saved to your account', tone: 'text-success' };
  return (
    <p className={cn('flex items-center justify-center gap-1.5 text-xs font-medium', v.tone)} aria-live="polite">
      {v.icon}
      {v.text}
    </p>
  );
}
