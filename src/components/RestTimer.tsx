import { useEffect, useRef } from 'react';
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
    <div className="rest-bar">
      <div className="rest-progress" style={{ width: `${pct}%` }} />
      <div className="rest-inner">
        <span className="rest-label">Rest</span>
        <span className="rest-time">{formatClock(remaining)}</span>
        <button className="btn small" onClick={() => actions.adjustRest(-15)}>
          −15
        </button>
        <button className="btn small" onClick={() => actions.adjustRest(15)}>
          +15
        </button>
        <button className="btn small primary" onClick={() => actions.stopRest()}>
          Skip
        </button>
      </div>
    </div>
  );
}
