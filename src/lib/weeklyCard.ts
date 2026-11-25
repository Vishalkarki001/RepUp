/**
 * The share picture for a week ("My week"). Browser side only (uses the app's
 * kg / lb formatting); the numbers come from weekReport() in weekly.ts.
 */
import { formatDuration, formatPace } from './run/core';
import type { CardData } from './shareCard';
import { formatVolume, formatW } from './utils';
import { weekLabel, type WeekReport } from './weekly';

const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');

/** The share picture for a week: three numbers, then personal bests or a few highlights. */
export function cardForWeek(r: WeekReport, name: (id: string) => string): CardData {
  const stats: CardData['stats'] = [];
  if (r.gym) stats.push({ value: String(r.gym.days), label: r.gym.days === 1 ? 'gym day' : 'gym days' });
  if (r.run) stats.push({ value: r.run.km.toFixed(1), label: 'km run' });
  if (r.food) stats.push({ value: `${r.food.daysLogged}/7`, label: 'food days' });
  if (r.gym && stats.length < 3) stats.push({ value: String(r.gym.sets), label: 'sets' });
  if (r.gym && stats.length < 3) stats.push({ value: formatVolume(r.gym.volume), label: 'lifted' });
  if (r.run && stats.length < 3) stats.push({ value: formatDuration(r.run.seconds), label: 'running time' });

  const lines: NonNullable<CardData['lines']> = [];
  for (const b of r.gym?.bests.slice(0, 4) ?? []) lines.push({ name: name(b.exerciseId), value: b.weight > 0 ? `${formatW(b.weight)} × ${b.reps}` : `${b.reps} reps`, best: true });
  if (r.run && lines.length < 6) lines.push({ name: 'Longest run', value: `${r.run.longestKm.toFixed(1)} km`, best: false });
  if (r.run?.bestPace && lines.length < 6) lines.push({ name: 'Best pace', value: `${formatPace(r.run.bestPace)} /km`, best: false });
  if (r.food && lines.length < 6) lines.push({ name: 'Calories a day', value: `${fmt(r.food.avgKcal)} kcal`, best: false });
  if (r.weight && lines.length < 6) lines.push({ name: 'Weight', value: `${r.weight.to} kg`, best: false });
  const bests = r.gym?.bests.length ?? 0;
  return {
    kicker: weekLabel(r.start),
    title: 'My week',
    stats: stats.slice(0, 3),
    lines,
    bestsNote: bests ? `${bests} new personal ${bests === 1 ? 'best' : 'bests'}` : undefined,
  };
}
