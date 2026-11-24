/**
 * One-rep max (1RM): the heaviest weight you could lift once, worked out from
 * a set you actually did (so nobody has to test a true max). Average of the two
 * common formulas, Epley and Brzycki, which agree well up to about 10 reps.
 * Used by the free calculator on /one-rep-max-calculator.
 */

/** Sets of more reps than this give a poor estimate. */
export const MAX_REPS = 12;

export function oneRepMax(weight: number, reps: number): number | null {
  if (!(weight > 0) || !Number.isInteger(reps) || reps < 1 || reps > MAX_REPS) return null;
  if (reps === 1) return weight;
  const epley = weight * (1 + reps / 30);
  const brzycki = (weight * 36) / (37 - reps);
  return (epley + brzycki) / 2;
}

/** The weight you can do `reps` times, from a 1RM (the same two formulas, the other way round). */
export function weightForReps(max: number, reps: number): number {
  if (reps <= 1) return max;
  const epley = max / (1 + reps / 30);
  const brzycki = (max * (37 - reps)) / 36;
  return (epley + brzycki) / 2;
}

/** Round to what you can load: 2.5 kg (1.25 kg plates) or 5 lb. */
export function roundToPlates(w: number, unit: 'kg' | 'lb' = 'kg'): number {
  const step = unit === 'kg' ? 2.5 : 5;
  return Math.round(w / step) * step;
}

export interface RepRow {
  reps: number;
  weight: number;
  /** Share of the 1RM, e.g. 81. */
  percent: number;
}

/** What you can lift for 1 to 12 reps. */
export function repTable(max: number, unit: 'kg' | 'lb' = 'kg'): RepRow[] {
  return Array.from({ length: MAX_REPS }, (_, i) => {
    const reps = i + 1;
    const w = weightForReps(max, reps);
    return { reps, weight: roundToPlates(w, unit), percent: Math.round((w / max) * 100) };
  });
}

/** Training zones by reps, with the weight range for this 1RM. */
export function zones(max: number, unit: 'kg' | 'lb' = 'kg') {
  const r = (reps: number) => roundToPlates(weightForReps(max, reps), unit);
  return [
    { name: 'Strength', reps: '1–5 reps', from: r(5), to: r(1) },
    { name: 'Muscle', reps: '6–12 reps', from: r(12), to: r(6) },
    { name: 'Endurance', reps: '15+ reps', from: roundToPlates(max * 0.5, unit), to: roundToPlates(max * 0.6, unit) },
  ];
}
