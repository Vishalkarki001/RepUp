import type { Equipment, RepRange, SetEntry } from './types';
import { formatW, unitLabel } from './utils';

/**
 * Double progression (the rule most coaches and apps like Strong/Hevy users follow):
 *  1. Keep the weight fixed and add reps inside a rep range (e.g. 8–12).
 *  2. When EVERY working set reaches the top of the range, add weight and
 *     drop back to the bottom of the range.
 */

export type TargetKind = 'increase' | 'reps' | 'bodyweight';

export interface SetTarget {
  weight: number;
  reps: number;
}

export interface Target {
  kind: TargetKind;
  message: string;
  /** Target for the n-th working set (index among non-warm-up sets). */
  forSet: (workingIndex: number) => SetTarget;
}

/** How much to add when it's time to go up: smallest common jump for that equipment. */
export function weightStep(equipment: Equipment): number {
  // Bodyweight exercises only reach this with added weight (dips/pull-ups with a belt).
  if (unitLabel() === 'lb') return 5;
  if (equipment === 'Dumbbell' || equipment === 'Kettlebell') return 2;
  return 2.5;
}

export function workingSets(sets: SetEntry[]): SetEntry[] {
  return sets.filter((s) => !s.warmup && s.done && (s.reps ?? 0) > 0);
}

export function suggestTarget(
  lastSets: SetEntry[] | null,
  range: RepRange,
  equipment: Equipment,
): Target | null {
  const working = lastSets ? workingSets(lastSets) : [];
  if (!working.length) return null;

  const top = Math.max(...working.map((s) => s.weight ?? 0));
  // "Goal reached" needs every working set at the goal — back-off sets included.
  const minReps = Math.min(...working.map((s) => s.reps ?? 0));
  const prev = (i: number) => working[Math.min(i, working.length - 1)];
  const prevReps = (i: number) => prev(i).reps ?? minReps;
  // Each set keeps its own weight from last time (e.g. 100 kg top set, 80 kg back-off sets).
  const prevWeight = (i: number) => prev(i).weight ?? top;

  if (top <= 0) {
    return {
      kind: 'bodyweight',
      message: 'Beat last time by 1 rep per set',
      forSet: (i) => ({ weight: 0, reps: prevReps(i) + 1 }),
    };
  }

  const step = weightStep(equipment);
  if (minReps >= range.repMax) {
    const next = top + step;
    return {
      kind: 'increase',
      message: `You hit ${range.repMax} reps on every set. Go up to ${formatW(next)} today!`,
      forSet: (i) => ({ weight: prevWeight(i) + step, reps: range.repMin }),
    };
  }

  return {
    kind: 'reps',
    message:
      range.repMin === range.repMax || minReps < range.repMin
        ? `Stay at ${formatW(top)} and try for ${range.repMin} reps on every set`
        : `Same ${formatW(top)}, add 1 rep per set (goal ${range.repMax})`,
    forSet: (i) => ({ weight: prevWeight(i), reps: Math.min(Math.max(range.repMin, prevReps(i) + 1), range.repMax) }),
  };
}

/** Compare a finished set with the same set last time. */
export function compareSet(cur: SetEntry, prev: SetEntry | undefined): 'up' | 'down' | 'same' | null {
  if (!prev || !cur.done) return null;
  const cw = cur.weight ?? 0;
  const pw = prev.weight ?? 0;
  const cr = cur.reps ?? 0;
  const pr = prev.reps ?? 0;
  if (cw === pw && cr === pr) return 'same';
  if (cw > pw || (cw === pw && cr > pr)) return 'up';
  return 'down';
}
