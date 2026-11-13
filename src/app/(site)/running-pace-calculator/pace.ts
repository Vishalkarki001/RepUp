/** Pace maths shared by the calculator (client) and the pace chart (server). */

export const RACES = [
  { label: '5K', km: 5 },
  { label: '10K', km: 10 },
  { label: 'Half marathon', km: 21.0975 },
  { label: 'Marathon', km: 42.195 },
] as const;

/** Seconds → "m:ss" (pace). Rounds to the nearest second. */
export function fmtPace(sec: number): string {
  const t = Math.round(sec);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Seconds → "h:mm:ss", or "m:ss" under an hour. Rounds to the nearest second. */
export function fmtTime(sec: number): string {
  const t = Math.round(sec);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** Pace in seconds per km → speed in km/h, one decimal. */
export function kmh(paceSec: number): string {
  return (3600 / paceSec).toFixed(1);
}
