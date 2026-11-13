'use client';

import { ChevronRight, Footprints, PersonStanding } from 'lucide-react';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { formatDuration, formatKm, formatPace, paceSecPerKm } from '@/lib/run/core';
import type { RunEntry, RunKind } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export const kindLabel = (k: RunKind) => (k === 'walk' ? 'Walk' : 'Run');

export function KindIcon({ kind, className }: { kind: RunKind; className?: string }) {
  return kind === 'walk' ? <PersonStanding className={className} /> : <Footprints className={className} />;
}

/** One run in a list: distance, date, time and pace. Tap to open. */
export function RunRow({ run, onOpen }: { run: RunEntry; onOpen: () => void }) {
  return (
    <Item asChild size="sm" className="flex-nowrap rounded-none px-4 text-left hover:bg-muted/50">
      <button type="button" onClick={onOpen}>
        <ItemMedia variant="icon" className="size-9 rounded-full bg-accent text-accent-foreground">
          <KindIcon kind={run.kind} />
        </ItemMedia>
        <ItemContent className="min-w-0 gap-0.5">
          <ItemTitle className="w-full truncate">
            {formatKm(run.distanceM)} km {kindLabel(run.kind).toLowerCase()}
            {run.source === 'manual' && <span className="font-normal text-muted-foreground"> · added by hand</span>}
          </ItemTitle>
          <ItemDescription className="truncate text-xs tabular">
            {formatDate(run.startedAt)} · {formatDuration(run.durationS)} · {formatPace(paceSecPerKm(run.distanceM, run.durationS))} /km
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="size-4 text-muted-foreground/60" />
        </ItemActions>
      </button>
    </Item>
  );
}
