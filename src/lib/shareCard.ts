/**
 * Share cards: a picture of a finished workout or run (1080 × 1350, fits
 * WhatsApp status and Instagram), made on the phone with a canvas and sent
 * through the share sheet. Every card carries RepUp's name and address, so a
 * friend who sees it can find the app.
 *
 * cardFor…() are plain functions (what goes on the card, tested);
 * shareCard() draws and shares it (browser only).
 * A run card shows the route's shape only, never a map, so it doesn't show
 * where someone lives.
 */
import { formatDuration, formatKm, formatPace, paceSecPerKm } from './run/core';
import type { PersonalRecord, RunEntry, Workout } from './types';
import { formatVolume, formatW, workoutSetCount, workoutVolume } from './utils';

export interface CardData {
  /** Small line above the title, e.g. "Monday, 23 November". */
  kicker: string;
  title: string;
  /** One big number, e.g. a run's distance. */
  big?: { value: string; unit: string };
  stats: { value: string; label: string }[];
  /** A workout's exercises with their best set; new personal bests marked. */
  lines?: { name: string; value: string; best: boolean }[];
  /** "+2 more exercises" under the list. */
  more?: string;
  /** e.g. "2 new personal bests". */
  bestsNote?: string;
  /** A run's route, [lat, lng] points. */
  route?: [number, number][];
}

export const SITE = 'getrepup.vercel.app';
const W = 1080;
const H = 1350;

const dayLine = (ms: number) => new Date(ms).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

function partOfDay(ms: number): string {
  const h = new Date(ms).getHours();
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : h < 21 ? 'Evening' : 'Night';
}

/** Lines that fit on the card under the numbers. */
const MAX_LINES = 6;

export function cardForWorkout(w: Workout, prs: PersonalRecord[], exerciseName: (id: string) => string): CardData {
  const sets = workoutSetCount(w);
  const prIds = new Set(prs.map((p) => p.exerciseId));
  const done = w.exercises
    .map((e) => ({ e, sets: e.sets.filter((x) => x.done && !x.warmup && (x.reps ?? 0) > 0) }))
    .filter((x) => x.sets.length);
  // Best set = heaviest, then most reps at that weight.
  const lines = done.map(({ e, sets: ss }) => {
    const top = ss.reduce((a, b) => ((b.weight ?? 0) > (a.weight ?? 0) || ((b.weight ?? 0) === (a.weight ?? 0) && (b.reps ?? 0) > (a.reps ?? 0)) ? b : a));
    return {
      name: exerciseName(e.exerciseId),
      value: (top.weight ?? 0) > 0 ? `${formatW(top.weight!)} × ${top.reps}` : `${top.reps} reps`,
      best: prIds.has(e.exerciseId),
    };
  });
  const extra = lines.length - MAX_LINES;
  return {
    kicker: dayLine(w.startedAt),
    title: w.name?.trim() || 'Workout',
    stats: [
      { value: String(w.exercises.length), label: w.exercises.length === 1 ? 'exercise' : 'exercises' },
      { value: String(sets), label: sets === 1 ? 'set' : 'sets' },
      { value: formatVolume(workoutVolume(w)), label: 'lifted' },
    ],
    lines: lines.slice(0, MAX_LINES),
    more: extra > 0 ? `+${extra} more ${extra === 1 ? 'exercise' : 'exercises'}` : undefined,
    bestsNote: prIds.size ? `${prIds.size} new personal ${prIds.size === 1 ? 'best' : 'bests'}` : undefined,
  };
}

export function cardForRun(run: RunEntry): CardData {
  const kind = run.kind === 'walk' ? 'walk' : 'run';
  const pace = paceSecPerKm(run.distanceM, run.durationS);
  const third =
    run.steps !== null && run.steps > 0
      ? { value: run.steps.toLocaleString('en-IN'), label: 'steps' }
      : { value: `~${run.calories}`, label: 'kcal' };
  return {
    kicker: dayLine(run.startedAt),
    title: `${partOfDay(run.startedAt)} ${kind}`,
    big: { value: formatKm(run.distanceM), unit: 'km' },
    stats: [
      { value: formatDuration(run.durationS), label: 'time' },
      { value: formatPace(pace), label: 'pace /km' },
      third,
    ],
    route: run.route && run.route.length > 1 ? run.route : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* drawing (browser only)                                               */
/* ------------------------------------------------------------------ */

const C = {
  bg: '#120d1f',
  panel: '#1d1730',
  text: '#ffffff',
  muted: '#a1a1b5',
  brand: '#a78bfa',
  line: '#8b5cf6',
  gold: '#fbbf24',
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Text cut with "…" to fit `max` pixels. */
function fit(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoute(ctx: CanvasRenderingContext2D, route: [number, number][], x: number, y: number, w: number, h: number) {
  // Flat projection is fine for a few km: scale longitude by cos(latitude).
  const k = Math.cos((route[0][0] * Math.PI) / 180);
  const pts = route.map(([lat, lng]) => [lng * k, -lat] as const);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const pad = 48;
  const scale = Math.min((w - pad * 2) / Math.max(maxX - minX, 1e-9), (h - pad * 2) / Math.max(maxY - minY, 1e-9));
  const ox = x + (w - (maxX - minX) * scale) / 2;
  const oy = y + (h - (maxY - minY) * scale) / 2;
  const at = (p: readonly [number, number]) => [ox + (p[0] - minX) * scale, oy + (p[1] - minY) * scale] as const;
  ctx.lineWidth = 10;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = C.line;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(...at(p)) : ctx.moveTo(...at(p))));
  ctx.stroke();
  const [ex, ey] = at(pts[pts.length - 1]);
  ctx.fillStyle = C.text;
  ctx.beginPath();
  ctx.arc(ex, ey, 12, 0, Math.PI * 2);
  ctx.fill();
}

export async function drawCard(data: CardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  await document.fonts?.ready;
  const family = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';
  const font = (size: number, weight = 500) => `${weight} ${size}px ${family}`;
  const M = 80; // side margin

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // Brand: icon + "RepUp"
  const icon = await loadImage('/icon-192.png?v=3');
  if (icon) ctx.drawImage(icon, M, 72, 72, 72);
  ctx.textBaseline = 'middle';
  ctx.font = font(46, 700);
  ctx.fillStyle = C.text;
  const tx = M + (icon ? 92 : 0);
  ctx.fillText('Rep', tx, 110);
  ctx.fillStyle = C.brand;
  ctx.fillText('Up', tx + ctx.measureText('Rep').width, 110);

  // Day + title
  ctx.textBaseline = 'alphabetic';
  let y = 250;
  ctx.font = font(36, 400);
  ctx.fillStyle = C.muted;
  ctx.fillText(data.kicker, M, y);
  y += 100;
  ctx.font = font(92, 600);
  ctx.fillStyle = C.text;
  ctx.fillText(fit(ctx, data.title, W - M * 2), M, y);

  // Big number (run distance)
  if (data.big) {
    y += 230;
    ctx.font = font(220, 600);
    ctx.fillText(data.big.value, M - 6, y);
    const bw = ctx.measureText(data.big.value).width;
    ctx.font = font(72, 500);
    ctx.fillStyle = C.muted;
    ctx.fillText(data.big.unit, M + bw + 16, y);
  }

  // Three stats
  y += 60;
  const gap = 24;
  const cw = (W - M * 2 - gap * 2) / 3;
  data.stats.slice(0, 3).forEach((s, i) => {
    const x = M + i * (cw + gap);
    ctx.fillStyle = C.panel;
    roundRect(ctx, x, y, cw, 190, 28);
    ctx.fill();
    ctx.font = font(60, 600);
    ctx.fillStyle = C.text;
    ctx.fillText(fit(ctx, s.value, cw - 56), x + 28, y + 96);
    ctx.font = font(32, 400);
    ctx.fillStyle = C.muted;
    ctx.fillText(fit(ctx, s.label, cw - 56), x + 28, y + 150);
  });
  y += 190 + 40;

  // Route shape, or personal bests
  const footerTop = H - 150;
  if (data.route) {
    const h = footerTop - y - 20;
    if (h > 160) {
      ctx.fillStyle = C.panel;
      roundRect(ctx, M, y, W - M * 2, h, 32);
      ctx.fill();
      drawRoute(ctx, data.route, M, y, W - M * 2, h);
    }
  } else if (data.lines?.length) {
    // Exercises with their best set; personal bests in gold with a trophy.
    const rowH = 76;
    const head = data.bestsNote ? 84 : 28;
    const h = head + data.lines.length * rowH + (data.more ? 64 : 12) + 16;
    ctx.fillStyle = C.panel;
    roundRect(ctx, M, y, W - M * 2, h, 32);
    ctx.fill();
    const L = M + 40;
    const R = W - M - 40;
    if (data.bestsNote) {
      ctx.font = font(36, 600);
      ctx.fillStyle = C.gold;
      ctx.fillText(`🏆 ${data.bestsNote}`, L, y + 66);
    }
    data.lines.forEach((l, i) => {
      const ly = y + head + rowH * i + 52;
      ctx.font = font(40, 600);
      ctx.fillStyle = l.best ? C.gold : C.text;
      ctx.textAlign = 'right';
      ctx.fillText(l.value, R, ly);
      const vw = ctx.measureText(l.value).width;
      ctx.textAlign = 'left';
      ctx.font = font(40, 400);
      ctx.fillStyle = l.best ? C.gold : C.text;
      ctx.fillText(fit(ctx, `${l.name}${l.best ? ' 🏆' : ''}`, R - L - vw - 32), L, ly);
    });
    if (data.more) {
      ctx.font = font(32, 400);
      ctx.fillStyle = C.muted;
      ctx.fillText(data.more, L, y + head + rowH * data.lines.length + 40);
    }
  }

  // Footer
  ctx.font = font(32, 400);
  ctx.fillStyle = C.muted;
  ctx.fillText('Tracked with RepUp', M, H - 80);
  ctx.textAlign = 'right';
  ctx.fillStyle = C.brand;
  ctx.fillText(SITE, W - M, H - 80);
  ctx.textAlign = 'left';
  return canvas;
}

/**
 * Draws the card and opens the share sheet (WhatsApp, Instagram…).
 * Where sharing pictures isn't possible (most computers) it downloads the picture.
 * Returns false if the person closed the share sheet.
 */
export async function shareCard(data: CardData, fileName: string): Promise<boolean> {
  const canvas = await drawCard(data);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
  if (!blob) throw new Error('could not make the picture');
  const file = new File([blob], fileName, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: `Tracked with RepUp: https://${SITE}` });
      return true;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return false;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return true;
}
