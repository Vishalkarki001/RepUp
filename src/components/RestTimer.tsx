import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { actions, useAppState } from '@/lib/store';
import { beep, formatClock, useNow } from '@/lib/utils';

export function RestTimer() {
  const { restEndsAt, restTotal } = useAppState();
  const now = useNow(250);
  const fired = useRef<number | null>(null);
  const remaining = restEndsAt ? restEndsAt - now : 0;

  useEffect(() => {
    if (restEndsAt && remaining <= 0 && fired.current !== restEndsAt) {
      fired.current = restEndsAt;
      beep();
      actions.stopRest();
    }
  }, [restEndsAt, remaining]);

  if (!restEndsAt || remaining <= 0) return null;
  const pct = Math.min(100, (remaining / (restTotal * 1000)) * 100);

  return (
    <div className="pointer-events-auto relative overflow-hidden rounded-xl border bg-popover shadow-lg" role="timer" aria-label="Rest timer">
      <div className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-300 ease-linear" style={{ width: `${pct}%` }} aria-hidden />
      <div className="relative flex items-center gap-1.5 px-3 py-2 sm:gap-2 sm:px-4">
        <span className="text-xs font-medium text-muted-foreground uppercase">Rest</span>
        <span className="min-w-0 flex-1 text-2xl font-semibold tracking-tight text-brand tabular">{formatClock(remaining)}</span>
        <Button variant="outline" size="sm" className="px-2 tabular" onClick={() => actions.adjustRest(-15)}>
          −15
        </Button>
        <Button variant="outline" size="sm" className="px-2 tabular" onClick={() => actions.adjustRest(15)}>
          +15
        </Button>
        <Button size="sm" onClick={() => actions.stopRest()}>
          Skip
        </Button>
      </div>
    </div>
  );
}
